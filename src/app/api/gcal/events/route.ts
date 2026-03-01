/**
 * GET /api/gcal/events - Fetches upcoming Google Calendar events.
 *
 * Query params:
 *   timeMin - ISO start of time range (defaults to now)
 *   timeMax - ISO end of time range (defaults to 7 days from now)
 *   calendarId - Google Calendar ID (defaults to "primary")
 *
 * @returns { events: GCalEvent[] } sorted by start time
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { logger } from "@/lib/logger";
import type { GCalEvent } from "@/lib/types";

/** Google Calendar events.list endpoint. */
const GCAL_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars";

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
  const calendarId = searchParams.get("calendarId") || "primary";

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const url = `${GCAL_EVENTS_URL}/${encodeURIComponent(calendarId)}/events?${params}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error("gcal/events: Google API error", {
        status: res.status,
        body: body.slice(0, 500),
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to fetch Google Calendar events" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const items = data.items || [];

    const events: GCalEvent[] = items.map(
      (item: {
        id: string;
        summary?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        colorId?: string;
        location?: string;
        htmlLink?: string;
      }) => ({
        id: item.id,
        summary: item.summary || "(No title)",
        start: item.start?.dateTime || item.start?.date || "",
        end: item.end?.dateTime || item.end?.date || "",
        colorId: item.colorId || null,
        location: item.location || null,
        htmlLink: item.htmlLink || "",
        allDay: !item.start?.dateTime,
      })
    );

    logger.info("gcal/events: fetched events", {
      userId: user.id,
      count: events.length,
    });

    return NextResponse.json({ events, connected: true });
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
