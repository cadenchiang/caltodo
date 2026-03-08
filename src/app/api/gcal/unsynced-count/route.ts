/**
 * GET /api/gcal/unsynced-count
 *
 * Returns the count of tasks with due_date but no google_event_id,
 * indicating they need to be synced to Google Calendar.
 *
 * @returns { count: N, connected: boolean }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gcal-unsynced-count:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ count: 0, connected: false });
  }

  const calendarId = await getCalendarId(supabase, user.id);
  if (!calendarId) {
    return NextResponse.json({ count: 0, connected: true });
  }

  const { count, error: countError } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("due_date", "is", null)
    .is("google_event_id", null)
    .is("dismissed_at", null);

  if (countError) {
    logger.error("GET /api/gcal/unsynced-count: query failed", { userId: user.id, error: countError.message });
    return NextResponse.json({ error: "Failed to count unsynced tasks" }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0, connected: true });
}
