/**
 * Task completion and edits for the MCP tools.
 *
 * Kept separate from mutations.ts (create and delete) so each module stays
 * small and single-purpose. Uses the Supabase service-role client because MCP
 * requests carry no user session; every statement is scoped to one `user_id`.
 *
 * @module mcp/task-updates
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

/** Columns read back after a change, for the confirmation message. */
const RETURN_COLUMNS = "id, title, is_completed, due_date, due_time, course_name";

/** A task as returned after being changed. */
export interface UpdatedTask {
  id: string;
  title: string;
  is_completed: boolean;
  due_date: string | null;
  due_time: string | null;
  course_name: string | null;
}

/** Fields {@link updateTask} can change. */
export interface TaskEdits {
  title?: string;
  description?: string;
  /** YYYY-MM-DD, or null to clear the due date. */
  dueDate?: string | null;
  /** HH:MM 24-hour, or null to clear the time. */
  dueTime?: string | null;
  course?: string | null;
  /**
   * The task's full tag list, replacing whatever it had.
   *
   * create_task accepted tags from the start and update_task did not, so a
   * tag set through MCP could never afterwards be changed through MCP.
   * Replaces rather than merges: an assistant asked to remove a tag has no
   * other way to do it, and it can read the current list first.
   */
  tags?: string[];
}

/** YYYY-MM-DD. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** HH:MM in 24-hour form. */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Loads a task the caller owns.
 *
 * @param client - Supabase client
 * @param userId - Owner the task must belong to
 * @param taskId - Task to load
 * @returns The task's current state
 * @throws Error when the task does not exist for this user
 * @remarks Scoping the lookup by user_id means another account's id reads as
 *          "not found" rather than exposing or changing someone else's task.
 */
async function requireOwnTask(
  client: SupabaseClient,
  userId: string,
  taskId: string
): Promise<UpdatedTask> {
  const { data, error } = await client
    .from("tasks")
    .select(RETURN_COLUMNS)
    .eq("user_id", userId)
    .eq("id", taskId)
    .is("dismissed_at", null)
    .maybeSingle();

  if (error) {
    logger.error("mcp.taskUpdates: lookup failed", {
      cause: error.message,
      userId,
      taskId,
      impact: "tool returned an error to the assistant",
    });
    throw new Error(`Failed to look up task: ${error.message}`);
  }

  if (!data) throw new Error(`No task found with id "${taskId}".`);
  return data as unknown as UpdatedTask;
}

/**
 * Marks a task complete or brings it back.
 *
 * @param userId - caltodo user the task belongs to
 * @param taskId - Task to change
 * @param completed - True to complete it, false to reopen it
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns The task's state after the change
 * @throws Error when the task is not the caller's, or the write fails
 * @remarks `completed_at` is stamped alongside `is_completed` and cleared on
 *          reopen, matching what the app writes when you tick the box.
 */
export async function setTaskCompletion(
  userId: string,
  taskId: string,
  completed: boolean,
  client: SupabaseClient = createAdminClient()
): Promise<UpdatedTask> {
  const task = await requireOwnTask(client, userId, taskId);

  if (task.is_completed === completed) {
    // Nothing to write; report the current state rather than a no-op error.
    return task;
  }

  const { data, error } = await client
    .from("tasks")
    .update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("user_id", userId)
    .eq("id", taskId)
    .select(RETURN_COLUMNS)
    .single();

  if (error) {
    logger.error("mcp.taskUpdates: completion write failed", {
      cause: error.message,
      userId,
      taskId,
      completed,
      impact: "complete_task tool returned an error to the assistant",
    });
    throw new Error(`Failed to update task: ${error.message}`);
  }

  logger.info("mcp.taskUpdates: completion changed", { userId, taskId, completed });
  return data as unknown as UpdatedTask;
}

/**
 * Builds the column patch for an edit, validating formats.
 *
 * @param edits - Fields the caller wants to change
 * @returns Column values to write
 * @throws Error when nothing was supplied, the title is blank, or a date or
 *         time is malformed
 */
export function buildEditPatch(edits: TaskEdits): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  if (edits.title !== undefined) {
    const title = edits.title.trim();
    if (!title) throw new Error("Title cannot be empty.");
    patch.title = title;
  }

  if (edits.description !== undefined) {
    patch.description = edits.description.trim();
  }

  if (edits.tags !== undefined) {
    // Trimmed, blanks dropped, de-duplicated case-insensitively, matching what
    // the app's own tag editor stores.
    const seen = new Set<string>();
    patch.tags = edits.tags
      .map((tag) => tag.trim())
      .filter((tag) => {
        if (!tag) return false;
        const key = tag.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  if (edits.dueDate !== undefined) {
    if (edits.dueDate !== null && !DATE_PATTERN.test(edits.dueDate)) {
      throw new Error(`Invalid due_date "${edits.dueDate}". Expected YYYY-MM-DD.`);
    }
    patch.due_date = edits.dueDate;
    // A time with no date is invisible in the app, so clear it alongside.
    if (edits.dueDate === null) patch.due_time = null;
  }

  if (edits.dueTime !== undefined) {
    if (edits.dueTime !== null && !TIME_PATTERN.test(edits.dueTime)) {
      throw new Error(`Invalid due_time "${edits.dueTime}". Expected HH:MM in 24-hour form.`);
    }
    patch.due_time = edits.dueTime;
  }

  if (edits.course !== undefined) {
    patch.course_name = edits.course === null ? null : edits.course.trim() || null;
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("Nothing to change. Supply at least one field.");
  }

  return patch;
}

/**
 * Edits a task's title, description, due date/time or course.
 *
 * @param userId - caltodo user the task belongs to
 * @param taskId - Task to change
 * @param edits - Fields to change; omitted fields are left alone
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns The task's state after the change
 * @throws Error when the task is not the caller's, the edits are invalid, or
 *         the write fails
 * @remarks Editing a due date on a synced assignment also stamps
 *          `due_date_manually_edited_at`, which is how the sync engine knows
 *          not to overwrite a date the user deliberately moved.
 */
export async function updateTask(
  userId: string,
  taskId: string,
  edits: TaskEdits,
  client: SupabaseClient = createAdminClient()
): Promise<UpdatedTask> {
  const patch = buildEditPatch(edits);
  await requireOwnTask(client, userId, taskId);

  const now = new Date().toISOString();
  if ("due_date" in patch) patch.due_date_manually_edited_at = now;
  if ("due_time" in patch) patch.due_time_manually_edited_at = now;

  const { data, error } = await client
    .from("tasks")
    .update(patch)
    .eq("user_id", userId)
    .eq("id", taskId)
    .select(RETURN_COLUMNS)
    .single();

  if (error) {
    logger.error("mcp.taskUpdates: edit failed", {
      cause: error.message,
      userId,
      taskId,
      fields: Object.keys(patch),
      impact: "update_task tool returned an error to the assistant",
    });
    throw new Error(`Failed to update task: ${error.message}`);
  }

  logger.info("mcp.taskUpdates: task edited", { userId, taskId, fields: Object.keys(patch) });
  return data as unknown as UpdatedTask;
}
