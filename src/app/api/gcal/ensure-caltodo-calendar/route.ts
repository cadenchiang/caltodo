/**
 * POST /api/gcal/ensure-caltodo-calendar
 *
 * Ensures a dedicated "caltodo" calendar exists in the user's Google
 * Calendar account, creating one if needed. Returns the calendar ID so
 * the client can include it in the calendar-selection array as the
 * write target.
 *
 * This fixes the bug where synced assignments were landing in the user's
 * personal calendar — the write code uses the first ID in the stored
 * google_calendar_id array, and previously that was whatever Google
 * returned first (almost always "primary").
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { findOrCreateCaltodoCalendar } from "@/lib/gcal/calendar-list";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gcal-ensure-caltodo:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Calendar not connected" },
      { status: 400 },
    );
  }

  const calendarId = await findOrCreateCaltodoCalendar(accessToken);
  if (!calendarId) {
    logger.error("POST /api/gcal/ensure-caltodo-calendar: helper returned null", {
      userId: user.id,
    });
    return NextResponse.json(
      { error: "Failed to find or create the caltodo calendar" },
      { status: 502 },
    );
  }

  logger.info("POST /api/gcal/ensure-caltodo-calendar: resolved calendar", {
    userId: user.id,
    calendarId,
  });

  return NextResponse.json({ calendarId });
}
