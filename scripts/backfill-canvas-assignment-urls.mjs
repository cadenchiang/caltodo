// Rewrites Canvas calendar-feed URLs on existing tasks into direct assignment
// links, matching what canvas-ical-client now produces at parse time.
//
// The iCal feed points every event at the calendar month view with an anchor
// (".../calendar?include_contexts=course_123&month=09&year=2026#assignment_456"),
// so "Open assignment" landed on a month grid rather than the assignment. New
// syncs are fixed, but rows already stored keep the old URL until the owning
// user happens to sync again, which for a dormant account may be never.
//
// Run:  node scripts/backfill-canvas-assignment-urls.mjs          (dry run)
//       node scripts/backfill-canvas-assignment-urls.mjs --apply  (writes)

import { readFileSync } from "node:fs";

/** Rows updated per request. Keeps each PATCH small and restartable. */
const BATCH_SIZE = 200;

/**
 * Reads the local Supabase service credentials.
 *
 * @returns The project URL and service role key
 * @throws Error when either is missing from .env.local
 */
function readEnv() {
  const raw = readFileSync(".env.local", "utf8");
  const env = Object.fromEntries(
    raw
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase URL or service role key in .env.local");
  return { url, key };
}

/**
 * Rewrites one calendar-feed URL into a direct assignment link.
 *
 * Mirrors toAssignmentUrl in src/lib/canvas-ical-client.ts. Kept as a copy
 * because this script runs outside the Next build and must not import TS.
 *
 * @param calendarUrl - Stored source_url
 * @param externalId - The task's external_id, used when the anchor is absent
 * @returns The rewritten URL, or null when it should be left alone
 */
function toAssignmentUrl(calendarUrl, externalId) {
  if (!calendarUrl || !calendarUrl.includes("/calendar")) return null;

  const course = calendarUrl.match(/include_contexts=course_(\d+)/)?.[1];
  const assignment = calendarUrl.match(/#assignment_(\d+)/)?.[1] ?? externalId;
  if (!course || !/^\d+$/.test(String(assignment ?? ""))) return null;

  try {
    const origin = new URL(calendarUrl).origin;
    return `${origin}/courses/${course}/assignments/${assignment}`;
  } catch {
    return null;
  }
}

const apply = process.argv.includes("--apply");
const { url, key } = readEnv();
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

let offset = 0;
let scanned = 0;
let rewritten = 0;
let skipped = 0;
const samples = [];

for (;;) {
  const res = await fetch(
    `${url}/rest/v1/tasks?select=id,external_id,source_url&source=eq.canvas` +
      `&source_url=like.*%2Fcalendar%3F*&order=id&limit=${BATCH_SIZE}&offset=${offset}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Read failed: ${res.status} ${await res.text()}`);

  const rows = await res.json();
  if (rows.length === 0) break;
  scanned += rows.length;

  for (const row of rows) {
    const next = toAssignmentUrl(row.source_url, row.external_id);
    if (!next) {
      skipped += 1;
      continue;
    }
    if (samples.length < 3) samples.push(`${row.source_url}\n      -> ${next}`);

    if (apply) {
      const patch = await fetch(`${url}/rest/v1/tasks?id=eq.${row.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ source_url: next }),
      });
      if (!patch.ok) throw new Error(`Write failed for ${row.id}: ${patch.status}`);
    }
    rewritten += 1;
  }

  // When applying, rows stop matching the filter, so the window stays at 0.
  if (!apply) offset += rows.length;
  process.stdout.write(`\r  scanned ${scanned}, rewritable ${rewritten}, skipped ${skipped}`);
}

console.log("\n");
for (const s of samples) console.log("  ", s, "\n");
console.log(apply ? `Applied ${rewritten} updates.` : `Dry run: ${rewritten} rows would change, ${skipped} left alone.`);
