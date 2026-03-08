/**
 * POST /api/gcal/disconnect
 *
 * Disconnects Google Calendar integration:
 * 1. Revokes the access token via Google's revoke endpoint
 * 2. Clears all Google OAuth columns from integration_credentials
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { stopWatchChannel } from "@/lib/gcal/watch-manager";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Google OAuth2 token revocation endpoint. */
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gcal-disconnect:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Get a valid (auto-refreshed) access token before revoking
  const accessToken = await getValidAccessToken(supabase, user.id);

  if (accessToken) {
    // Revoke the token (best-effort)
    try {
      const revokeRes = await fetch(
        `${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(accessToken)}`,
        { method: "POST" }
      );
      if (!revokeRes.ok) {
        logger.warn("POST /api/gcal/disconnect: token revocation failed", {
          userId: user.id,
          status: revokeRes.status,
        });
      }
    } catch (err) {
      logger.warn("POST /api/gcal/disconnect: error during token revocation", {
        userId: user.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  } else {
    logger.warn("POST /api/gcal/disconnect: no valid token, skipping revocation", {
      userId: user.id,
    });
  }

  // Stop watch channel before clearing tokens (best-effort)
  if (accessToken) {
    const { data: creds } = await supabase
      .from("integration_credentials")
      .select("gcal_channel_id, gcal_channel_resource_id")
      .eq("user_id", user.id)
      .single();

    if (creds?.gcal_channel_id && creds?.gcal_channel_resource_id) {
      await stopWatchChannel(accessToken, creds.gcal_channel_id, creds.gcal_channel_resource_id);
    }
  }

  // Clear Google columns from integration_credentials
  const { error: clearError } = await supabase
    .from("integration_credentials")
    .update({
      google_access_token_encrypted: null,
      google_refresh_token_encrypted: null,
      google_token_expires_at: null,
      google_calendar_id: null,
      google_email: null,
      google_photo_url: null,
      gcal_sync_token: null,
      gcal_last_full_sync_at: null,
      gcal_channel_id: null,
      gcal_channel_resource_id: null,
      gcal_channel_expiration: null,
      gcal_events_updated_at: null,
    })
    .eq("user_id", user.id);

  if (clearError) {
    logger.error("POST /api/gcal/disconnect: failed to clear tokens", {
      userId: user.id,
      error: clearError.message,
    });
    return NextResponse.json({ error: "Failed to clear tokens" }, { status: 500 });
  }

  logger.info("POST /api/gcal/disconnect: Google Calendar disconnected", {
    userId: user.id,
  });

  return NextResponse.json({ disconnected: true });
}
