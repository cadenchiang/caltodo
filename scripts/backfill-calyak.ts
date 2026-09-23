/**
 * One-time backfill: enroll every auth.users row into the global CalYak
 * course. Safe to run repeatedly (upsert with onConflict:user_id,course_id).
 *
 * Why this is needed: migration 20260227000003 renamed the course
 * external_id from 'caltodo-fam' to 'caltodo-yak', but the auto-enroll
 * trigger (20260226000020) still referenced the old id. Every signup
 * since the rename silently failed to enroll. Users who never visited
 * /app/discussions (which has an API fallback enroll) were never added.
 *
 * This script only INSERTs — soft-deleted memberships are also
 * reactivated so users who previously left are brought back in.
 *
 * Usage: npx tsx scripts/backfill-calyak.ts
 *
 * Required env (read from .env.local via dotenv/config):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

/** Minimal .env.local loader — avoids requiring dotenv-cli. */
function loadEnvLocal(): void {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local absent — fall through to existing process.env
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main(): Promise<void> {
  console.log("[backfill-calyak] Looking up CalYak course...");

  const { data: course, error: courseErr } = await admin
    .from("courses")
    .select("id, name, external_id")
    .eq("source", "system")
    .eq("external_id", "caltodo-yak")
    .single();

  if (courseErr || !course) {
    console.error("[backfill-calyak] Could not find CalYak course:", courseErr);
    process.exit(1);
  }

  const courseId = course.id as string;
  console.log(`[backfill-calyak] CalYak course id: ${courseId} (name: ${course.name})`);

  // Page through auth.users via admin API
  console.log("[backfill-calyak] Listing all users...");
  const allUserIds: string[] = [];
  const perPage = 1000;
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("[backfill-calyak] listUsers failed:", error);
      process.exit(1);
    }
    const users = data.users ?? [];
    for (const u of users) allUserIds.push(u.id);
    if (users.length < perPage) break;
    page += 1;
  }
  console.log(`[backfill-calyak] Total users: ${allUserIds.length}`);

  // Count existing memberships (including soft-deleted)
  const { count: beforeActive } = await admin
    .from("course_memberships")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .is("deleted_at", null);
  console.log(`[backfill-calyak] Existing active CalYak members: ${beforeActive ?? "?"}`);

  // Reactivate any soft-deleted memberships
  const { error: reactivateErr, count: reactivatedCount } = await admin
    .from("course_memberships")
    .update({ deleted_at: null }, { count: "exact" })
    .eq("course_id", courseId)
    .not("deleted_at", "is", null);
  if (reactivateErr) {
    console.error("[backfill-calyak] Reactivate step failed:", reactivateErr);
    process.exit(1);
  }
  console.log(`[backfill-calyak] Reactivated soft-deleted: ${reactivatedCount ?? 0}`);

  // Upsert memberships in chunks of 500 to stay under row-size limits
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < allUserIds.length; i += chunkSize) {
    const chunk = allUserIds.slice(i, i + chunkSize).map((user_id) => ({
      user_id,
      course_id: courseId,
    }));
    const { error: upsertErr } = await admin
      .from("course_memberships")
      .upsert(chunk, { onConflict: "user_id,course_id", ignoreDuplicates: true });
    if (upsertErr) {
      console.error(`[backfill-calyak] upsert chunk ${i}-${i + chunk.length} failed:`, upsertErr);
      process.exit(1);
    }
    inserted += chunk.length;
    console.log(`[backfill-calyak] Upserted chunk ${i}-${i + chunk.length} (cumulative ${inserted})`);
  }

  const { count: afterActive } = await admin
    .from("course_memberships")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .is("deleted_at", null);
  console.log(`[backfill-calyak] Final active CalYak members: ${afterActive ?? "?"}`);
  console.log(`[backfill-calyak] Delta: +${(afterActive ?? 0) - (beforeActive ?? 0)}`);
  console.log("[backfill-calyak] Done.");
}

main().catch((err) => {
  console.error("[backfill-calyak] Fatal:", err);
  process.exit(1);
});
