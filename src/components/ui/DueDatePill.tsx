import { cn } from "@/lib/utils";
import { formatTime12h, getRelativeDateLabel, getUrgencyClass } from "@/lib/task-utils";

export interface DueDatePillProps {
  /** ISO date ("YYYY-MM-DD"). Renders nothing when null. */
  dueDate: string | null;
  /** 24-hour time ("HH:MM"). Hidden on overdue tasks. */
  dueTime?: string | null;
  /** Completed tasks read muted, never red. */
  isCompleted?: boolean;
  /** Reference date for the relative label (tests). */
  now?: Date;
  /** Extra classes. */
  className?: string;
}

/**
 * Relative due-date chip: "Today", "Tomorrow", "In 3 days", "Overdue 2 days",
 * or "Sep 3", with an optional time. One place for the wording and colors.
 *
 * @param dueDate - Date to label
 * @param dueTime - Optional clock time, shown after the date
 * @param isCompleted - Muted styling for done tasks
 * @remarks Uses text-2xs (the caption step) so it sits inside task rows.
 */
export default function DueDatePill({ dueDate, dueTime, isCompleted = false, now, className }: DueDatePillProps) {
  if (!dueDate) return null;
  const { label, urgency } = getRelativeDateLabel(dueDate, now);
  const timeLabel = dueTime && urgency !== "overdue" ? formatTime12h(dueTime) : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-2xs font-medium whitespace-nowrap",
        getUrgencyClass(urgency, isCompleted),
        className
      )}
    >
      <time dateTime={dueDate}>{label}</time>
      {timeLabel && <span className="opacity-80">{timeLabel}</span>}
    </span>
  );
}
