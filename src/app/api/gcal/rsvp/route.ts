/**
 * POST /api/gcal/rsvp - Update the user's RSVP status on a Google Calendar event.
 *
 * Body: { eventId: string, calendarId: string, status: "accepted" | "tentative" | "declined" }
 *
 * Uses the Google Calendar API events.patch to update only the user's attendee status.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { logger } from "@/lib/logger";

const VALID_STATUSES = ["accepted", "tentative", "declined"];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { eventId?: string; calendarId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { eventId, calendarId, status } = body;

  if (!eventId || !calendarId || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Missing or invalid eventId, calendarId, or status" },
      { status: 400 }
    );
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "No valid Google token" }, { status: 401 });
  }

  try {
    // First get the event to find the user's attendee entry
    const getUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!getRes.ok) {
      const text = await getRes.text();
      logger.warn("gcal/rsvp: failed to get event", { eventId, status: getRes.status, body: text.slice(0, 300) });
      return NextResponse.json({ error: "Failed to get event" }, { status: getRes.status });
    }

    const eventData = await getRes.json();
    const attendees = eventData.attendees || [];

    // Update the self attendee's responseStatus
    const updatedAttendees = attendees.map((a: { self?: boolean; responseStatus?: string }) =>
      a.self ? { ...a, responseStatus: status } : a
    );

    // Patch the event with updated attendees
    const patchRes = await fetch(getUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attendees: updatedAttendees }),
    });

    if (!patchRes.ok) {
      const text = await patchRes.text();
      logger.warn("gcal/rsvp: patch failed", { eventId, status: patchRes.status, body: text.slice(0, 300) });
      return NextResponse.json({ error: "Failed to update RSVP" }, { status: patchRes.status });
    }

    logger.info("gcal/rsvp: updated", { userId: user.id, eventId, status });
    return NextResponse.json({ success: true, status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("gcal/rsvp: error", { userId: user.id, eventId, error: message });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
