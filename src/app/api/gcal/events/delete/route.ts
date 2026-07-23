/**
 * POST /api/gcal/events/delete - Delete a Google Calendar event.
 *
 * Body: {
 *   eventId: string,
 *   calendarId?: string (defaults to "primary"),
 * }
 *
 * @returns { deleted: true } on success
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

  let body: { eventId?: string; calendarId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { eventId, calendarId = "primary" } = body;

  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "No valid Google token" }, { status: 401 });
  }

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 404 (already deleted) and 410 (gone) are both "already not there" —
    // treat as success so a retry / double-delete is idempotent.
    if (!res.ok && res.status !== 410 && res.status !== 404) {
      const text = await res.text();
      logger.warn("gcal/events/delete: failed", { status: res.status, body: text.slice(0, 500) });
      return NextResponse.json({ error: "Failed to delete event" }, { status: res.status });
    }

    logger.info("gcal/events/delete: success", { userId: user.id, eventId });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("gcal/events/delete: error", { userId: user.id, error: message });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
