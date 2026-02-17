/**
 * GET /api/gcal/calendars
 *
 * Lists all writable Google Calendars for the authenticated user.
 * Returns the list of calendars and the currently selected calendar ID.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { listWritableCalendars } from "@/lib/gcal/calendar-client";
import { logger } from "@/lib/logger";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });
  }

  const calendars = await listWritableCalendars(accessToken);
  if (!calendars) {
    logger.error("GET /api/gcal/calendars: failed to list calendars", {
      userId: user.id,
    });
    return NextResponse.json({ error: "Failed to list calendars" }, { status: 500 });
  }

  const selectedCalendarId = await getCalendarId(supabase, user.id);

  return NextResponse.json({ calendars, selectedCalendarId });
}
