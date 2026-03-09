/**
 * GET /api/cron/gcal-sync
 *
 * Daily cron job that maintains Google Calendar sync health:
 * 1. Renews watch channels expiring within 24 hours
 * 2. Performs full sync for users whose last full sync was >24 hours ago
 *
 * Protected by CRON_SECRET (set automatically by Vercel).
 * Uses admin Supabase client (no user session).
 *
 * @returns { renewed, synced, errors } summary stats
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { performFullSync } from "@/lib/gcal/incremental-sync";
import { renewWatchChannel } from "@/lib/gcal/watch-manager";
import { logger } from "@/lib/logger";

/** Max users to process per cron run to stay within Vercel timeout. */
const MAX_USERS = 50;

/** Concurrency limit for parallel user processing. */
const CONCURRENCY = 3;

export async function GET(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find all users with active GCal connections
  const { data: users, error } = await supabase
    .from("integration_credentials")
    .select("user_id, google_calendar_id, gcal_channel_expiration, gcal_last_full_sync_at")
    .not("google_access_token_encrypted", "is", null)
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
   * Processes a single user: renews channel if expiring, performs full sync if stale.
   *
   * @param user - User record from integration_credentials
   */
  async function processUser(user: {
    user_id: string;
    google_calendar_id: string | null;
    gcal_channel_expiration: string | null;
    gcal_last_full_sync_at: string | null;
  }): Promise<void> {
    try {
      const accessToken = await getValidAccessToken(supabase, user.user_id);
      if (!accessToken) return;

      const calendarId = resolveCalendarId(user.google_calendar_id);

      // Register channel if missing, or renew if expiring within 24 hours
      const channelExpiry = user.gcal_channel_expiration
        ? new Date(user.gcal_channel_expiration).getTime()
        : 0;
      if (channelExpiry === 0 || channelExpiry - now < oneDayMs) {
        const result = await renewWatchChannel(supabase, user.user_id, accessToken, calendarId);
        if (result) renewed++;
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

  // Process users with concurrency limit
  const queue = [...users];
  const running: Set<Promise<void>> = new Set();

  while (queue.length > 0 || running.size > 0) {
    while (queue.length > 0 && running.size < CONCURRENCY) {
      const user = queue.shift()!;
      const promise = processUser(user).then(() => { running.delete(promise); });
      running.add(promise);
    }
    if (running.size > 0) await Promise.race(running);
  }

  logger.info("cron/gcal-sync: completed", { userCount: users.length, renewed, synced, errorCount: errors.length });

  return NextResponse.json({ renewed, synced, errors: errors.length, total: users.length });
}

/**
 * Resolves the first calendar ID from the stored JSON or string.
 *
 * @param stored - The stored google_calendar_id value
 * @returns A single calendar ID string
 */
function resolveCalendarId(stored: string | null): string {
  if (!stored) return "primary";
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed[0] || "primary" : stored;
  } catch {
    return stored;
  }
}
