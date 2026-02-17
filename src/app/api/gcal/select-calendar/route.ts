/**
 * POST /api/gcal/select-calendar
 *
 * Saves the user's calendar selection for Google Calendar sync.
 * Body: { calendarId: string } — an existing calendar ID, or "create_new"
 * to create a dedicated "caltodo" calendar.
 *
 * If switching from a previous calendar:
 * - Deletes old events (best-effort) via their google_event_id
 * - Clears google_event_id from tasks so they will be re-synced
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import {
  createCaltodoCalendar,
  deleteCalendarEvent,
} from "@/lib/gcal/calendar-client";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { calendarId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.calendarId || typeof body.calendarId !== "string") {
    return NextResponse.json({ error: "calendarId is required" }, { status: 400 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });
  }

  let newCalendarId = body.calendarId;

  // Handle "create_new" — create a dedicated caltodo calendar
  if (newCalendarId === "create_new") {
    const created = await createCaltodoCalendar(accessToken);
    if (!created) {
      logger.error("POST /api/gcal/select-calendar: failed to create caltodo calendar", {
        userId: user.id,
      });
      return NextResponse.json({ error: "Failed to create calendar" }, { status: 500 });
    }
    newCalendarId = created;
    logger.info("POST /api/gcal/select-calendar: created new caltodo calendar", {
      userId: user.id,
      calendarId: newCalendarId,
    });
  }

  // Check for existing calendar — if switching, clean up old events
  const previousCalendarId = await getCalendarId(supabase, user.id);
  if (previousCalendarId && previousCalendarId !== newCalendarId) {
    logger.info("POST /api/gcal/select-calendar: switching calendars, cleaning up old events", {
      userId: user.id,
      from: previousCalendarId,
      to: newCalendarId,
    });

    // Fetch tasks with google_event_id to delete from old calendar
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, google_event_id")
      .eq("user_id", user.id)
      .not("google_event_id", "is", null);

    if (tasks && tasks.length > 0) {
      // Delete events from old calendar (best-effort)
      for (const task of tasks) {
        if (task.google_event_id) {
          await deleteCalendarEvent(accessToken, previousCalendarId, task.google_event_id);
        }
      }

      // Clear google_event_id from all tasks so they will be re-synced
      const { error: clearError } = await supabase
        .from("tasks")
        .update({ google_event_id: null })
        .eq("user_id", user.id)
        .not("google_event_id", "is", null);

      if (clearError) {
        logger.warn("POST /api/gcal/select-calendar: failed to clear event IDs", {
          userId: user.id,
          error: clearError.message,
        });
      }
    }
  }

  // Store the new calendar ID
  const { error: updateError } = await supabase
    .from("integration_credentials")
    .update({ google_calendar_id: newCalendarId })
    .eq("user_id", user.id);

  if (updateError) {
    logger.error("POST /api/gcal/select-calendar: failed to store calendar ID", {
      userId: user.id,
      calendarId: newCalendarId,
      error: updateError.message,
    });
    return NextResponse.json({ error: "Failed to save calendar selection" }, { status: 500 });
  }

  const needsSync = !previousCalendarId || previousCalendarId !== newCalendarId;

  logger.info("POST /api/gcal/select-calendar: calendar selected", {
    userId: user.id,
    calendarId: newCalendarId,
    needsSync,
  });

  return NextResponse.json({ calendarId: newCalendarId, needsSync });
}
