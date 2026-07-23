/**
 * POST /api/gcal/sync
 *
 * Syncs a single task to Google Calendar.
 * Actions: "create", "update", or "delete".
 *
 * @param body.action - "create" | "update" | "delete"
 * @param body.taskId - The task ID to sync
 * @param body.googleEventId - (optional) The Google Calendar event ID for delete actions
 * @returns GCalSyncResponse with sync result
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/gcal/calendar-sync";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
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

  const { allowed } = rateLimit(`gcal-sync:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    const response: GCalSyncResponse = { synced: false, reason: "not_connected" };
    return NextResponse.json(response);
  }

  const calendarId = await getCalendarId(supabase, user.id);
  if (!calendarId) {
    const response: GCalSyncResponse = { synced: false, reason: "no_calendar" };
    return NextResponse.json(response);
  }

  try {
    if (action === "delete") {
      return await handleDelete(accessToken, calendarId, taskId, googleEventId, supabase, user.id);
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (taskError || !task) {
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
      action, taskId, error: err instanceof Error ? err.message : String(err),
    });
    const response: GCalSyncResponse = { synced: false, error: err instanceof Error ? err.message : "Unknown error" };
    return NextResponse.json(response);
  }
}

/**
 * Creates a new GCal event for a task and saves the google_event_id.
 */
async function handleCreate(
  accessToken: string,
  calendarId: string,
  task: Task,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<NextResponse> {
  if (!task.due_date) {
    return NextResponse.json({ synced: false, reason: "no_due_date" } satisfies GCalSyncResponse);
  }

  const eventId = await createCalendarEvent(accessToken, calendarId, task);
  if (!eventId) {
    return NextResponse.json({ synced: false, error: "Failed to create event" } satisfies GCalSyncResponse);
  }

  // Attach only if the task still has no google_event_id. A quick add-then-edit
  // fires create + update as two independent fire-and-forget requests; if the
  // update's create-fallback races this create, both would mint an event and
  // orphan one. The conditional update lets one win; the loser deletes its dup.
  const { data: won } = await supabase
    .from("tasks")
    .update({ google_event_id: eventId })
    .eq("id", task.id)
    .is("google_event_id", null)
    .select("id")
    .maybeSingle();
  if (!won) {
    await deleteCalendarEvent(accessToken, calendarId, eventId).catch(() => {});
    return NextResponse.json({ synced: true } satisfies GCalSyncResponse);
  }
  return NextResponse.json({ synced: true, googleEventId: eventId } satisfies GCalSyncResponse);
}

/**
 * Updates an existing GCal event, creating or deleting as needed.
 */
async function handleUpdate(
  accessToken: string,
  calendarId: string,
  task: Task,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<NextResponse> {
  if (!task.google_event_id && task.due_date) {
    return handleCreate(accessToken, calendarId, task, supabase);
  }
  if (task.google_event_id && !task.due_date) {
    await deleteCalendarEvent(accessToken, calendarId, task.google_event_id);
    await supabase.from("tasks").update({ google_event_id: null }).eq("id", task.id);
    return NextResponse.json({ synced: true, reason: "event_deleted_no_due_date" } satisfies GCalSyncResponse);
  }
  if (!task.google_event_id) {
    return NextResponse.json({ synced: false, reason: "no_due_date" } satisfies GCalSyncResponse);
  }

  const result = await updateCalendarEvent(accessToken, calendarId, task.google_event_id, task);
  if (result === "not_found") {
    await supabase.from("tasks").update({ google_event_id: null }).eq("id", task.id);
    if (task.due_date) {
      return handleCreate(accessToken, calendarId, { ...task, google_event_id: null }, supabase);
    }
    return NextResponse.json({ synced: false, reason: "event_deleted_externally" } satisfies GCalSyncResponse);
  }

  return NextResponse.json({
    synced: !!result,
    googleEventId: task.google_event_id,
    ...(!result && { error: "Failed to update event" }),
  } satisfies GCalSyncResponse);
}

/**
 * Deletes a GCal event and clears the google_event_id on the task.
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
    return NextResponse.json({ synced: false, reason: "no_event_id" } satisfies GCalSyncResponse);
  }
  await deleteCalendarEvent(accessToken, calendarId, googleEventId);
  await supabase.from("tasks").update({ google_event_id: null }).eq("id", taskId).eq("user_id", userId);
  return NextResponse.json({ synced: true } satisfies GCalSyncResponse);
}
