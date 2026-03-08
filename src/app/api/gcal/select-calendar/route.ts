/**
 * POST /api/gcal/select-calendar
 *
 * Stores which Google Calendar IDs to READ events from.
 * Accepts { calendarIds: string[] } with 1-10 calendar IDs.
 * Stores as JSON string in google_calendar_id column.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
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

  // Store as JSON string in google_calendar_id column
  const calendarIdsJson = JSON.stringify(body.calendarIds);

  // Invalidate syncToken when calendar selection changes (new calendars need fresh sync)
  const { error: updateError } = await supabase
    .from("integration_credentials")
    .update({
      google_calendar_id: calendarIdsJson,
      gcal_sync_token: null,
    })
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

  return NextResponse.json({ calendarIds: body.calendarIds });
}
