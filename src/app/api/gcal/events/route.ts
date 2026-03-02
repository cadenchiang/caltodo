/**
 * GET /api/gcal/events - Fetches upcoming Google Calendar events.
 *
 * Query params:
 *   timeMin     - ISO start of time range (defaults to now)
 *   timeMax     - ISO end of time range (defaults to 7 days from now)
 *   calendarId  - Single Google Calendar ID (backward compat, defaults to "primary")
 *   calendarIds - Comma-separated calendar IDs for multi-calendar fetch (max 10)
 *
 * @returns { events: GCalEvent[] } sorted by start time, deduplicated by event ID
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { logger } from "@/lib/logger";
import type { GCalEvent } from "@/lib/types";

/** Google Calendar events.list endpoint base. */
const GCAL_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars";

/** Maximum number of calendars that can be fetched in a single request. */
const MAX_CALENDARS = 10;

/** Shape of a raw Google Calendar event item. */
interface GCalEventItem {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  colorId?: string;
  location?: string;
  htmlLink?: string;
}

/**
 * Fetches events from a single Google Calendar.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar to fetch from
 * @param timeMin - ISO start of time range
 * @param timeMax - ISO end of time range
 * @returns Array of GCalEvent tagged with calendarId, or null on failure
 */
async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<GCalEvent[] | null> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const url = `${GCAL_EVENTS_URL}/${encodeURIComponent(calendarId)}/events?${params}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    logger.warn("gcal/events: calendar fetch failed", {
      calendarId,
      status: res.status,
      body: body.slice(0, 500),
    });
    return null;
  }

  const data = await res.json();
  const items: GCalEventItem[] = data.items || [];

  return items.map((item) => ({
    id: item.id,
    summary: item.summary || "(No title)",
    start: item.start?.dateTime || item.start?.date || "",
    end: item.end?.dateTime || item.end?.date || "",
    colorId: item.colorId || null,
    location: item.location || null,
    htmlLink: item.htmlLink || "",
    allDay: !item.start?.dateTime,
    calendarId,
  }));
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ events: [], connected: false });
  }

  const { searchParams } = request.nextUrl;
  const now = new Date();
  const timeMin = searchParams.get("timeMin") || now.toISOString();
  const timeMax =
    searchParams.get("timeMax") ||
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Resolve calendar IDs: prefer calendarIds (multi), fallback to calendarId (single), then "primary"
  const calendarIdsParam = searchParams.get("calendarIds");
  const calendarIdParam = searchParams.get("calendarId");

  let calendarIds: string[];
  if (calendarIdsParam) {
    calendarIds = calendarIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, MAX_CALENDARS);
  } else {
    calendarIds = [calendarIdParam || "primary"];
  }

  try {
    // Fetch events from all calendars in parallel
    const results = await Promise.all(
      calendarIds.map((id) => fetchCalendarEvents(accessToken, id, timeMin, timeMax))
    );

    // Merge all events, skip failed calendars
    const allEvents: GCalEvent[] = [];
    const seen = new Set<string>();

    for (const calEvents of results) {
      if (!calEvents) continue;
      for (const event of calEvents) {
        if (!seen.has(event.id)) {
          seen.add(event.id);
          allEvents.push(event);
        }
      }
    }

    // Sort by start time
    allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    logger.info("gcal/events: fetched events", {
      userId: user.id,
      calendarCount: calendarIds.length,
      eventCount: allEvents.length,
    });

    return NextResponse.json({ events: allEvents, connected: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("gcal/events: fetch failed", {
      userId: user.id,
      error: message,
    });
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
