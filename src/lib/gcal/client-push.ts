/**
 * Client-side helpers that push a task change to Google Calendar.
 *
 * Every helper is best-effort: it never throws into the caller, because a
 * Google Calendar failure must not block or break a local task edit. The
 * server (/api/gcal/sync) no-ops when Google Calendar is not connected.
 *
 * @module gcal/client-push
 */

import type { GCalSyncResponse, TaskUpdate } from "@/lib/types";

/** localStorage key mirroring the GCal connection status cache (see CalendarHeader). */
export const GCAL_STATUS_KEY = "gcal_status";

/**
 * Task columns that change the Google Calendar event payload (see
 * buildEventPayload in calendar-sync.ts). Edits to any other column, such
 * as color, tags or sort order, are invisible on the calendar and must not
 * spend a Google API request.
 */
export const GCAL_EVENT_FIELDS: ReadonlySet<string> = new Set([
  "title",
  "description",
  "due_date",
  "due_time",
  "is_completed",
  "course_name",
  "source_url",
]);

/**
 * Best-effort read of whether Google Calendar is connected, from the status
 * cache the calendar header keeps. Used to avoid firing per-edit GCal sync
 * requests for the majority of users who never connected GCal.
 *
 * @returns true only when the cache says connected; false on any read error.
 */
export function isGCalConnected(): boolean {
  try {
    const raw = localStorage.getItem(GCAL_STATUS_KEY);
    return raw ? JSON.parse(raw).connected === true : false;
  } catch {
    return false;
  }
}

/**
 * Whether a task update touches any column that appears on the calendar event.
 *
 * @param updates - The partial update about to be written.
 * @returns true when at least one changed column is in GCAL_EVENT_FIELDS.
 */
export function touchesGCalEvent(updates: TaskUpdate): boolean {
  return Object.keys(updates).some((key) => GCAL_EVENT_FIELDS.has(key));
}

/**
 * Propagates a single task change to Google Calendar via /api/gcal/sync.
 *
 * Skips the request when Google Calendar is not connected and the task has no
 * event to update or remove. For "delete", the server resolves the event id
 * from the task row when the caller does not know it, so callers must send
 * the delete BEFORE removing the row.
 *
 * @param action - create | update | delete
 * @param taskId - The task's id
 * @param googleEventId - Existing GCal event id, when the client knows it
 * @returns The event id now attached to the task (from a create, or a
 *          create-fallback inside update), or null when nothing was attached,
 *          the request was skipped, or it failed. Never rejects.
 */
export async function pushTaskToGCal(
  action: "create" | "update" | "delete",
  taskId: string,
  googleEventId?: string | null,
): Promise<string | null> {
  if (!isGCalConnected() && !googleEventId) return null;
  try {
    const res = await fetch("/api/gcal/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, taskId, googleEventId: googleEventId ?? undefined }),
    });
    if (!res.ok) {
      console.warn("pushTaskToGCal: request failed", { action, taskId, status: res.status });
      return null;
    }
    const body = (await res.json()) as GCalSyncResponse;
    if (action === "delete") return null;
    return body.synced && body.googleEventId ? body.googleEventId : null;
  } catch (err) {
    console.warn("pushTaskToGCal: request errored", {
      action, taskId, error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/** Most task ids one /api/gcal/delete-batch request accepts. */
export const GCAL_DELETE_BATCH_MAX = 100;

/**
 * Removes the Google Calendar events of many tasks in one request per 100
 * ids, instead of one /api/gcal/sync request per task (which tripped the
 * 30/min limit on a bulk class delete and orphaned the rest).
 *
 * The server resolves each event id from the task row, so this must run
 * BEFORE the rows are deleted. Resolves once every batch has been sent.
 *
 * @param taskIds - Ids of the tasks about to be deleted.
 * @returns Nothing. Never rejects; failures are logged.
 */
export async function pushBatchDeleteToGCal(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0 || !isGCalConnected()) return;
  for (let i = 0; i < taskIds.length; i += GCAL_DELETE_BATCH_MAX) {
    const chunk = taskIds.slice(i, i + GCAL_DELETE_BATCH_MAX);
    try {
      const res = await fetch("/api/gcal/delete-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds: chunk }),
      });
      if (!res.ok) {
        console.warn("pushBatchDeleteToGCal: request failed", {
          status: res.status, count: chunk.length, impact: "calendar events of these tasks may remain",
        });
      }
    } catch (err) {
      console.warn("pushBatchDeleteToGCal: request errored", {
        count: chunk.length, error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
