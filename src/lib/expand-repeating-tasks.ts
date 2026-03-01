/**
 * Expands repeating tasks into virtual display instances for a given date range.
 * Used by Calendar and Inbox to show future occurrences without requiring completion.
 *
 * Virtual instances share the original task's ID with a ":repeat:YYYY-MM-DD" suffix
 * so they can be distinguished from real database rows.
 *
 * @module expand-repeating-tasks
 */

import type { Task } from "@/lib/types";
import { computeNextDueDate } from "@/lib/repeat";

/** Maximum virtual instances to generate per task to prevent infinite loops. */
const MAX_EXPANSIONS = 200;

/**
 * Checks whether a task ID represents a virtual repeat instance.
 *
 * @param taskId - The task ID to check
 * @returns true if the ID contains the ":repeat:" marker
 */
export function isVirtualRepeatInstance(taskId: string): boolean {
  return taskId.includes(":repeat:");
}

/**
 * Extracts the real task ID from a virtual repeat instance ID.
 *
 * @param taskId - A task ID, possibly containing ":repeat:" suffix
 * @returns The original task ID without the repeat suffix
 */
export function getRealTaskId(taskId: string): string {
  const idx = taskId.indexOf(":repeat:");
  return idx >= 0 ? taskId.slice(0, idx) : taskId;
}

/**
 * Expands repeating tasks into virtual instances within a date range.
 * Non-repeating tasks are passed through unchanged.
 * Completed repeating tasks are passed through unchanged.
 *
 * For each incomplete repeating task with a due_date, generates future
 * occurrences from the task's due_date up to rangeEnd. Each virtual
 * instance is a shallow copy with an adjusted due_date and suffixed ID.
 *
 * Respects repeat_end_date and repeat_end_count limits.
 *
 * @param tasks - Array of real tasks from the database
 * @param rangeStart - Start of visible range "YYYY-MM-DD" (inclusive)
 * @param rangeEnd - End of visible range "YYYY-MM-DD" (inclusive)
 * @returns Array containing original tasks plus virtual repeat instances
 */
export function expandRepeatingTasks(
  tasks: Task[],
  rangeStart: string,
  rangeEnd: string,
): Task[] {
  const result: Task[] = [];

  for (const task of tasks) {
    // Pass through non-repeating tasks unchanged
    if (!task.repeat_interval || !task.repeat_unit || !task.due_date) {
      result.push(task);
      continue;
    }

    // Pass through completed repeating tasks unchanged
    if (task.is_completed) {
      result.push(task);
      continue;
    }

    // Include the original task itself (it has a real due_date)
    result.push(task);

    // Generate virtual future instances
    let currentDate = task.due_date;
    let count = 1; // original counts as 1

    for (let i = 0; i < MAX_EXPANSIONS; i++) {
      const nextDate = computeNextDueDate(
        currentDate,
        task.repeat_interval,
        task.repeat_unit,
      );

      // Stop if we've passed the visible range
      if (nextDate > rangeEnd) break;

      // Check end date limit
      if (task.repeat_end_date && nextDate > task.repeat_end_date) break;

      // Check end count limit
      count++;
      if (task.repeat_end_count !== null && count > task.repeat_end_count) break;

      // Only include if within visible range
      if (nextDate >= rangeStart) {
        result.push({
          ...task,
          id: `${task.id}:repeat:${nextDate}`,
          due_date: nextDate,
        });
      }

      currentDate = nextDate;
    }
  }

  return result;
}
