/**
 * Pure helpers and vocabulary for the inbox page: the date filters, the
 * sort modes, and the "Synced Xm ago" label. No React.
 */
import { Inbox, Sun, CalendarRange } from "lucide-react";
import type { Task } from "@/lib/types";
import { toDateStr } from "@/components/tasks/task-list-helpers";

export type InboxFilter = "all" | "today" | "7days";
export type ViewMode = "list" | "board";
export type SortMode = "date" | "class";

/** Filter entries in menu order. Labels are sentence case. */
export const FILTER_OPTIONS: {
  key: InboxFilter;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { key: "all", label: "Inbox", icon: Inbox },
  { key: "today", label: "Today", icon: Sun },
  { key: "7days", label: "Next 7 days", icon: CalendarRange },
];

/**
 * Reports whether a string is one of the inbox filters.
 *
 * @param value - Candidate from the URL or storage
 * @returns True for "all", "today" or "7days"
 */
export function isInboxFilter(value: string | null): value is InboxFilter {
  return value !== null && FILTER_OPTIONS.some((o) => o.key === value);
}

/**
 * Filters tasks by due date relative to today.
 *
 * Repeating tasks are NOT expanded into virtual instances here: the base
 * row's due_date always holds the next occurrence (completing advances it),
 * so each repeating task appears exactly once in the list. The calendar is
 * the only view that expands future occurrences.
 *
 * "all" returns everything: the list folds tasks due more than 30 days out
 * into a collapsed Later section instead of dropping them.
 *
 * @param tasks - Array of tasks to filter
 * @param filter - "all" = everything, "today" = due today or earlier + undated, "7days" = next 7 days
 * @param now - Reference date (defaults to now)
 * @returns Filtered tasks
 */
export function filterTasksByDate(tasks: Task[], filter: InboxFilter, now: Date = new Date()): Task[] {
  if (filter === "all") return tasks;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);
  if (filter === "today") {
    return tasks.filter((t) => !t.due_date || t.due_date <= todayStr);
  }
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + 7);
  const rangeEndStr = toDateStr(rangeEnd);
  return tasks.filter((t) => !t.due_date || t.due_date <= rangeEndStr);
}

/**
 * Sorts tasks by due_date ascending (undated first) with sort_order as the
 * tiebreaker within a date.
 *
 * @param tasks - Tasks to sort
 * @returns New sorted array (does not mutate input)
 */
export function sortByDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity);
    if (!a.due_date) return -1;
    if (!b.due_date) return 1;
    const dateCmp = a.due_date.localeCompare(b.due_date);
    if (dateCmp !== 0) return dateCmp;
    return (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity);
  });
}

/**
 * Sorts tasks by course_name alphabetically (null last), then by due_date.
 *
 * @param tasks - Tasks to sort
 * @returns New sorted array (does not mutate input)
 */
export function sortByClass(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const ca = a.course_name || "￿";
    const cb = b.course_name || "￿";
    const cmp = ca.localeCompare(cb);
    if (cmp !== 0) return cmp;
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return -1;
    if (!b.due_date) return 1;
    return a.due_date.localeCompare(b.due_date);
  });
}

/**
 * Short "Synced Xm ago" label for the toolbar.
 *
 * @param lastSyncedAt - ISO timestamp of the last sync, or null
 * @param now - Reference time in epoch ms
 * @returns "Synced just now", "Synced 5m ago", "Synced 3h ago", "Synced 2d ago",
 *          or null when there has been no sync
 */
export function formatSyncedAgo(lastSyncedAt: string | null, now: number = Date.now()): string | null {
  if (!lastSyncedAt) return null;
  const then = new Date(lastSyncedAt).getTime();
  if (!Number.isFinite(then)) return null;
  const minutes = Math.max(0, Math.floor((now - then) / 60_000));
  if (minutes < 1) return "Synced just now";
  if (minutes < 60) return `Synced ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Synced ${hours}h ago`;
  return `Synced ${Math.floor(hours / 24)}d ago`;
}
