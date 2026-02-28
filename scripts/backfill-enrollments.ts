/**
 * One-time backfill script: enrolls all existing users into the courses
 * and course_memberships tables based on their selected courses in
 * integration_credentials.
 *
 * READ-ONLY on existing tables. Only writes to the new courses +
 * course_memberships tables.
 *
 * Usage: npx tsx scripts/backfill-enrollments.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface CredRow {
  user_id: string;
  selected_canvas_courses: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses: Array<{ id: string; name: string }> | null;
  selected_pensieve_courses: Array<{ id: string; name: string }> | null;
  additional_canvas_accounts: Array<{
    id: string;
    selected_courses: Array<{ id: number; name: string }> | null;
  }> | null;
}

async function main() {
  console.log("Fetching all integration_credentials (read-only)...");

  // Paginate through all credentials
  let allCreds: CredRow[] = [];
  let offset = 0;
  const pageSize = 500;

  while (true) {
    const { data, error } = await admin
      .from("integration_credentials")
      .select("user_id, selected_canvas_courses, selected_gradescope_courses, selected_pensieve_courses, additional_canvas_accounts")
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Failed to fetch credentials:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    allCreds = allCreds.concat(data as CredRow[]);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  console.log(`Found ${allCreds.length} users with credentials`);

  // Gather all unique courses and per-user enrollments
  const courseMap = new Map<string, { source: string; external_id: string; name: string }>();
  const enrollments: Array<{ userId: string; courseKey: string }> = [];

  for (const cred of allCreds) {
    // Canvas courses
    if (cred.selected_canvas_courses) {
      for (const c of cred.selected_canvas_courses) {
        const key = `canvas:${c.id}`;
        courseMap.set(key, { source: "canvas", external_id: String(c.id), name: c.name });
        enrollments.push({ userId: cred.user_id, courseKey: key });
      }
    }

    // Gradescope courses
    if (cred.selected_gradescope_courses) {
      for (const c of cred.selected_gradescope_courses) {
        const key = `gradescope:${c.id}`;
        courseMap.set(key, { source: "gradescope", external_id: c.id, name: c.name });
        enrollments.push({ userId: cred.user_id, courseKey: key });
      }
    }

    // Pensieve courses
    if (cred.selected_pensieve_courses) {
      for (const c of cred.selected_pensieve_courses) {
        const key = `pensieve:${c.id}`;
        courseMap.set(key, { source: "pensieve", external_id: c.id, name: c.name });
        enrollments.push({ userId: cred.user_id, courseKey: key });
      }
    }

    // Additional Canvas accounts
    if (cred.additional_canvas_accounts) {
      for (const account of cred.additional_canvas_accounts) {
        if (account.selected_courses) {
          for (const c of account.selected_courses) {
            const key = `canvas:${account.id}:${c.id}`;
            courseMap.set(key, { source: "canvas", external_id: `${account.id}:${c.id}`, name: c.name });
            enrollments.push({ userId: cred.user_id, courseKey: key });
          }
        }
      }
    }
  }

  console.log(`Found ${courseMap.size} unique courses, ${enrollments.length} total enrollments`);

  // Upsert courses in batches
  const courseRows = Array.from(courseMap.values());
  const BATCH = 50;

  for (let i = 0; i < courseRows.length; i += BATCH) {
    const batch = courseRows.slice(i, i + BATCH);
    const { error } = await admin
      .from("courses")
      .upsert(batch, { onConflict: "source,external_id" });

    if (error) {
      console.error(`Course upsert batch ${i} failed:`, error.message);
    }
  }
  console.log(`Upserted ${courseRows.length} courses`);

  // Build course key → UUID map
  const courseIdMap = new Map<string, string>();
  for (const [key, c] of courseMap) {
    const { data } = await admin
      .from("courses")
      .select("id")
      .eq("source", c.source)
      .eq("external_id", c.external_id)
      .single();

    if (data) courseIdMap.set(key, data.id);
  }

  console.log(`Resolved ${courseIdMap.size} course UUIDs`);

  // Upsert memberships in batches
  const membershipRows = enrollments
    .filter((e) => courseIdMap.has(e.courseKey))
    .map((e) => ({
      user_id: e.userId,
      course_id: courseIdMap.get(e.courseKey)!,
    }));

  let created = 0;
  for (let i = 0; i < membershipRows.length; i += BATCH) {
    const batch = membershipRows.slice(i, i + BATCH);
    const { error } = await admin
      .from("course_memberships")
      .upsert(batch, { onConflict: "user_id,course_id", ignoreDuplicates: true });

    if (error) {
      console.error(`Membership upsert batch ${i} failed:`, error.message);
    } else {
      created += batch.length;
    }
  }

  console.log(`Upserted ${created} memberships`);
  console.log("Backfill complete!");
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
