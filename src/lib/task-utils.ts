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

/** How close a due date is. Drives the chip color. */
export type DateUrgency = "overdue" | "soon" | "later";

/**
 * The one relative date label: "Overdue 2 days", "Today", "Tomorrow",
 * "In 3 days", or "Sep 3". Shared by every due-date chip so the wording
 * never drifts between the inbox, board, previews and onboarding.
 *
 * @param dueDate - ISO date string ("YYYY-MM-DD")
 * @param now - Reference date; defaults to the current time (tests pass a fixed date)
 * @returns The label, the signed day distance, and the urgency bucket
 * @remarks Anything more than 7 days out is a calendar date, not a distance.
 */
export function getRelativeDateLabel(
  dueDate: string,
  now: Date = new Date()
): { label: string; diffDays: number; urgency: DateUrgency } {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysLate = Math.abs(diffDays);
    const label = daysLate === 1 ? "Overdue 1 day" : `Overdue ${daysLate} days`;
    return { label, diffDays, urgency: "overdue" };
  }
  if (diffDays === 0) return { label: "Today", diffDays, urgency: "soon" };
  if (diffDays === 1) return { label: "Tomorrow", diffDays, urgency: "soon" };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, diffDays, urgency: "soon" };

  const month = due.toLocaleString("en-US", { month: "short" });
  return { label: `${month} ${due.getDate()}`, diffDays, urgency: "later" };
}

/**
 * Text color classes for a due-date chip. Light mode uses the 600 step so
 * the chip passes 4.5:1 on white; dark mode uses 400.
 *
 * @param urgency - Bucket from getRelativeDateLabel
 * @param isCompleted - Completed tasks read muted regardless of urgency
 * @returns Tailwind classes
 */
export function getUrgencyClass(urgency: DateUrgency, isCompleted = false): string {
  if (isCompleted) return "text-muted-foreground";
  if (urgency === "overdue") return "text-red-600 dark:text-red-400";
  if (urgency === "soon") return "text-blue-600 dark:text-blue-400";
  return "text-subtle-foreground";
}

/**
 * Returns a human-readable due date label, optional time label, and color class.
 *
 * @param dueDate - ISO date string ("YYYY-MM-DD") or null
 * @param dueTime - 24-hour time string ("HH:MM") or null
 * @returns Object with dateLabel, timeLabel, and className, or null if no date
 * @remarks Wraps getRelativeDateLabel and getUrgencyClass, so the classes are
 *          the AA-passing 600-step light / 400-step dark pair. New chips
 *          should use DueDatePill directly.
 */
export function getDueDateInfo(
  dueDate: string | null,
  dueTime: string | null
): { dateLabel: string; timeLabel: string | null; className: string } | null {
  if (!dueDate) return null;

  const { label, urgency } = getRelativeDateLabel(dueDate);
  // timeLabel is suppressed on an overdue task (no clock time on a past
  // task) so the pill stays short.
  const timeLabel = dueTime && urgency !== "overdue" ? formatTime12h(dueTime) : null;
  return { dateLabel: label, timeLabel, className: getUrgencyClass(urgency) };
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
