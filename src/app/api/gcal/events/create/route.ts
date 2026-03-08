/**
 * POST /api/gcal/events/create - Create a new Google Calendar event.
 *
 * Body: {
 *   summary: string,
 *   start: string (ISO datetime or YYYY-MM-DD),
 *   end: string (ISO datetime or YYYY-MM-DD),
 *   allDay?: boolean,
 *   location?: string,
 *   description?: string,
 *   calendarId?: string (defaults to "primary"),
 * }
 *
 * @returns { event: { id, htmlLink } } on success
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { summary, start, end, allDay, location, description, calendarId = "primary" } = body;

  if (!summary || !start || !end) {
    return NextResponse.json({ error: "summary, start, and end are required" }, { status: 400 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "No valid Google token" }, { status: 401 });
  }

  const eventBody: Record<string, unknown> = {
    summary,
    location: location || undefined,
    description: description || undefined,
  };

  if (allDay) {
    eventBody.start = { date: start };
    eventBody.end = { date: end };
  } else {
    eventBody.start = { dateTime: start };
    eventBody.end = { dateTime: end };
  }

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventBody),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.warn("gcal/events/create: failed", { status: res.status, body: text.slice(0, 500) });
      return NextResponse.json({ error: "Failed to create event" }, { status: res.status });
    }

    const created = await res.json();
    logger.info("gcal/events/create: success", { userId: user.id, eventId: created.id });

    return NextResponse.json({ event: { id: created.id, htmlLink: created.htmlLink } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("gcal/events/create: error", { userId: user.id, error: message });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
