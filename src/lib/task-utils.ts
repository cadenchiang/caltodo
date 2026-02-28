import { format } from "date-fns";
import type { Task } from "@/lib/types";

/**
 * Formats a 24-hour time string "HH:MM" to 12-hour format "h:mm AM/PM".
 *
 * @param time24 - Time string in "HH:MM" format (e.g. "23:59")
 * @returns Formatted time string (e.g. "11:59 PM")
 */
export function formatTime12h(time24: string): string {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute} ${ampm}`;
}

/**
 * Returns a human-readable due date label, optional time label, and color class.
 *
 * @param dueDate - ISO date string ("YYYY-MM-DD") or null
 * @param dueTime - 24-hour time string ("HH:MM") or null
 * @returns Object with dateLabel, timeLabel, and className, or null if no date
 */
export function getDueDateInfo(
  dueDate: string | null,
  dueTime: string | null
): { dateLabel: string; timeLabel: string | null; className: string } | null {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const timeLabel = dueTime ? formatTime12h(dueTime) : null;

  if (diffDays < 0) {
    const month = due.toLocaleString("en-US", { month: "short" });
    const day = due.getDate();
    return { dateLabel: `${month} ${day}`, timeLabel, className: "text-red-400" };
  }
  if (diffDays === 0) {
    return { dateLabel: "Today", timeLabel, className: "text-blue-400" };
  }
  if (diffDays === 1) {
    return { dateLabel: "Tomorrow", timeLabel, className: "text-blue-400" };
  }
  if (diffDays <= 7) {
    const month = due.toLocaleString("en-US", { month: "short" });
    const day = due.getDate();
    return { dateLabel: `${month} ${day}`, timeLabel, className: "text-blue-400" };
  }

  const month = due.toLocaleString("en-US", { month: "short" });
  const day = due.getDate();
  return { dateLabel: `${month} ${day}`, timeLabel, className: "text-subtle-foreground" };
}

/**
 * Returns an array of source badges for a task (e.g. "bCourses", "Submitted", late due).
 *
 * @param task - The task to extract source badges from
 * @returns Array of badge objects with label and className
 */
export function getSourceBadges(task: Task): { label: string; className: string }[] {
  const badges: { label: string; className: string }[] = [];

  if (task.source) {
    const map: Record<string, { label: string; cls: string }> = {
      canvas: { label: "bCourses", cls: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/40" },
      pensieve: { label: "Pensieve", cls: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-600/40" },
      gradescope: { label: "Gradescope", cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-600/40" },
    };
    const entry = map[task.source];
    if (entry) badges.push({ label: entry.label, className: entry.cls });
  }

  if (task.is_submitted) {
    badges.push({ label: "Submitted", className: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-600/40" });
  }

  if (task.late_due_date) {
    badges.push({
      label: `Late due ${format(new Date(task.late_due_date + "T00:00:00"), "MMM d")}`,
      className: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-600/40",
    });
  }

  return badges;
}
