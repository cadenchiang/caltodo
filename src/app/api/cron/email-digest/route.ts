/**
 * GET /api/cron/email-digest
 *
 * Daily cron job that sends email digest to all users.
 * Includes tasks due today, tomorrow, and overdue tasks.
 * Protected by CRON_SECRET (set automatically by Vercel).
 * Sends concurrently in batches to stay within Vercel timeout.
 *
 * @returns { sent, skipped, errors } summary stats
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDigestEmail } from "@/lib/email-digest";
import { logger } from "@/lib/logger";
import type { User } from "@supabase/supabase-js";

/** Users per page when fetching from Supabase Auth. */
const PAGE_SIZE = 1000;

/** Send emails in parallel batches of this size (Resend allows ~10/sec). */
const BATCH_SIZE = 8;

/** Small delay between batches to respect rate limits. */
const BATCH_DELAY_MS = 50;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Paginate through all users
  const allUsers: User[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE });

    if (error || !data?.users) {
      logger.error("cron/email-digest: failed to fetch users", { page, error: error?.message });
      break;
    }

    allUsers.push(...data.users);
    if (data.users.length < PAGE_SIZE) break;
    page++;
  }

  if (allUsers.length === 0) {
    return NextResponse.json({ error: "No users found" }, { status: 500 });
  }

  // Get user digest preferences in batches of 200 to avoid URL length limits
  const prefsMap = new Map<string, { email_digest_enabled: boolean | null; email_digest_address: string | null }>();
  const userIds = allUsers.map((u) => u.id);

  for (let i = 0; i < userIds.length; i += 200) {
    const batch = userIds.slice(i, i + 200);
    const { data: prefs } = await supabase
      .from("integration_credentials")
      .select("user_id, email_digest_enabled, email_digest_address")
      .in("user_id", batch);

    for (const r of prefs ?? []) {
      prefsMap.set(r.user_id, r);
    }
  }

  // Filter: all users with email, unless they explicitly disabled digest
  const users = allUsers.filter((u) => {
    if (!u.email) return false;
    const pref = prefsMap.get(u.id);
    if (pref?.email_digest_enabled === false) return false;
    return true;
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Process users in parallel batches
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (user) => {
        // Fetch user's active tasks due today, tomorrow, or overdue
        const { data: tasks, error: taskError } = await supabase
          .from("tasks")
          .select("title, due_date, due_time, course_name, points_possible, is_completed, source_url")
          .eq("user_id", user.id)
          .is("dismissed_at", null)
          .eq("is_completed", false)
          .not("due_date", "is", null)
          .lte("due_date", tomorrowStr)
          .order("due_date", { ascending: true });

        if (taskError) {
          throw new Error(`tasks query: ${taskError.message}`);
        }

        if (!tasks || tasks.length === 0) {
          return "skipped";
        }

        const overdue = tasks.filter((t) => t.due_date && t.due_date < todayStr);
        const dueToday = tasks.filter((t) => t.due_date === todayStr);
        const dueTomorrow = tasks.filter((t) => t.due_date === tomorrowStr);

        if (overdue.length === 0 && dueToday.length === 0 && dueTomorrow.length === 0) {
          return "skipped";
        }

        const firstName = user.user_metadata?.full_name?.split(" ")[0]
          || user.user_metadata?.name?.split(" ")[0]
          || "there";

        const pref = prefsMap.get(user.id);
        const recipientEmail = pref?.email_digest_address || user.email!;
        const success = await sendDigestEmail(recipientEmail, firstName, {
          overdue,
          dueToday,
          dueTomorrow,
        });

        if (!success) throw new Error("email send failed");
        return "sent";
      })
    );

    // Tally results
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "fulfilled") {
        if (result.value === "sent") sent++;
        else skipped++;
      } else {
        errors.push(`${batch[j].id}: ${result.reason?.message ?? "unknown"}`);
      }
    }

    // Brief delay between batches to stay under rate limits
    if (i + BATCH_SIZE < users.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  logger.info("cron/email-digest: completed", { total: users.length, sent, skipped, errorCount: errors.length });

  return NextResponse.json({ total: users.length, sent, skipped, errors: errors.length });
}
