/**
 * Pure helpers for the board view: column grouping (by class or by date
 * bucket), saved column order, column accents and the per-column partition
 * into active and completed cards.
 */
import type { Task } from "@/lib/types";
import { extractCourseCode } from "@/lib/course-name-merge";
import { isSnoozed } from "@/lib/snooze";
import { GENERAL_GROUP } from "./shared/ClassMenu";

/** Default column name for tasks without a course_name. */
const GENERAL_COLUMN = GENERAL_GROUP;

/** One column's tint set. Values are CSS colours (hex, rgba or var()). */
export interface ColumnAccent {
  dot: string;
  bg: string;
  subtle: string;
  text: string;
}

/**
 * Soft-tinted column accents. Each class column gets a deterministic slot
 * from a stable hash of its name; the blue slot reads the theme's accent so
 * it follows the colour theme like the rest of the app.
 */
const COLUMN_PALETTE: ColumnAccent[] = [
  { dot: "#A78BFA", bg: "rgba(167,139,250,0.16)", subtle: "rgba(167,139,250,0.03)", text: "#7C3AED" }, // violet
  { dot: "#F59E0B", bg: "rgba(245,158,11,0.16)", subtle: "rgba(245,158,11,0.03)", text: "#B45309" }, // amber
  {
    dot: "var(--color-blue-500)",
    bg: "color-mix(in srgb, var(--color-blue-500) 16%, transparent)",
    subtle: "color-mix(in srgb, var(--color-blue-500) 3%, transparent)",
    text: "var(--color-blue-500)",
  },
  { dot: "#10B981", bg: "rgba(16,185,129,0.16)", subtle: "rgba(16,185,129,0.03)", text: "#047857" }, // green
  { dot: "#EC4899", bg: "rgba(236,72,153,0.16)", subtle: "rgba(236,72,153,0.03)", text: "#BE185D" }, // pink
  { dot: "#06B6D4", bg: "rgba(6,182,212,0.16)", subtle: "rgba(6,182,212,0.03)", text: "#0E7490" }, // cyan
  { dot: "#F97316", bg: "rgba(249,115,22,0.16)", subtle: "rgba(249,115,22,0.03)", text: "#C2410C" }, // orange
];

/** Accent for the General column and for unparsable colours. */
const NEUTRAL_ACCENT: ColumnAccent = {
  dot: "var(--subtle-foreground)",
  bg: "color-mix(in srgb, var(--muted-foreground) 16%, transparent)",
  subtle: "color-mix(in srgb, var(--muted-foreground) 3%, transparent)",
  text: "var(--secondary-foreground)",
};

/** Date bucket labels used for date group-by mode, in chronological order. */
export const DATE_BUCKETS = ["Today", "Next 3 days", "Next 7 days", "Later"] as const;

/** Set form of DATE_BUCKETS for membership checks. */
export const DATE_BUCKET_SET: ReadonlySet<string> = new Set(DATE_BUCKETS);

/**
 * Builds an accent from an arbitrary hex colour so class columns match the
 * list view's task colours.
 *
 * @param hex - Six-digit hex colour
 * @returns Accent, or NEUTRAL_ACCENT when the hex cannot be parsed
 */
export function accentFromHex(hex: string): ColumnAccent {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return NEUTRAL_ACCENT;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return NEUTRAL_ACCENT;
  return { dot: hex, bg: `rgba(${r},${g},${b},0.16)`, subtle: `rgba(${r},${g},${b},0.03)`, text: hex };
}

/**
 * Returns the column accent for a column name. Date buckets get fixed slots
 * so they read as a status gradient; other names hash to a slot.
 *
 * @param name - The column's canonical key
 * @returns Accent for the column
 */
export function getColumnAccent(name: string): ColumnAccent {
  if (name === GENERAL_COLUMN) return NEUTRAL_ACCENT;
  const bucketIndex = (DATE_BUCKETS as readonly string[]).indexOf(name);
  if (bucketIndex !== -1) return COLUMN_PALETTE[bucketIndex];
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return COLUMN_PALETTE[Math.abs(h) % COLUMN_PALETTE.length];
}

/**
 * Groups tasks by course name into a Map, merging courses with the same
 * extracted code. Tasks without course_name go under General, which is
 * pinned first.
 *
 * @param tasks - Tasks to group
 * @returns Map of canonical column name to tasks, General first then A to Z
 */
export function groupByCourse(tasks: Task[]): Map<string, Task[]> {
  const codeToCanonical = new Map<string, string>();
  const codeGroups = new Map<string, Task[]>();
  for (const task of tasks) {
    const raw = task.course_name || GENERAL_COLUMN;
    const code = raw !== GENERAL_COLUMN ? extractCourseCode(raw) : null;
    let key: string;
    if (code) {
      const existing = codeToCanonical.get(code);
      if (!existing || raw.length < existing.length) codeToCanonical.set(code, raw);
      key = code;
    } else {
      key = raw;
    }
    const list = codeGroups.get(key);
    if (list) list.push(task);
    else codeGroups.set(key, [task]);
  }
  const entries: [string, Task[]][] = [];
  for (const [key, group] of codeGroups) entries.push([codeToCanonical.get(key) || key, group]);
  entries.sort((a, b) => {
    if (a[0] === GENERAL_COLUMN) return -1;
    if (b[0] === GENERAL_COLUMN) return 1;
    return a[0].localeCompare(b[0]);
  });
  return new Map(entries);
}

/**
 * Reorders columns by a saved order. Saved names come first; new columns are
 * appended alphabetically with General last; stale names are skipped.
 *
 * @param columns - Map of column name to tasks
 * @param savedOrder - Previously saved column names
 * @returns New Map in the resulting order
 */
export function applyColumnOrder(columns: Map<string, Task[]>, savedOrder: string[]): Map<string, Task[]> {
  const result = new Map<string, Task[]>();
  const remaining = new Set(columns.keys());
  for (const name of savedOrder) {
    if (columns.has(name)) {
      result.set(name, columns.get(name)!);
      remaining.delete(name);
    }
  }
  const newColumns = [...remaining].sort((a, b) => {
    if (a === GENERAL_COLUMN) return 1;
    if (b === GENERAL_COLUMN) return -1;
    return a.localeCompare(b);
  });
  for (const name of newColumns) result.set(name, columns.get(name)!);
  return result;
}

/**
 * Groups tasks into the four date buckets. Overdue goes to Today; undated
 * goes to Later. Empty buckets are kept so the layout is stable.
 *
 * @param tasks - Tasks to group
 * @param now - Reference date (defaults to today)
 * @returns Map of bucket name to tasks, in chronological order
 */
export function groupByDate(tasks: Task[], now: Date = new Date()): Map<string, Task[]> {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const d3 = new Date(today);
  d3.setDate(d3.getDate() + 3);
  const d7 = new Date(today);
  d7.setDate(d7.getDate() + 7);
  const groups = new Map<string, Task[]>(DATE_BUCKETS.map((b) => [b, []]));
  for (const task of tasks) {
    if (!task.due_date) {
      groups.get("Later")!.push(task);
      continue;
    }
    const due = new Date(task.due_date + "T00:00:00");
    if (due <= today) groups.get("Today")!.push(task);
    else if (due <= d3) groups.get("Next 3 days")!.push(task);
    else if (due <= d7) groups.get("Next 7 days")!.push(task);
    else groups.get("Later")!.push(task);
  }
  return groups;
}

/**
 * Sorts tasks by closest due date first; undated last.
 *
 * @param tasks - Tasks to sort
 * @returns New sorted array
 */
function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

/**
 * Splits a column's tasks into active and completed cards. Submitted tasks
 * count as completed; tasks hidden by an unexpired snooze are left out, so
 * the board honours "Hide for..." like the list does.
 *
 * @param tasks - The column's tasks
 * @param nowMs - Reference time for the snooze check
 * @returns Sorted active and completed lists
 */
export function partitionColumnTasks(tasks: Task[], nowMs: number = Date.now()): { active: Task[]; completed: Task[] } {
  const active: Task[] = [];
  const completed: Task[] = [];
  for (const t of tasks) {
    if (t.is_completed || t.is_submitted) completed.push(t);
    else if (!isSnoozed(t.snoozed_until, nowMs)) active.push(t);
  }
  return { active: sortByDueDate(active), completed: sortByDueDate(completed) };
}

/**
 * Most common task colour in a column, used as the column's accent and as
 * the default for new tasks added there.
 *
 * @param tasks - The column's tasks
 * @returns The dominant hex, or undefined for an empty column
 */
export function dominantColor(tasks: Task[]): string | undefined {
  if (tasks.length === 0) return undefined;
  const counts = new Map<string, number>();
  for (const t of tasks) counts.set(t.color, (counts.get(t.color) ?? 0) + 1);
  let best = tasks[0].color;
  let max = 0;
  for (const [c, n] of counts) {
    if (n > max) {
      best = c;
      max = n;
    }
  }
  return best;
}
