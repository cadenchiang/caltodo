/**
 * Pure helpers for the inbox list: partitioning into sections, sorting,
 * grouping by class, the "Later" cutoff, the snooze countdown, and the
 * same-date reorder rules. No React, so every rule here is unit tested.
 */
import type { Task } from "@/lib/types";
import { extractCourseCode } from "@/lib/course-name-merge";
import { isSnoozed } from "@/lib/snooze";

/** Maximum items shown per section before "show more" truncation. */
export const ITEMS_PER_SECTION = 10;

/** Tasks due more than this many days out fold into the collapsed Later section. */
export const LATER_DAYS = 30;

/** The four list sections, in display order. */
export interface TaskSections {
  /** Not done, not hidden, due within LATER_DAYS (or undated). */
  active: Task[];
  /** Not done, not hidden, due more than LATER_DAYS out. */
  later: Task[];
  /** Hidden by a snooze that has not expired. */
  snoozed: Task[];
  /** Done within the auto-hide window. */
  completed: Task[];
}

/**
 * Formats a countdown string from now until the given ISO timestamp.
 *
 * @param snoozedUntil - ISO 8601 timestamp when the snooze expires
 * @param nowMs - Reference time in epoch ms (defaults to Date.now())
 * @returns "Xd Yh", "Xh Ym", "Xm", "< 1m", or "Hidden" for a far-future snooze
 */
export function formatCountdown(snoozedUntil: string, nowMs: number = Date.now()): string {
  const diff = new Date(snoozedUntil).getTime() - nowMs;
  if (diff <= 0) return "< 1m";
  const totalMinutes = Math.ceil(diff / 60_000);
  const totalHours = Math.floor(totalMinutes / 60);
  // Snoozed for more than ~50 years: "Until I unhide".
  if (totalHours > 438_000) return "Hidden";
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Formats a Date as "YYYY-MM-DD" in local time.
 *
 * @param date - Date to format
 * @returns ISO date string
 */
export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Sorts tasks by due_date ascending, with sort_order as a tiebreaker for
 * same-date tasks. Undated tasks appear first.
 *
 * @param tasks - Tasks to sort
 * @returns New sorted array (does not mutate input)
 */
function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) {
      return (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity);
    }
    if (!a.due_date) return -1;
    if (!b.due_date) return 1;
    const dateCmp = a.due_date.localeCompare(b.due_date);
    if (dateCmp !== 0) return dateCmp;
    return (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity);
  });
}

/**
 * Splits tasks into the list's sections.
 *
 * @param tasks - Every task the page passes in (already filtered by the
 *                inbox filter)
 * @param now - Reference time
 * @param hideHours - Completed auto-hide window; 0 means never hide
 * @returns Sorted sections
 * @remarks A task due more than LATER_DAYS after today goes to `later`
 *          rather than being dropped, which is what the old 30-day filter
 *          did silently.
 */
export function partitionTasks(tasks: Task[], now: Date, hideHours: number): TaskSections {
  const nowMs = now.getTime();
  const laterCutoff = new Date(now);
  laterCutoff.setHours(0, 0, 0, 0);
  laterCutoff.setDate(laterCutoff.getDate() + LATER_DAYS);
  const laterCutoffStr = toDateStr(laterCutoff);

  const active: Task[] = [];
  const later: Task[] = [];
  const snoozed: Task[] = [];
  const completed: Task[] = [];

  for (const t of tasks) {
    if (t.is_completed) {
      const completedTime = t.completed_at ? new Date(t.completed_at).getTime() : nowMs;
      if (hideHours === 0 || !t.completed_at || completedTime > nowMs - hideHours * 60 * 60 * 1000) {
        completed.push(t);
      }
    } else if (isSnoozed(t.snoozed_until, nowMs)) {
      snoozed.push(t);
    } else if (t.due_date && t.due_date > laterCutoffStr) {
      later.push(t);
    } else {
      active.push(t);
    }
  }

  return {
    active: sortByDueDate(active),
    later: sortByDueDate(later),
    snoozed: sortByDueDate(snoozed),
    completed: sortByDueDate(completed),
  };
}

/**
 * Groups tasks by course_name, merging courses with the same extracted code
 * (e.g. "UGBA 101A-LEC-002" and "UGBA 101A" both become "UGBA 101A").
 * Tasks with null course_name are grouped under "General".
 *
 * @param tasks - Pre-sorted array of tasks
 * @returns Ordered array of [groupName, tasks[]] pairs
 */
export function groupByCourse(tasks: Task[]): [string, Task[]][] {
  const codeToCanonical = new Map<string, string>();
  const map = new Map<string, Task[]>();

  for (const t of tasks) {
    const raw = t.course_name || "General";
    const code = raw !== "General" ? extractCourseCode(raw) : null;
    let key: string;
    if (code) {
      const existing = codeToCanonical.get(code);
      if (!existing || raw.length < existing.length) codeToCanonical.set(code, raw);
      key = code;
    } else {
      key = raw;
    }
    const list = map.get(key);
    if (list) list.push(t);
    else map.set(key, [t]);
  }

  const result: [string, Task[]][] = [];
  for (const [key, group] of map) {
    result.push([codeToCanonical.get(key) || key, group]);
  }
  return result;
}

/**
 * Reports whether two tasks may be reordered against each other: manual
 * order only exists among tasks that share a due date (or are both undated).
 *
 * @param a - One task
 * @param b - Another task
 * @returns True when a drop of one onto the other is allowed
 */
export function isSameDateSibling(a: Task, b: Task): boolean {
  return (a.due_date ?? null) === (b.due_date ?? null);
}

/**
 * Computes the new sort_order values after moving one task within its
 * same-date siblings. Only the siblings are renumbered, so nothing outside
 * the date group is written.
 *
 * @param list - The displayed active list (sorted)
 * @param taskId - The task being moved
 * @param targetIndex - Index in `list` to move it to
 * @returns Updates for the affected siblings, or null when the move crosses
 *          a date boundary or changes nothing
 */
export function reorderWithinDate(
  list: Task[],
  taskId: string,
  targetIndex: number
): Array<{ id: string; sort_order: number }> | null {
  const from = list.findIndex((t) => t.id === taskId);
  if (from === -1) return null;
  const moving = list[from];
  const clampedTarget = Math.max(0, Math.min(targetIndex, list.length - 1));
  if (clampedTarget === from) return null;
  const target = list[clampedTarget];
  if (!isSameDateSibling(moving, target)) return null;

  const siblings = list.filter((t) => isSameDateSibling(t, moving));
  const siblingFrom = siblings.findIndex((t) => t.id === taskId);
  const siblingTo = siblings.findIndex((t) => t.id === target.id);
  const reordered = [...siblings];
  reordered.splice(siblingFrom, 1);
  reordered.splice(siblingTo, 0, moving);
  return reordered.map((t, i) => ({ id: t.id, sort_order: (i + 1) * 1000 }));
}

/**
 * Computes the updates for a one-step keyboard move.
 *
 * @param list - The displayed active list (sorted)
 * @param taskId - The task to move
 * @param direction - -1 for up, 1 for down
 * @returns Updates, or null when the neighbour is on a different date or
 *          the task is already at the edge
 */
export function moveTaskByStep(
  list: Task[],
  taskId: string,
  direction: -1 | 1
): Array<{ id: string; sort_order: number }> | null {
  const from = list.findIndex((t) => t.id === taskId);
  if (from === -1) return null;
  const to = from + direction;
  if (to < 0 || to >= list.length) return null;
  return reorderWithinDate(list, taskId, to);
}
