/**
 * GET /api/cron/gcal-sync
 *
 * Daily cron job that maintains Google Calendar sync health:
 * 1. Renews watch channels expiring within 24 hours
 * 2. Performs a bounded full sync (fresh sync token) for users whose last
 *    full sync was >24 hours ago
 *
 * Stops cleanly at TIME_BUDGET_MS; users not reached are logged and picked
 * up next run. A user whose watch registration fails is stamped with
 * gcal_watch_failed_at and sorts to the back of the queue.
 *
 * Protected by CRON_SECRET (set automatically by Vercel).
 * Uses admin Supabase client (no user session).
 *
 * @returns { renewed, synced, errors, total, skipped } summary stats
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { performFullSync } from "@/lib/gcal/incremental-sync";
import { renewWatchChannel, WATCHED_CALENDAR_ID } from "@/lib/gcal/watch-manager";
import { logger } from "@/lib/logger";

/** Max users to process per cron run to stay within Vercel timeout. */
const MAX_USERS = 200;

/** Concurrency limit for parallel user processing. */
const CONCURRENCY = 3;

/** Stop dequeuing users after this long (vercel.json allows 60s). */
const TIME_BUDGET_MS = 55_000;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  // Validate cron secret. Fail CLOSED: a missing CRON_SECRET must not make the
  // endpoint public (it triggers syncs + token refreshes for every user).
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find users with active GCal connections. Users whose last watch
  // registration failed sort last (nulls, i.e. never failed, first), so one
  // permanently broken account cannot occupy the front of the queue every
  // day. Within that, soonest channel expiration first: push channels live
  // ~7 days and only this cron renews them, and never-watched users (null
  // expiration) need an initial channel most urgently.
  const { data: users, error } = await supabase
    .from("integration_credentials")
    .select("user_id, gcal_channel_expiration, gcal_last_full_sync_at, gcal_watch_failed_at")
    .not("google_access_token_encrypted", "is", null)
    .order("gcal_watch_failed_at", { ascending: true, nullsFirst: true })
    .order("gcal_channel_expiration", { ascending: true, nullsFirst: true })
    .limit(MAX_USERS);

  if (error || !users) {
    logger.error("cron/gcal-sync: failed to fetch users", { error: error?.message });
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  let renewed = 0;
  let synced = 0;
  const errors: string[] = [];

  /**
   * Stamps or clears the watch-failure backoff for a user. Logged, never
   * thrown: the stamp only affects tomorrow's ordering.
   */
  async function markWatchOutcome(userId: string, failed: boolean): Promise<void> {
    const { error: stampError } = await supabase
      .from("integration_credentials")
      .update({ gcal_watch_failed_at: failed ? new Date().toISOString() : null })
      .eq("user_id", userId);
    if (stampError) {
      logger.warn("cron/gcal-sync: could not record watch outcome", {
        userId, failed, error: stampError.message, impact: "queue ordering unchanged for this user",
      });
    }
  }

  /**
   * Processes a single user: renews channel if expiring, performs full sync if stale.
   *
   * @param user - User record from integration_credentials
   */
  async function processUser(user: {
    user_id: string;
    gcal_channel_expiration: string | null;
    gcal_last_full_sync_at: string | null;
    gcal_watch_failed_at: string | null;
  }): Promise<void> {
    try {
      const accessToken = await getValidAccessToken(supabase, user.user_id);
      if (!accessToken) return;

      // Watch and read the user's own primary calendar. calendarIds[0] is the
      // caltodo write calendar, which the user never edits by hand.
      const calendarId = WATCHED_CALENDAR_ID;

      // Register channel if missing, or renew if expiring within 24 hours
      const channelExpiry = user.gcal_channel_expiration
        ? new Date(user.gcal_channel_expiration).getTime()
        : 0;
      if (channelExpiry === 0 || channelExpiry - now < oneDayMs) {
        const result = await renewWatchChannel(supabase, user.user_id, accessToken, calendarId);
        if (result) {
          renewed++;
          if (user.gcal_watch_failed_at) await markWatchOutcome(user.user_id, false);
        } else {
          await markWatchOutcome(user.user_id, true);
        }
      }

      // Full sync if last sync was >24 hours ago or never
      const lastSync = user.gcal_last_full_sync_at
        ? new Date(user.gcal_last_full_sync_at).getTime()
        : 0;
      if (now - lastSync > oneDayMs) {
        const result = await performFullSync(supabase, user.user_id, accessToken, calendarId);
        if (result) synced++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${user.user_id}: ${msg}`);
      logger.error("cron/gcal-sync: user processing failed", { userId: user.user_id, error: msg });
    }
  }

  // Process users with concurrency limit, stopping cleanly at the budget so
  // the platform never kills the function mid-write. Whoever is left keeps
  // their position (or moves up, as others get later expirations) tomorrow.
  const queue = [...users];
  const running: Set<Promise<void>> = new Set();
  let outOfTime = false;

  while (queue.length > 0 || running.size > 0) {
    if (!outOfTime && queue.length > 0 && Date.now() - startedAt >= TIME_BUDGET_MS) {
      outOfTime = true;
    }
    while (!outOfTime && queue.length > 0 && running.size < CONCURRENCY) {
      const user = queue.shift()!;
      const promise = processUser(user).then(() => { running.delete(promise); });
      running.add(promise);
    }
    if (running.size > 0) await Promise.race(running);
    else if (outOfTime) break;
  }

  const skipped = queue.length;
  const summary = {
    userCount: users.length, renewed, synced, errorCount: errors.length, skipped, elapsedMs: Date.now() - startedAt,
  };
  if (skipped > 0) {
    logger.warn("cron/gcal-sync: stopped at the time budget", { ...summary, impact: "skipped users are retried tomorrow" });
  } else {
    logger.info("cron/gcal-sync: completed", summary);
  }

  return NextResponse.json({ renewed, synced, errors: errors.length, total: users.length, skipped });
}
