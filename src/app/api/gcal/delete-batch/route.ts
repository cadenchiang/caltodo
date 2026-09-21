/**
 * POST /api/gcal/delete-batch
 *
 * Removes the Google Calendar events of up to 100 tasks in one request, for
 * bulk deletes (delete class). One /api/gcal/sync call per task tripped the
 * 30/min limit past the 30th task and orphaned the rest of the events.
 *
 * Event ids are resolved from the task rows, so callers must send this
 * BEFORE deleting the rows.
 *
 * @param body.taskIds - 1 to 100 task ids owned by the caller
 * @returns { deleted, failed, skipped } counts, or a reason when not connected
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { deleteCalendarEvent } from "@/lib/gcal/calendar-sync";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Most task ids one request accepts. */
const MAX_TASK_IDS = 100;

/** Concurrent Google API deletes. */
const CONCURRENCY = 3;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gcal-delete-batch:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { taskIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const taskIds = body.taskIds;
  if (
    !Array.isArray(taskIds) || taskIds.length === 0 || taskIds.length > MAX_TASK_IDS ||
    taskIds.some((id) => typeof id !== "string" || !id.trim())
  ) {
    return NextResponse.json({ error: `taskIds must be 1 to ${MAX_TASK_IDS} non-empty strings` }, { status: 400 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) return NextResponse.json({ deleted: 0, failed: 0, skipped: taskIds.length, reason: "not_connected" });
  const calendarId = await getCalendarId(supabase, user.id);
  if (!calendarId) return NextResponse.json({ deleted: 0, failed: 0, skipped: taskIds.length, reason: "no_calendar" });

  const { data: rows, error: rowsError } = await supabase
    .from("tasks")
    .select("id, google_event_id")
    .eq("user_id", user.id)
    .in("id", taskIds)
    .not("google_event_id", "is", null);
  if (rowsError) {
    logger.error("POST /api/gcal/delete-batch: failed to load tasks", {
      userId: user.id, count: taskIds.length, error: rowsError.message, impact: "calendar events not removed",
    });
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }

  const targets = (rows ?? []) as Array<{ id: string; google_event_id: string }>;
  let deleted = 0;
  const failedIds: string[] = [];

  async function removeOne(row: { id: string; google_event_id: string }): Promise<void> {
    try {
      const ok = await deleteCalendarEvent(accessToken!, calendarId!, row.google_event_id);
      if (!ok) {
        failedIds.push(row.id);
        return;
      }
      const { error } = await supabase.from("tasks").update({ google_event_id: null }).eq("id", row.id);
      if (error) {
        logger.warn("POST /api/gcal/delete-batch: event removed but id not cleared", {
          taskId: row.id, error: error.message, impact: "harmless if the row is deleted next",
        });
      }
      deleted++;
    } catch (err) {
      failedIds.push(row.id);
      logger.error("POST /api/gcal/delete-batch: delete threw", {
        taskId: row.id, error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  let cursor = 0;
  const running: Set<Promise<void>> = new Set();
  while (cursor < targets.length || running.size > 0) {
    while (cursor < targets.length && running.size < CONCURRENCY) {
      const promise = removeOne(targets[cursor++]).then(() => { running.delete(promise); });
      running.add(promise);
    }
    if (running.size > 0) await Promise.race(running);
  }

  const result = { deleted, failed: failedIds.length, skipped: taskIds.length - targets.length };
  if (failedIds.length > 0) {
    logger.error("POST /api/gcal/delete-batch: some events were not removed", {
      userId: user.id, ...result, failedTaskIds: failedIds, impact: "those events remain on the calendar",
    });
  } else {
    logger.info("POST /api/gcal/delete-batch: done", { userId: user.id, ...result });
  }
  return NextResponse.json(result);
}
