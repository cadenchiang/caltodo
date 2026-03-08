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

  // Validate channel ID belongs to this user
  const { data: creds, error: lookupError } = await supabase
    .from("integration_credentials")
    .select("gcal_channel_id, google_calendar_id")
    .eq("user_id", userToken)
    .single();

  if (lookupError || !creds) {
    logger.warn("gcal/webhook: user not found", { userId: userToken });
    return NextResponse.json({ ok: true }); // Don't retry
  }

  if (creds.gcal_channel_id !== channelId) {
    logger.warn("gcal/webhook: channel ID mismatch", {
      userId: userToken,
      expected: creds.gcal_channel_id,
      received: channelId,
    });
    return NextResponse.json({ ok: true }); // Stale channel, don't retry
  }

  // Get access token and perform incremental sync
  const accessToken = await getValidAccessToken(supabase, userToken);
  if (!accessToken) {
    logger.warn("gcal/webhook: no valid access token", { userId: userToken });
    return NextResponse.json({ ok: true });
  }

  // Resolve the primary calendar ID for sync
  const calendarId = resolveCalendarId(creds.google_calendar_id);

  await performIncrementalSync(supabase, userToken, accessToken, calendarId);

  logger.info("gcal/webhook: processed notification", {
    userId: userToken,
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
