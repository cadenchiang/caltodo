/**
 * POST /api/gcal/webhook
 *
 * Receives push notifications from Google Calendar when events change.
 * Validates the channel, performs an incremental sync of the watched
 * (primary) calendar to refresh the syncToken, and updates
 * gcal_events_updated_at so the client knows to refetch. Without a stored
 * token the fallback is a bounded full sync; a failure is recorded and
 * still acknowledged with 200.
 *
 * No user session available, so it uses the admin Supabase client.
 * Must respond within 10 seconds (Google retries on timeout).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { performIncrementalSync } from "@/lib/gcal/incremental-sync";
import { WATCHED_CALENDAR_ID } from "@/lib/gcal/watch-manager";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const channelId = request.headers.get("x-goog-channel-id");
  const resourceState = request.headers.get("x-goog-resource-state");
  const userToken = request.headers.get("x-goog-channel-token");

  // Initial sync handshake — just acknowledge
  if (resourceState === "sync") {
    logger.info("gcal/webhook: sync handshake received", { channelId });
    return NextResponse.json({ ok: true });
  }

  if (!channelId || !userToken) {
    logger.warn("gcal/webhook: missing headers", { channelId, userToken });
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // The channel token is now the random channel UUID (a secret), not the
  // guessable user_id. Look the row up by channel id; fall back to the legacy
  // user_id token for channels registered before this change (they re-register
  // with the secret token on the next daily cron renewal).
  let { data: creds } = await supabase
    .from("integration_credentials")
    .select("user_id, gcal_channel_id")
    .eq("gcal_channel_id", userToken)
    .maybeSingle();
  if (!creds) {
    const legacy = await supabase
      .from("integration_credentials")
      .select("user_id, gcal_channel_id")
      .eq("user_id", userToken)
      .maybeSingle();
    creds = legacy.data;
  }

  if (!creds) {
    logger.warn("gcal/webhook: channel not found");
    return NextResponse.json({ ok: true }); // Don't retry
  }

  // The channel id Google echoes must match the stored one (the real gate).
  if (creds.gcal_channel_id !== channelId) {
    logger.warn("gcal/webhook: channel ID mismatch", {
      expected: creds.gcal_channel_id,
      received: channelId,
    });
    return NextResponse.json({ ok: true }); // Stale channel, don't retry
  }

  const userId = creds.user_id;

  // Always ACK with 200, even on a per-user sync failure — Google retries
  // webhooks with backoff on any 5xx, so an unhandled throw here (bad sync
  // token, transient Google 4xx surfaced as an exception) would trigger a
  // retry storm for that user instead of a clean ack.
  try {
    const accessToken = await getValidAccessToken(supabase, userId);
    if (!accessToken) {
      logger.warn("gcal/webhook: no valid access token", { userId });
      return NextResponse.json({ ok: true });
    }

    // The channel watches the user's primary calendar, so that is what the
    // incremental sync reads (the write calendar, calendarIds[0], is not it).
    const calendarId = WATCHED_CALENDAR_ID;
    // With no stored token this is a bounded full sync (last 30 days, 3
    // pages). If even that fails, record it and still ack: the notification
    // itself says something changed, so bump the marker the client polls
    // and let the daily cron retry the token instead of Google retrying us.
    const result = await performIncrementalSync(supabase, userId, accessToken, calendarId);
    if (!result) {
      const { error: markError } = await supabase
        .from("integration_credentials")
        .update({ gcal_events_updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      logger.error("gcal/webhook: sync token could not be refreshed", {
        userId, calendarId, resourceState,
        markError: markError?.message,
        impact: "client refetches from the change marker; token retried by the daily cron",
      });
    } else {
      logger.info("gcal/webhook: processed notification", { userId, resourceState, calendarId, fullSync: result.isFullSync });
    }
  } catch (err) {
    logger.error("gcal/webhook: sync failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return NextResponse.json({ ok: true });
}
