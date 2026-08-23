/**
 * Task creation and deletion backing the MCP write tools.
 *
 * Mirrors the app's own semantics from TaskContext: manually created tasks
 * have no source and are hard-deleted, while synced Canvas/Gradescope
 * assignments are soft-deleted by stamping `dismissed_at` so the sync engine
 * does not resurrect them on the next run.
 *
 * Uses the Supabase service-role client because MCP requests carry no user
 * session; every statement is explicitly scoped to a single `user_id`.
 *
 * @module mcp/mutations
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

/** Fields accepted when creating a task through MCP. */
export interface CreateTaskInput {
  /** Task title. Required and non-empty. */
  title: string;
  /** Optional longer description. */
  description?: string;
  /** Due date as YYYY-MM-DD, or null for no due date. */
  dueDate?: string | null;
  /** Due time as HH:MM (24h), or null. Ignored by the app without a due date. */
  dueTime?: string | null;
  /** Course or project label shown on the task. */
  course?: string | null;
  /** Free-form tags. */
  tags?: string[];
}

/** A task as returned by {@link createTask}. */
export interface CreatedTask {
  id: string;
  title: string;
  due_date: string | null;
  due_time: string | null;
  course_name: string | null;
}

/** Outcome of {@link deleteTask}. */
export interface DeleteTaskResult {
  /** Title of the removed task, for a useful confirmation message. */
  title: string;
  /** True when the row was soft-deleted (a synced assignment) rather than removed. */
  soft: boolean;
}

/** Matches the app's default task color (init_tasks migration). */
const DEFAULT_COLOR = "#3B82F6";

/** YYYY-MM-DD. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** HH:MM in 24-hour form. */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Longest accepted title, matching what the app's UI realistically stores. */
const MAX_TITLE_LENGTH = 500;

/**
 * Validates a create-task input and normalizes it into a row to insert.
 *
 * @param input - Raw input from the MCP tool
 * @returns Column values ready to insert, without `user_id`
 * @throws Error when the title is blank or too long, or when the date/time
 *         strings are not YYYY-MM-DD / HH:MM
 * @remarks A due time without a due date is dropped rather than rejected: the
 *          app only renders a time alongside a date, so keeping it would store
 *          a value no view can show.
 */
export function buildTaskRow(input: CreateTaskInput): Record<string, unknown> {
  const title = input.title?.trim();
  if (!title) throw new Error("A task needs a non-empty title.");
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title is too long (${title.length} chars, max ${MAX_TITLE_LENGTH}).`);
  }

  const dueDate = input.dueDate ?? null;
  if (dueDate !== null && !DATE_PATTERN.test(dueDate)) {
    throw new Error(`Invalid due_date "${dueDate}". Expected YYYY-MM-DD.`);
  }

  const dueTime = input.dueTime ?? null;
  if (dueTime !== null && !TIME_PATTERN.test(dueTime)) {
    throw new Error(`Invalid due_time "${dueTime}". Expected HH:MM in 24-hour form.`);
  }

  return {
    title,
    description: input.description?.trim() || "",
    due_date: dueDate,
    // The app only shows a time next to a date; a lone time would be invisible.
    due_time: dueDate ? dueTime : null,
    course_name: input.course?.trim() || null,
    tags: input.tags ?? [],
    color: DEFAULT_COLOR,
  };
}

/**
 * Creates a manual task for one user.
 *
 * @param userId - caltodo user the task belongs to
 * @param input - Title plus optional description, due date/time, course and tags
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns The created task's id and the fields worth echoing back
 * @throws Error when validation fails or the insert is rejected
 * @remarks The row has no `source`, so the sync engine leaves it alone and the
 *          app treats it exactly like a task typed into the inbox.
 */
export async function createTask(
  userId: string,
  input: CreateTaskInput,
  client: SupabaseClient = createAdminClient()
): Promise<CreatedTask> {
  const row = buildTaskRow(input);

  const { data, error } = await client
    .from("tasks")
    .insert({ ...row, user_id: userId })
    .select("id, title, due_date, due_time, course_name")
    .single();

  if (error) {
    logger.error("mcp.mutations: create failed", {
      cause: error.message,
      userId,
      title: row.title,
      impact: "create_task tool returned an error to Poke",
    });
    throw new Error(`Failed to create task: ${error.message}`);
  }

  const created = data as unknown as CreatedTask;
  logger.info("mcp.mutations: task created", { userId, taskId: created.id });
  return created;
}

/**
 * Deletes one task, matching the app's delete behavior.
 *
 * @param userId - caltodo user the task must belong to
 * @param taskId - Id of the task to delete
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns The deleted task's title and whether it was a soft delete
 * @throws Error when the task does not exist, belongs to another user, is
 *         already deleted, or the statement is rejected
 * @remarks Synced assignments (those with a source and external id) are
 *          soft-deleted with `dismissed_at` + `dismissed_by_user` so the next
 *          sync does not bring them back; manual tasks are removed outright.
 *          The lookup is scoped by `user_id`, so an id belonging to another
 *          account reads as "not found" rather than deleting someone's task.
 */
export async function deleteTask(
  userId: string,
  taskId: string,
  client: SupabaseClient = createAdminClient()
): Promise<DeleteTaskResult> {
  const { data, error: lookupError } = await client
    .from("tasks")
    .select("id, title, source, external_id, dismissed_at")
    .eq("user_id", userId)
    .eq("id", taskId)
    .maybeSingle();

  if (lookupError) {
    logger.error("mcp.mutations: delete lookup failed", {
      cause: lookupError.message,
      userId,
      taskId,
      impact: "delete_task tool returned an error to Poke",
    });
    throw new Error(`Failed to look up task: ${lookupError.message}`);
  }

  if (!data) {
    logger.warn("mcp.mutations: delete target missing", {
      cause: "no task with that id for this user",
      userId,
      taskId,
      impact: "delete_task tool reported not found",
    });
    throw new Error(`No task found with id "${taskId}".`);
  }

  const task = data as unknown as {
    id: string;
    title: string;
    source: string | null;
    external_id: string | null;
    dismissed_at: string | null;
  };

  if (task.dismissed_at) {
    throw new Error(`Task "${task.title}" is already deleted.`);
  }

  const isSynced = !!(task.source && task.external_id);

  const { error: writeError } = isSynced
    ? await client
        .from("tasks")
        .update({ dismissed_at: new Date().toISOString(), dismissed_by_user: true })
        .eq("user_id", userId)
        .eq("id", taskId)
    : await client.from("tasks").delete().eq("user_id", userId).eq("id", taskId);

  if (writeError) {
    logger.error("mcp.mutations: delete failed", {
      cause: writeError.message,
      userId,
      taskId,
      soft: isSynced,
      impact: "delete_task tool returned an error to Poke",
    });
    throw new Error(`Failed to delete task: ${writeError.message}`);
  }

  logger.info("mcp.mutations: task deleted", { userId, taskId, soft: isSynced });
  return { title: task.title, soft: isSynced };
}
