/**
 * GET /api/gcal/calendars
 *
 * Lists ALL Google Calendars for the authenticated user.
 * Returns all calendars (including read-only) so user can pick which to display.
 * Parses google_calendar_id as a JSON array for selectedCalendarIds.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { listAllCalendars } from "@/lib/gcal/calendar-list";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Parses the google_calendar_id column which may be a JSON array or a single ID string.
 *
 * @param raw - The raw column value
 * @returns Array of selected calendar IDs
 */
function parseSelectedCalendarIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Not JSON — treat as a single calendar ID (legacy format)
    return [raw];
  }
  return [];
}

export async function GET() {
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

  const calendars = await listAllCalendars(accessToken);

  if (!calendars) {
    logger.error("GET /api/gcal/calendars: failed to list calendars", {
      userId: user.id,
    });
    return NextResponse.json({ error: "Failed to list calendars" }, { status: 500 });
  }

  // Get stored calendar selection
  const { data: creds } = await supabase
    .from("integration_credentials")
    .select("google_calendar_id")
    .eq("user_id", user.id)
    .single();

  const selectedCalendarIds = parseSelectedCalendarIds(creds?.google_calendar_id ?? null);

  return NextResponse.json({ calendars, selectedCalendarIds });
}
