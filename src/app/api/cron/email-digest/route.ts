/**
 * GET /api/cron/email-digest
 *
 * Daily cron job that sends email digest to all users.
 * Includes tasks due today, tomorrow, and overdue tasks.
 * Protected by CRON_SECRET (set automatically by Vercel).
 *
 * @returns { sent, skipped, errors } summary stats
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDigestEmail } from "@/lib/email-digest";
import { logger } from "@/lib/logger";

/** Max users to process per cron run to stay within Vercel timeout. */
const MAX_USERS = 200;

/** Delay between emails to respect Resend rate limits (~10/sec). */
const SEND_DELAY_MS = 120;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get all users with email addresses
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: MAX_USERS,
  });

  if (authError || !authData?.users) {
    logger.error("cron/email-digest: failed to fetch users", { error: authError?.message });
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  // Get user digest preferences (enabled, preferred hour, custom email)
  const currentHourUtc = new Date().getUTCHours();
  const userIds = authData.users.map((u) => u.id);
  const { data: prefs } = await supabase
    .from("integration_credentials")
    .select("user_id, email_digest_enabled, email_digest_hour, email_digest_address")
    .in("user_id", userIds);

  const prefsMap = new Map((prefs ?? []).map((r) => [r.user_id, r]));

  // Filter to users whose preferred hour matches now (default 14 UTC = 7 AM PDT)
  const users = authData.users.filter((u) => {
    if (!u.email) return false;
    const pref = prefsMap.get(u.id);
    if (pref?.email_digest_enabled === false) return false;
    const preferredHour = pref?.email_digest_hour ?? 14;
    return preferredHour === currentHourUtc;
  });
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const user of users) {
    try {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      // Fetch user's active tasks
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
        errors.push(`${user.id}: ${taskError.message}`);
        continue;
      }

      if (!tasks || tasks.length === 0) {
        skipped++;
        continue;
      }

      // Split into overdue, today, and tomorrow
      const overdue = tasks.filter((t) => t.due_date && t.due_date < todayStr);
      const dueToday = tasks.filter((t) => t.due_date === todayStr);
      const dueTomorrow = tasks.filter((t) => t.due_date === tomorrowStr);

      if (overdue.length === 0 && dueToday.length === 0 && dueTomorrow.length === 0) {
        skipped++;
        continue;
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

      if (success) {
        sent++;
      } else {
        errors.push(`${user.id}: email send failed`);
      }

      // Rate limit delay
      await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${user.id}: ${msg}`);
      logger.error("cron/email-digest: user processing failed", { userId: user.id, error: msg });
    }
  }

  logger.info("cron/email-digest: completed", { total: users.length, sent, skipped, errorCount: errors.length });

  return NextResponse.json({ total: users.length, sent, skipped, errors: errors.length });
}
