/**
 * GET /api/gcal/calendars
 *
 * Lists Google Calendars for the authenticated user.
 * By default returns only writable calendars (for settings page).
 * With ?all=true, returns ALL calendars including read-only (for widget picker).
 *
 * @param all - Query param: when "true", returns all calendars instead of just writable ones
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { listWritableCalendars } from "@/lib/gcal/calendar-client";
import { listAllCalendars } from "@/lib/gcal/calendar-list";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gcal-calendars:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });
  }

  const { searchParams } = request.nextUrl;
  const fetchAll = searchParams.get("all") === "true";

  const calendars = fetchAll
    ? await listAllCalendars(accessToken)
    : await listWritableCalendars(accessToken);

  if (!calendars) {
    logger.error("GET /api/gcal/calendars: failed to list calendars", {
      userId: user.id,
      fetchAll,
    });
    return NextResponse.json({ error: "Failed to list calendars" }, { status: 500 });
  }

  const selectedCalendarId = await getCalendarId(supabase, user.id);

  return NextResponse.json({ calendars, selectedCalendarId });
}
