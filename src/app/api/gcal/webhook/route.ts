/**
 * POST /api/gcal/webhook
 *
 * Receives push notifications from Google Calendar when events change.
 * Validates the channel, performs an incremental sync to refresh the syncToken,
 * and updates gcal_events_updated_at so the client knows to refetch.
 *
 * No user session available — uses admin Supabase client.
 * Must respond within 10 seconds (Google retries on timeout).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { performIncrementalSync } from "@/lib/gcal/incremental-sync";
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
    .select("user_id, gcal_channel_id, google_calendar_id")
    .eq("gcal_channel_id", userToken)
    .maybeSingle();
  if (!creds) {
    const legacy = await supabase
      .from("integration_credentials")
      .select("user_id, gcal_channel_id, google_calendar_id")
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

  // Get access token and perform incremental sync
  const accessToken = await getValidAccessToken(supabase, userId);
  if (!accessToken) {
    logger.warn("gcal/webhook: no valid access token", { userId });
    return NextResponse.json({ ok: true });
  }

  // Resolve the primary calendar ID for sync
  const calendarId = resolveCalendarId(creds.google_calendar_id);

  await performIncrementalSync(supabase, userId, accessToken, calendarId);

  logger.info("gcal/webhook: processed notification", {
    userId,
    resourceState,
    calendarId,
  });

  return NextResponse.json({ ok: true });
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
