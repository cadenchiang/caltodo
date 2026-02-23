/**
 * POST /api/gcal/disconnect
 *
 * Disconnects Google Calendar integration:
 * 1. Deletes the entire caltodo calendar (and all its events)
 * 2. Revokes the access token via Google's revoke endpoint
 * 3. Clears all Google OAuth columns from integration_credentials
 * 4. Clears google_event_id from all user's tasks
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteCaltodoCalendar } from "@/lib/gcal/calendar-client";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
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

  // Fetch calendar ID for deletion
  const { data, error: fetchError } = await supabase
    .from("integration_credentials")
    .select("google_calendar_id")
    .eq("user_id", user.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    logger.error("POST /api/gcal/disconnect: failed to fetch credentials", {
      userId: user.id,
      error: fetchError.message,
    });
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }

  // Get a valid (auto-refreshed) access token before deleting
  const accessToken = await getValidAccessToken(supabase, user.id);

  if (accessToken) {
    // Delete the entire caltodo calendar (removes all events with it)
    if (data?.google_calendar_id) {
      logger.info("POST /api/gcal/disconnect: deleting caltodo calendar", {
        userId: user.id,
        calendarId: data.google_calendar_id,
      });
      await deleteCaltodoCalendar(accessToken, data.google_calendar_id);
    }

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
    logger.warn("POST /api/gcal/disconnect: no valid token, skipping calendar deletion", {
      userId: user.id,
    });
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
    })
    .eq("user_id", user.id);

  if (clearError) {
    logger.error("POST /api/gcal/disconnect: failed to clear tokens", {
      userId: user.id,
      error: clearError.message,
    });
    return NextResponse.json({ error: "Failed to clear tokens" }, { status: 500 });
  }

  // Clear google_event_id from all user's tasks
  const { error: taskError } = await supabase
    .from("tasks")
    .update({ google_event_id: null })
    .eq("user_id", user.id)
    .not("google_event_id", "is", null);

  if (taskError) {
    logger.warn("POST /api/gcal/disconnect: failed to clear task event IDs", {
      userId: user.id,
      error: taskError.message,
    });
  }

  logger.info("POST /api/gcal/disconnect: Google Calendar disconnected", {
    userId: user.id,
  });

  return NextResponse.json({ disconnected: true });
}
