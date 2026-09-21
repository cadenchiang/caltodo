/**
 * POST /api/gcal/select-calendar
 *
 * Stores which Google Calendar IDs to READ events from.
 * Accepts { calendarIds: string[] } with 1-10 calendar IDs.
 * Stores as JSON string in google_calendar_id column.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { renewWatchChannel } from "@/lib/gcal/watch-manager";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gcal-select-calendar:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { calendarIds: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.calendarIds) || body.calendarIds.length === 0 || body.calendarIds.length > 10) {
    return NextResponse.json({ error: "calendarIds must be an array of 1-10 IDs" }, { status: 400 });
  }

  // Validate all IDs are non-empty strings
  if (body.calendarIds.some((id) => typeof id !== "string" || !id.trim())) {
    return NextResponse.json({ error: "All calendar IDs must be non-empty strings" }, { status: 400 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });
  }

  // Index 0 is the write target (getCalendarId). Changing it while tasks
  // still reference events would 404 every update, recreate the events in
  // the new calendar and leave the old ones behind, so refuse it.
  const currentWriteCalendarId = await getCalendarId(supabase, user.id);
  if (currentWriteCalendarId && currentWriteCalendarId !== body.calendarIds[0]) {
    const { count, error: countError } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("google_event_id", "is", null);
    if (countError) {
      logger.error("POST /api/gcal/select-calendar: failed to count synced tasks", {
        userId: user.id, error: countError.message, impact: "selection refused to be safe",
      });
      return NextResponse.json({ error: "Failed to check synced tasks" }, { status: 500 });
    }
    if ((count ?? 0) > 0) {
      logger.warn("POST /api/gcal/select-calendar: refused write calendar change", {
        userId: user.id, from: currentWriteCalendarId, to: body.calendarIds[0], syncedTasks: count,
      });
      return NextResponse.json(
        {
          error: `Tasks are written to your current first calendar and ${count} of them already have events there. Keep it first in the list.`,
          reason: "write_calendar_locked",
        },
        { status: 409 }
      );
    }
  }

  // Store as JSON string in google_calendar_id column
  const calendarIdsJson = JSON.stringify(body.calendarIds);

  const { error: updateError } = await supabase
    .from("integration_credentials")
    .update({ google_calendar_id: calendarIdsJson })
    .eq("user_id", user.id);

  if (updateError) {
    logger.error("POST /api/gcal/select-calendar: failed to store calendar IDs", {
      userId: user.id,
      calendarIds: body.calendarIds,
      error: updateError.message,
    });
    return NextResponse.json({ error: "Failed to save calendar selection" }, { status: 500 });
  }

  logger.info("POST /api/gcal/select-calendar: calendars selected", {
    userId: user.id,
    calendarIds: body.calendarIds,
  });

  // Register a push notification channel for the primary calendar
  // so Google sends real-time webhooks when events change (even when app is closed).
  const primaryCalendarId = body.calendarIds[0] || "primary";
  const watchResult = await renewWatchChannel(supabase, user.id, accessToken, primaryCalendarId);
  if (watchResult) {
    logger.info("POST /api/gcal/select-calendar: watch channel registered", {
      userId: user.id,
      calendarId: primaryCalendarId,
      channelId: watchResult.channelId,
      expiration: watchResult.expiration,
    });
  } else {
    logger.warn("POST /api/gcal/select-calendar: watch channel registration failed", {
      userId: user.id,
      calendarId: primaryCalendarId,
    });
  }

  return NextResponse.json({ calendarIds: body.calendarIds });
}
