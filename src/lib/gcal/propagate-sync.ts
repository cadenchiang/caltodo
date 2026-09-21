/**
 * Propagates server-side assignment sync changes to Google Calendar.
 *
 * The client pushes its own edits, but the assignment sync engine rewrites
 * due_date/due_time/title straight into the tasks table and auto-dismisses
 * assignments that vanished from the source, so a professor moving a
 * deadline left the Google event on the old day forever. Both entry points
 * are best-effort and bounded: they never throw into the sync, stop after
 * MAX_EVENTS_PER_RUN or TIME_BUDGET_MS, and log whatever they did not reach.
 *
 * @module gcal/propagate-sync
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { updateCalendarEvent, deleteCalendarEvent } from "@/lib/gcal/calendar-sync";
import type { Task } from "@/lib/types";

/** Most Google events touched by one call (each is one API request). */
export const MAX_EVENTS_PER_RUN = 10;

/** Stop starting new Google requests after this long, per call. */
export const TIME_BUDGET_MS = 2_500;

/** Chunk size for .in() filters so a large id list cannot overflow the URL. */
const IN_CHUNK = 200;

/** What upsertAssignments knows about a task before it overwrites it. */
export interface PreUpsertRow {
  id: string;
  external_id: string | null;
  title: string;
  due_date: string | null;
  due_time: string | null;
  google_event_id: string | null;
}

/** Outcome counts, for logs and tests. */
export interface PropagateResult {
  /** Tasks whose event was updated or removed. */
  propagated: number;
  /** Tasks whose Google request failed. */
  failed: number;
  /** Changed tasks not attempted because of the caps. */
  remaining: number;
}

/** Columns needed to rebuild the event payload (see buildEventPayload). */
const EVENT_COLUMNS = "id, title, description, due_date, due_time, is_completed, course_name, source_url, google_event_id";
type EventRow = Pick<Task, "id" | "title" | "description" | "due_date" | "due_time" | "is_completed" | "course_name" | "source_url" | "google_event_id">;

/**
 * Loads the current event-relevant columns of the given task ids.
 *
 * @returns The rows, or null when a chunk failed (logged).
 */
async function loadEventRows(supabase: SupabaseClient, userId: string, ids: string[]): Promise<EventRow[] | null> {
  const rows: EventRow[] = [];
  for (let i = 0; i < ids.length; i += IN_CHUNK) {
    const { data, error } = await supabase
      .from("tasks")
      .select(EVENT_COLUMNS)
      .eq("user_id", userId)
      .in("id", ids.slice(i, i + IN_CHUNK));
    if (error) {
      logger.error("propagate-sync: failed to load tasks", { userId, count: ids.length, error: error.message });
      return null;
    }
    rows.push(...((data ?? []) as unknown as EventRow[]));
  }
  return rows;
}

/**
 * Resolves the Google access token and write calendar, or null when the
 * user is not connected (the common case, so it stays quiet).
 */
async function resolveCalendar(supabase: SupabaseClient, userId: string): Promise<{ accessToken: string; calendarId: string } | null> {
  const accessToken = await getValidAccessToken(supabase, userId);
  if (!accessToken) return null;
  const calendarId = await getCalendarId(supabase, userId);
  if (!calendarId) return null;
  return { accessToken, calendarId };
}

/**
 * After upsertAssignments: pushes title/due_date/due_time changes of tasks
 * that already have a Google event.
 *
 * @param supabase - Client the sync runs with
 * @param userId - Whose tasks
 * @param source - The synced source, for logs
 * @param before - Rows as loaded before the upsert (external_id keyed)
 * @param upsertedExternalIds - external_ids the upsert actually wrote
 * @returns Outcome counts. Never throws.
 */
export async function propagateUpsertedAssignments(
  supabase: SupabaseClient,
  userId: string,
  source: string,
  before: PreUpsertRow[],
  upsertedExternalIds: string[],
): Promise<PropagateResult> {
  const result: PropagateResult = { propagated: 0, failed: 0, remaining: 0 };
  try {
    const upserted = new Set(upsertedExternalIds);
    const candidates = before.filter((r) => r.google_event_id && r.external_id && upserted.has(r.external_id));
    if (candidates.length === 0) return result;

    const current = await loadEventRows(supabase, userId, candidates.map((r) => r.id));
    if (!current) return result;
    const byId = new Map(candidates.map((r) => [r.id, r]));
    const changed = current.filter((row) => {
      const prev = byId.get(row.id);
      return !!prev && !!row.google_event_id &&
        (prev.title !== row.title || prev.due_date !== row.due_date || prev.due_time !== row.due_time);
    });
    if (changed.length === 0) return result;

    const calendar = await resolveCalendar(supabase, userId);
    if (!calendar) {
      logger.info("propagate-sync: changed tasks but Google Calendar not connected", { userId, source, changed: changed.length });
      return result;
    }

    const startedAt = Date.now();
    let index = 0;
    for (; index < changed.length && index < MAX_EVENTS_PER_RUN && Date.now() - startedAt < TIME_BUDGET_MS; index++) {
      const row = changed[index];
      const eventId = row.google_event_id as string;
      if (!row.due_date) {
        const ok = await deleteCalendarEvent(calendar.accessToken, calendar.calendarId, eventId);
        if (ok) {
          await supabase.from("tasks").update({ google_event_id: null }).eq("id", row.id);
          result.propagated++;
        } else {
          result.failed++;
        }
        continue;
      }
      const outcome = await updateCalendarEvent(calendar.accessToken, calendar.calendarId, eventId, row as Task);
      if (outcome === "not_found") {
        // The event is gone on Google's side; clearing the id lets initial-sync recreate it.
        await supabase.from("tasks").update({ google_event_id: null }).eq("id", row.id);
        result.propagated++;
      } else if (outcome) {
        result.propagated++;
      } else {
        result.failed++;
      }
    }
    result.remaining = changed.length - index;
    logger.info("propagate-sync: assignment changes pushed to Google", { userId, source, changed: changed.length, ...result });
    if (result.remaining > 0) {
      logger.warn("propagate-sync: cap reached, some changed events not updated", {
        userId, source, remaining: result.remaining, cap: MAX_EVENTS_PER_RUN, budgetMs: TIME_BUDGET_MS,
        impact: "those Google events show the old title or date until edited again",
      });
    }
  } catch (err) {
    logger.error("propagate-sync: unexpected error propagating upserts", {
      userId, source, error: err instanceof Error ? err.message : String(err),
    });
  }
  return result;
}

/**
 * After dismissMissingTasks: removes the Google events of tasks the sync
 * just auto-dismissed (the assignment disappeared from the source).
 *
 * @param supabase - Client the sync runs with
 * @param userId - Whose tasks
 * @param taskIds - Ids that were just dismissed
 * @returns Outcome counts. Never throws.
 */
export async function propagateDismissedTasks(
  supabase: SupabaseClient,
  userId: string,
  taskIds: string[],
): Promise<PropagateResult> {
  const result: PropagateResult = { propagated: 0, failed: 0, remaining: 0 };
  try {
    if (taskIds.length === 0) return result;
    const rows = await loadEventRows(supabase, userId, taskIds);
    if (!rows) return result;
    const withEvent = rows.filter((r) => !!r.google_event_id);
    if (withEvent.length === 0) return result;

    const calendar = await resolveCalendar(supabase, userId);
    if (!calendar) {
      logger.info("propagate-sync: dismissed tasks have events but Google Calendar not connected", { userId, count: withEvent.length });
      return result;
    }

    const startedAt = Date.now();
    let index = 0;
    for (; index < withEvent.length && index < MAX_EVENTS_PER_RUN && Date.now() - startedAt < TIME_BUDGET_MS; index++) {
      const row = withEvent[index];
      const ok = await deleteCalendarEvent(calendar.accessToken, calendar.calendarId, row.google_event_id as string);
      if (ok) {
        await supabase.from("tasks").update({ google_event_id: null }).eq("id", row.id);
        result.propagated++;
      } else {
        result.failed++;
      }
    }
    result.remaining = withEvent.length - index;
    logger.info("propagate-sync: dismissed task events removed from Google", { userId, dismissed: withEvent.length, ...result });
    if (result.remaining > 0) {
      logger.warn("propagate-sync: cap reached, some dismissed events not removed", {
        userId, remaining: result.remaining, cap: MAX_EVENTS_PER_RUN, budgetMs: TIME_BUDGET_MS,
        impact: "those events stay on the calendar; the ids remain so a later delete can find them",
      });
    }
  } catch (err) {
    logger.error("propagate-sync: unexpected error propagating dismissals", {
      userId, error: err instanceof Error ? err.message : String(err),
    });
  }
  return result;
}
