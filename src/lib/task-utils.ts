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
    // Overdue: show "Overdue N day(s)" so the urgency is unmistakable.
    // timeLabel is suppressed (no clock time on a past task) so the
    // pill stays short.
    const daysLate = Math.abs(diffDays);
    const label = daysLate === 1 ? "Overdue 1 day" : `Overdue ${daysLate} days`;
    return { dateLabel: label, timeLabel: null, className: "text-red-400" };
  }
  if (diffDays === 0) {
    return { dateLabel: "Today", timeLabel, className: "text-blue-400" };
  }
  if (diffDays === 1) {
    return { dateLabel: "Tomorrow", timeLabel, className: "text-blue-400" };
  }
  if (diffDays <= 7) {
    // Inside a week, distance reads faster than a date: "In 3 days" says how
    // much runway is left, where "Sep 3" makes the reader do the subtraction.
    return { dateLabel: `In ${diffDays} days`, timeLabel, className: "text-blue-400" };
  }

  const month = due.toLocaleString("en-US", { month: "short" });
  const day = due.getDate();
  return { dateLabel: `${month} ${day}`, timeLabel, className: "text-subtle-foreground" };
}

/**
 * Builds the due-date label for the wide detail panel.
 *
 * The panel used the long "Mon, Aug 31, 2026" form for everything, so a task
 * the list called "Today" read as a bare date beside it. Near dates now use
 * the same relative wording as the list; anything further out keeps the long
 * form, which the extra width makes worth having.
 *
 * @param dueDate - ISO date string ("YYYY-MM-DD") or null
 * @param dueTime - 24-hour time string ("HH:MM") or null
 * @param isCompleted - Whether the task is done
 * @returns Label parts, or null when the task has no due date. exactDate
 *          carries the calendar date when dateLabel is a relative phrase, and
 *          is null when dateLabel already is the date, so the panel never
 *          prints the same thing twice.
 * @remarks A completed task never reads "Overdue": the check already says
 *          what happened, and red on a finished task is just noise.
 */
export function getDetailDateInfo(
  dueDate: string | null,
  dueTime: string | null,
  isCompleted: boolean
): {
  dateLabel: string;
  exactDate: string | null;
  timeLabel: string | null;
  className: string;
} | null {
  const info = getDueDateInfo(dueDate, dueTime);
  if (!info || !dueDate) return null;

  const isOverdue = !isCompleted && info.dateLabel.startsWith("Overdue");
  const useRelative =
    isOverdue ||
    info.dateLabel === "Today" ||
    info.dateLabel === "Tomorrow" ||
    info.dateLabel.startsWith("In ");

  const due = new Date(dueDate + "T00:00:00");
  const longDate = due.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    dateLabel: useRelative ? info.dateLabel : longDate,
    // "In 3 days" says how much runway is left but not which day to put in a
    // calendar, so the panel — which has the width for it — shows both.
    exactDate: useRelative ? longDate : null,
    // An overdue pill stays short: the day count is the point, not the hour.
    timeLabel: isOverdue ? null : info.timeLabel,
    className: isCompleted ? "text-muted-foreground" : info.className,
  };
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
      pensieve: { label: "Pensive", cls: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-600/40" },
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
