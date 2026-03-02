/**
 * GET /api/gcal/unsynced-count
 *
 * Returns the number of tasks that have a due_date but no google_event_id,
 * indicating they were missed during the initial GCal sync.
 *
 * Response shapes:
 *   { count: N, connected: true }  — normal case
 *   { count: 0, connected: false } — GCal not connected
 *   { count: 0, connected: true }  — no calendar selected or no unsynced tasks
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
    logger.info("GET /api/gcal/unsynced-count: not connected", { userId: user.id });
    return NextResponse.json({ count: 0, connected: false });
  }

  const calendarId = await getCalendarId(supabase, user.id);
  if (!calendarId) {
    logger.info("GET /api/gcal/unsynced-count: no calendar selected", { userId: user.id });
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
    logger.error("GET /api/gcal/unsynced-count: query failed", {
      userId: user.id,
      error: countError.message,
    });
    return NextResponse.json({ error: "Failed to count unsynced tasks" }, { status: 500 });
  }

  logger.info("GET /api/gcal/unsynced-count: result", {
    userId: user.id,
    count: count ?? 0,
  });

  return NextResponse.json({ count: count ?? 0, connected: true });
}
