/**
 * POST /api/gcal/sync
 *
 * Syncs a single task to Google Calendar.
 * Actions: "create", "update", or "delete".
 *
 * - Silently skips if Google Calendar is not connected.
 * - Never blocks the client — all GCal errors are caught and logged.
 *
 * @param body.action - "create" | "update" | "delete"
 * @param body.taskId - The task ID to sync
 * @param body.googleEventId - (optional) The Google Calendar event ID for delete actions
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/gcal/calendar-client";
import { logger } from "@/lib/logger";
import type { GCalSyncResponse, Task } from "@/lib/types";

interface SyncRequestBody {
  action: "create" | "update" | "delete";
  taskId: string;
  googleEventId?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SyncRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, taskId, googleEventId } = body;

  if (!action || !taskId) {
    return NextResponse.json({ error: "Missing action or taskId" }, { status: 400 });
  }

  // Get valid access token — silently skip if not connected
  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    const response: GCalSyncResponse = { synced: false, reason: "not_connected" };
    return NextResponse.json(response);
  }

  // Get the dedicated caltodo calendar ID
  const calendarId = await getCalendarId(supabase, user.id);
  if (!calendarId) {
    logger.warn("POST /api/gcal/sync: no calendar ID found", { userId: user.id });
    const response: GCalSyncResponse = { synced: false, reason: "no_calendar" };
    return NextResponse.json(response);
  }

  try {
    if (action === "delete") {
      return await handleDelete(accessToken, calendarId, taskId, googleEventId, supabase, user.id);
    }

    // Fetch the task for create/update
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (taskError || !task) {
      logger.warn("POST /api/gcal/sync: task not found", { taskId, userId: user.id });
      const response: GCalSyncResponse = { synced: false, reason: "task_not_found" };
      return NextResponse.json(response);
    }

    if (action === "create") {
      return await handleCreate(accessToken, calendarId, task as Task, supabase);
    }

    if (action === "update") {
      return await handleUpdate(accessToken, calendarId, task as Task, supabase);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    logger.error("POST /api/gcal/sync: unexpected error", {
      action,
      taskId,
      error: err instanceof Error ? err.message : String(err),
    });
    const response: GCalSyncResponse = {
      synced: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
    return NextResponse.json(response);
  }
}

/**
 * Handles creating a new Google Calendar event for a task.
 * Skips if no due_date. Saves the google_event_id to the task row.
 */
async function handleCreate(
  accessToken: string,
  calendarId: string,
  task: Task,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<NextResponse> {
  if (!task.due_date) {
    const response: GCalSyncResponse = { synced: false, reason: "no_due_date" };
    return NextResponse.json(response);
  }

  const eventId = await createCalendarEvent(accessToken, calendarId, task);
  if (!eventId) {
    const response: GCalSyncResponse = { synced: false, error: "Failed to create event" };
    return NextResponse.json(response);
  }

  // Save google_event_id to task
  await supabase
    .from("tasks")
    .update({ google_event_id: eventId })
    .eq("id", task.id);

  const response: GCalSyncResponse = { synced: true, googleEventId: eventId };
  return NextResponse.json(response);
}

/**
 * Handles updating a Google Calendar event for a task.
 * - If task has no google_event_id but has due_date → create instead.
 * - If task has google_event_id but no due_date → delete event + clear ID.
 * - Otherwise → update the existing event.
 */
async function handleUpdate(
  accessToken: string,
  calendarId: string,
  task: Task,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<NextResponse> {
  // No existing event + has due date → create
  if (!task.google_event_id && task.due_date) {
    return handleCreate(accessToken, calendarId, task, supabase);
  }

  // Has existing event + no due date → delete event
  if (task.google_event_id && !task.due_date) {
    await deleteCalendarEvent(accessToken, calendarId, task.google_event_id);
    await supabase
      .from("tasks")
      .update({ google_event_id: null })
      .eq("id", task.id);

    const response: GCalSyncResponse = { synced: true, reason: "event_deleted_no_due_date" };
    return NextResponse.json(response);
  }

  // No event + no due date → nothing to do
  if (!task.google_event_id) {
    const response: GCalSyncResponse = { synced: false, reason: "no_due_date" };
    return NextResponse.json(response);
  }

  // Update existing event
  const success = await updateCalendarEvent(accessToken, calendarId, task.google_event_id, task);
  const response: GCalSyncResponse = {
    synced: success,
    googleEventId: task.google_event_id,
    ...(!success && { error: "Failed to update event" }),
  };
  return NextResponse.json(response);
}

/**
 * Handles deleting a Google Calendar event.
 * Clears google_event_id from the task row.
 */
async function handleDelete(
  accessToken: string,
  calendarId: string,
  taskId: string,
  googleEventId: string | undefined,
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<NextResponse> {
  if (!googleEventId) {
    const response: GCalSyncResponse = { synced: false, reason: "no_event_id" };
    return NextResponse.json(response);
  }

  await deleteCalendarEvent(accessToken, calendarId, googleEventId);

  // Clear google_event_id (task may already be deleted, so we don't check errors)
  await supabase
    .from("tasks")
    .update({ google_event_id: null })
    .eq("id", taskId)
    .eq("user_id", userId);

  const response: GCalSyncResponse = { synced: true };
  return NextResponse.json(response);
}
