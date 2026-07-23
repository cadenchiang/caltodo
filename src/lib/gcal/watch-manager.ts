/**
 * Manages Google Calendar push notification channels (webhooks).
 * Registers, renews, and stops watch channels for real-time event updates.
 *
 * @module gcal/watch-manager
 */

import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Google Calendar events.watch endpoint template. */
const GCAL_WATCH_URL = "https://www.googleapis.com/calendar/v3/calendars";

/** Google Calendar channels.stop endpoint. */
const GCAL_CHANNELS_STOP_URL = "https://www.googleapis.com/calendar/v3/channels/stop";

/** Channel lifetime: 6 days (1-day buffer before Google's 7-day max). */
const CHANNEL_TTL_MS = 6 * 24 * 60 * 60 * 1000;

/**
 * Result of registering a watch channel.
 */
interface WatchChannelResult {
  channelId: string;
  resourceId: string;
  expiration: string;
}

/**
 * Registers a push notification channel for a Google Calendar.
 * Google will POST to the webhook URL when events in this calendar change.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The Google Calendar ID to watch
 * @param userId - The user's UUID (sent as channel token for identification)
 * @returns Channel metadata, or null on failure
 */
export async function registerWatchChannel(
  accessToken: string,
  calendarId: string,
  userId: string
): Promise<WatchChannelResult | null> {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    logger.error("registerWatchChannel: NEXT_PUBLIC_APP_URL not set");
    return null;
  }

  const channelId = crypto.randomUUID();
  const expiration = Date.now() + CHANNEL_TTL_MS;

  const url = `${GCAL_WATCH_URL}/${encodeURIComponent(calendarId)}/events/watch`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: channelId,
      type: "web_hook",
      address: webhookUrl,
      // Channel token is the random channel UUID (a secret), NOT the user_id —
      // the webhook resolves the user by looking up this channel id.
      token: channelId,
      expiration,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error("registerWatchChannel: events.watch failed", {
      calendarId,
      status: res.status,
      body: body.slice(0, 500),
    });
    return null;
  }

  const data = await res.json();
  const expirationIso = new Date(Number(data.expiration)).toISOString();

  logger.info("registerWatchChannel: channel created", {
    userId,
    calendarId,
    channelId,
    expiration: expirationIso,
  });

  return {
    channelId: data.id || channelId,
    resourceId: data.resourceId,
    expiration: expirationIso,
  };
}

/**
 * Stops an existing push notification channel.
 * Best-effort: ignores 404 errors (channel already expired).
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param channelId - The channel ID to stop
 * @param resourceId - The resource ID associated with the channel
 */
export async function stopWatchChannel(
  accessToken: string,
  channelId: string,
  resourceId: string
): Promise<void> {
  try {
    const res = await fetch(GCAL_CHANNELS_STOP_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: channelId, resourceId }),
    });

    if (!res.ok && res.status !== 404) {
      const body = await res.text();
      logger.warn("stopWatchChannel: failed", { channelId, status: res.status, body: body.slice(0, 300) });
    }
  } catch (err) {
    logger.warn("stopWatchChannel: error", {
      channelId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Renews a watch channel by stopping the old one and registering a new one.
 * Saves the new channel metadata to the database.
 *
 * @param supabase - Supabase client (admin or authenticated)
 * @param userId - The user's UUID
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The Google Calendar ID to watch
 * @returns New channel result, or null on failure
 */
export async function renewWatchChannel(
  supabase: SupabaseClient,
  userId: string,
  accessToken: string,
  calendarId: string
): Promise<WatchChannelResult | null> {
  // Stop existing channel (best-effort)
  const { data: creds } = await supabase
    .from("integration_credentials")
    .select("gcal_channel_id, gcal_channel_resource_id")
    .eq("user_id", userId)
    .single();

  if (creds?.gcal_channel_id && creds?.gcal_channel_resource_id) {
    await stopWatchChannel(accessToken, creds.gcal_channel_id, creds.gcal_channel_resource_id);
  }

  // Register new channel
  const result = await registerWatchChannel(accessToken, calendarId, userId);
  if (!result) return null;

  // Save to DB
  const { error } = await supabase
    .from("integration_credentials")
    .update({
      gcal_channel_id: result.channelId,
      gcal_channel_resource_id: result.resourceId,
      gcal_channel_expiration: result.expiration,
    })
    .eq("user_id", userId);

  if (error) {
    logger.error("renewWatchChannel: failed to save channel metadata", { userId, error: error.message });
  }

  return result;
}

/**
 * Clears watch channel metadata from the database.
 *
 * @param supabase - Supabase client
 * @param userId - The user's UUID
 */
export async function clearWatchChannelState(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase
    .from("integration_credentials")
    .update({
      gcal_channel_id: null,
      gcal_channel_resource_id: null,
      gcal_channel_expiration: null,
    })
    .eq("user_id", userId);
}

/**
 * Builds the webhook URL from the app URL environment variable.
 *
 * @returns Full webhook URL, or null if NEXT_PUBLIC_APP_URL is not set
 */
function getWebhookUrl(): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return null;
  return `${appUrl.replace(/\/$/, "")}/api/gcal/webhook`;
}
