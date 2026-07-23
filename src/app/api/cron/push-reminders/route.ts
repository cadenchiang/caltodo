/**
 * GET /api/cron/push-reminders
 *
 * Runs every 15 minutes. For each enabled notification rule:
 *  - before_deadline: find the user's tasks whose due moment falls inside
 *    [now + minutes_before - 7m, now + minutes_before + 8m] and dispatch
 *    a push for any not yet recorded in notification_dispatches.
 *  - daily_digest: if the rule's time_of_day in the rule's timezone has
 *    just passed (within the last 15m) and we haven't dispatched today's
 *    bucket yet, send a digest of the user's open tasks for today.
 *
 * Dedup is via UNIQUE (rule_id, task_id, bucket) on notification_dispatches.
 * Protected by CRON_SECRET.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push/web-push";
import { logger } from "@/lib/logger";
import type { NotificationRule } from "@/lib/notifications/types";
import {
  formatLead,
  nowInTz,
  parseDueAt,
  uniqueDays,
} from "@/lib/notifications/cron-helpers";

/** Plus/minus minutes around the target moment we still consider "match". */
const REMINDER_WINDOW_BEFORE_MIN = 7;
const REMINDER_WINDOW_AFTER_MIN = 8;

/** Minutes window after a digest's scheduled time-of-day in which we'll fire. */
const DIGEST_WINDOW_MIN = 15;

/** Parallel rule processing cap — keeps us inside Vercel's per-request timeout. */
const CONCURRENCY = 3;

/** Drop dispatch-log rows older than this so the table doesn't grow forever. */
const DISPATCH_TTL_DAYS = 30;

/**
 * Hard-delete completed tasks whose completed_at is older than this many
 * days. Reduces Supabase storage and keeps the tasks table small. The 30-day
 * window matches the indicator shown in the client's Archive section.
 */
const ARCHIVE_PURGE_DAYS = 30;

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  due_date: string;
  due_time: string | null;
}

interface SubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function GET(request: NextRequest) {
  // Fail CLOSED: this endpoint sends push to all users and purges old
  // completed tasks + dispatch rows, so it must never be publicly invocable.
  // Previously a missing CRON_SECRET skipped the check entirely (fail-open).
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  const { data: rules, error: rulesErr } = await supabase
    .from("notification_rules")
    .select("*")
    .eq("enabled", true);
  if (rulesErr) {
    logger.error("cron/push-reminders: rules query failed", { error: rulesErr.message });
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
  if (!rules || rules.length === 0) {
    return NextResponse.json({ scanned: 0, sent: 0 });
  }

  // Cleanup stale dispatch rows in the background — cheap, runs every tick.
  const cutoff = new Date(now.getTime() - DISPATCH_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  void supabase.from("notification_dispatches").delete().lt("sent_at", cutoff);

  // Purge old completed tasks (>30 days) to keep Supabase storage bounded.
  // Runs as a fire-and-forget query so it never blocks the cron timeout.
  // Errors are logged but non-fatal.
  const archiveCutoff = new Date(
    now.getTime() - ARCHIVE_PURGE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  void supabase
    .from("tasks")
    .delete()
    .eq("is_completed", true)
    .lt("completed_at", archiveCutoff)
    .then(({ error, count }) => {
      if (error) {
        logger.error("cron/push-reminders: archive purge failed", {
          error: error.message,
          cutoff: archiveCutoff,
        });
      } else {
        logger.info("cron/push-reminders: archive purge ok", {
          deleted: count ?? 0,
          cutoff: archiveCutoff,
        });
      }
    });

  let sent = 0;
  let dropped = 0;

  /** Processes a single rule, swallowing errors so the pool doesn't abort. */
  async function processOne(rule: NotificationRule) {
    try {
      if (rule.kind === "before_deadline" && rule.minutes_before) {
        sent += await processBeforeDeadline(supabase, rule, now, (n) => { dropped += n; });
      } else if (rule.kind === "daily_digest" && rule.time_of_day) {
        sent += await processDailyDigest(supabase, rule, now, (n) => { dropped += n; });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("cron/push-reminders: rule processing failed", { ruleId: rule.id, error: msg });
    }
  }

  // Worker pool — mirrors src/app/api/cron/gcal-sync/route.ts pattern.
  const queue = [...(rules as NotificationRule[])];
  const running: Set<Promise<void>> = new Set();
  while (queue.length > 0 || running.size > 0) {
    while (queue.length > 0 && running.size < CONCURRENCY) {
      const rule = queue.shift()!;
      const p = processOne(rule).then(() => { running.delete(p); });
      running.add(p);
    }
    if (running.size > 0) await Promise.race(running);
  }

  logger.info("cron/push-reminders: completed", { rules: rules.length, sent, dropped });
  return NextResponse.json({ rules: rules.length, sent, dropped });
}

/** Fetches all push subscriptions for a user. Returns [] if none. */
async function loadSubs(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<SubscriptionRow[]> {
  const { data } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);
  return (data as SubscriptionRow[]) ?? [];
}

/**
 * Sends a single payload to every device a user has registered, deletes
 * dead subscriptions, and reports the count of dropped subs to the caller.
 *
 * @returns true if at least one device received the push.
 */
async function fanout(
  supabase: ReturnType<typeof createAdminClient>,
  subs: SubscriptionRow[],
  payload: { title: string; body: string; url?: string; tag?: string },
  onDrop: (n: number) => void
): Promise<boolean> {
  let any = false;
  let drops = 0;
  for (const s of subs) {
    const r = await sendPush(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      payload
    );
    if (r.ok) any = true;
    else if (r.gone) {
      await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      drops++;
    }
  }
  if (drops > 0) onDrop(drops);
  return any;
}

/**
 * For a "before_deadline" rule: scans the user's open tasks whose due
 * timestamp lies in the firing window, sends pushes, and records dispatch
 * rows so we never re-send the same (rule, task) pair.
 *
 * @returns number of tasks for which a push was successfully dispatched.
 */
async function processBeforeDeadline(
  supabase: ReturnType<typeof createAdminClient>,
  rule: NotificationRule,
  now: Date,
  onDrop: (n: number) => void
): Promise<number> {
  const offsetMs = (rule.minutes_before ?? 0) * 60_000;
  const target = new Date(now.getTime() + offsetMs);
  const lo = new Date(target.getTime() - REMINDER_WINDOW_BEFORE_MIN * 60_000);
  const hi = new Date(target.getTime() + REMINDER_WINDOW_AFTER_MIN * 60_000);

  // Pull a small candidate set: tasks for this user whose due_date is within
  // the broader day window of [lo, hi].
  const days = uniqueDays([lo, hi]);
  const nowIso = now.toISOString();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, due_date, due_time")
    .eq("user_id", rule.user_id)
    .eq("is_completed", false)
    .is("dismissed_at", null)
    .or(`snoozed_until.is.null,snoozed_until.lt.${nowIso}`)
    .in("due_date", days);
  if (!tasks || tasks.length === 0) return 0;

  // Filter by exact due moment.
  const eligible = (tasks as TaskRow[]).filter((t) => {
    const at = parseDueAt(t.due_date, t.due_time, rule.timezone);
    return at !== null && at >= lo && at <= hi;
  });
  if (eligible.length === 0) return 0;

  // Skip already-dispatched (rule, task) pairs.
  const ids = eligible.map((t) => t.id);
  const { data: already } = await supabase
    .from("notification_dispatches")
    .select("task_id")
    .eq("rule_id", rule.id)
    .in("task_id", ids);
  const sentIds = new Set((already ?? []).map((r) => r.task_id as string));
  const todo = eligible.filter((t) => !sentIds.has(t.id));
  if (todo.length === 0) return 0;

  const subs = await loadSubs(supabase, rule.user_id);
  let sentCount = 0;
  for (const task of todo) {
    const at = parseDueAt(task.due_date, task.due_time, rule.timezone)!;
    const minutesAway = Math.max(1, Math.round((at.getTime() - now.getTime()) / 60_000));
    const body = formatLead(minutesAway);
    const delivered =
      subs.length > 0 &&
      (await fanout(
        supabase,
        subs,
        { title: task.title || "Upcoming deadline", body, url: "/app/today", tag: `task-${task.id}` },
        onDrop
      ));
    // Always record the dispatch so we don't loop even if no subs.
    await supabase.from("notification_dispatches").insert({
      user_id: rule.user_id,
      rule_id: rule.id,
      task_id: task.id,
      bucket: "",
    });
    if (delivered) sentCount++;
  }
  return sentCount;
}

/**
 * For a "daily_digest" rule: if the configured time-of-day in the rule's
 * timezone is within the last DIGEST_WINDOW_MIN minutes and we haven't
 * already dispatched today's bucket, send a summary push of the user's
 * open tasks due today.
 *
 * @returns 1 if a digest was sent, else 0.
 */
async function processDailyDigest(
  supabase: ReturnType<typeof createAdminClient>,
  rule: NotificationRule,
  now: Date,
  onDrop: (n: number) => void
): Promise<number> {
  const local = nowInTz(now, rule.timezone);
  const [hh, mm] = (rule.time_of_day ?? "08:00").split(":").map(Number);
  const scheduledMin = hh * 60 + mm;
  const localMin = local.hours * 60 + local.minutes;
  const diff = localMin - scheduledMin;
  if (diff < 0 || diff > DIGEST_WINDOW_MIN) return 0;

  const bucket = local.dateIso; // YYYY-MM-DD in user TZ
  const { data: existing } = await supabase
    .from("notification_dispatches")
    .select("id")
    .eq("rule_id", rule.id)
    .eq("bucket", bucket)
    .is("task_id", null)
    .limit(1);
  if (existing && existing.length > 0) return 0;

  const nowIso = now.toISOString();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, due_time")
    .eq("user_id", rule.user_id)
    .eq("is_completed", false)
    .is("dismissed_at", null)
    .or(`snoozed_until.is.null,snoozed_until.lt.${nowIso}`)
    .eq("due_date", bucket);
  const count = tasks?.length ?? 0;
  const body =
    count === 0
      ? "No tasks due today."
      : count === 1
        ? `1 task due today: ${(tasks![0] as { title: string }).title}`
        : `${count} tasks due today.`;

  const subs = await loadSubs(supabase, rule.user_id);
  const delivered =
    subs.length > 0 &&
    (await fanout(
      supabase,
      subs,
      { title: "Today's deadlines", body, url: "/app/today", tag: `digest-${bucket}` },
      onDrop
    ));
  await supabase.from("notification_dispatches").insert({
    user_id: rule.user_id,
    rule_id: rule.id,
    task_id: null,
    bucket,
  });
  return delivered ? 1 : 0;
}

