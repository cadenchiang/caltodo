/**
 * Describes a task edit and how to take it back.
 *
 * Every edit in the detail panel goes through one `save` call carrying only
 * the fields that changed. This turns that into the two things an undo needs:
 * a sentence naming what moved, and the update that puts it back.
 *
 * @module task-edit-summary
 */

import type { Task, TaskUpdate } from "@/lib/types";

/** Fields an undo can restore, and what to call each one. */
const FIELD_LABELS: Partial<Record<keyof TaskUpdate, string>> = {
  title: "Title",
  description: "Description",
  due_date: "Due date",
  due_time: "Due time",
  tags: "Tags",
  course_name: "Class",
  color: "Colour",
  repeat_interval: "Repeat",
  repeat_unit: "Repeat",
  repeat_end_date: "Repeat end",
  repeat_end_count: "Repeat end",
};

/**
 * Reads one field off a task by name.
 *
 * @param task - The task to read from
 * @param key - A field name shared by Task and TaskUpdate
 * @returns The stored value, or undefined when the task has no such field
 * @remarks Task has no index signature, so the read goes through `unknown`.
 *          Every key reaching this comes from a TaskUpdate, whose fields are
 *          all columns on Task.
 */
function fieldValue(task: Task, key: keyof TaskUpdate): unknown {
  return (task as unknown as Record<string, unknown>)[key];
}

/** What changed, and the update that undoes it. */
export interface TaskEditSummary {
  /** Sentence for the toast, e.g. "Due date changed". */
  label: string;
  /** The update that restores every field this edit touched. */
  revert: TaskUpdate;
}

/**
 * Reports whether an update actually changes anything on the task.
 *
 * @param task - The task before the edit
 * @param updates - The fields being written
 * @returns True when at least one field would end up different
 * @remarks Arrays are compared by contents, so re-saving the same tags in the
 *          same order is correctly seen as a no-op. Everything else is
 *          compared by value, which is what the columns hold.
 */
export function isRealChange(task: Task, updates: TaskUpdate): boolean {
  return changedKeys(task, updates).length > 0;
}

/**
 * Lists the fields an update would actually change.
 *
 * @param task - The task before the edit
 * @param updates - The fields being written
 * @returns The keys whose value would differ afterwards
 */
function changedKeys(task: Task, updates: TaskUpdate): (keyof TaskUpdate)[] {
  const keys = Object.keys(updates) as (keyof TaskUpdate)[];
  return keys.filter((key) => {
    const next = updates[key];
    const prev = fieldValue(task, key);
    if (Array.isArray(next) || Array.isArray(prev)) {
      const a = Array.isArray(prev) ? prev : [];
      const b = Array.isArray(next) ? next : [];
      return a.length !== b.length || a.some((v, i) => v !== b[i]);
    }
    // A column that is null and an update that omits it are the same absence.
    return (prev ?? null) !== (next ?? null);
  });
}

/**
 * Summarises an edit and builds its undo.
 *
 * @param task - The task as it was before the edit
 * @param updates - The fields being written
 * @returns The summary, or null when nothing actually changes
 * @remarks Only fields that genuinely differ are put in the revert, so undo
 *          writes back the narrowest update that restores the task rather
 *          than re-stamping every field the caller happened to pass. Two
 *          fields that describe one idea (a repeat is an interval and a unit)
 *          share a label, so the toast says "Repeat changed" once instead of
 *          naming the columns.
 */
export function summariseTaskEdit(task: Task, updates: TaskUpdate): TaskEditSummary | null {
  const changed = changedKeys(task, updates);
  if (changed.length === 0) return null;

  const revert: TaskUpdate = {};
  for (const key of changed) {
    const prev = fieldValue(task, key);
    // Tags are the one array column; a null there must go back as an empty
    // list, since the column is not nullable.
    if (key === "tags") revert.tags = Array.isArray(prev) ? [...prev] : [];
    else (revert as Record<string, unknown>)[key] = prev ?? null;
  }

  const names = [...new Set(changed.map((k) => FIELD_LABELS[k]).filter(Boolean))] as string[];
  const label =
    names.length === 0
      ? "Assignment updated"
      : names.length === 1
        ? `${names[0]} changed`
        : `${names.length} fields changed`;

  return { label, revert };
}
