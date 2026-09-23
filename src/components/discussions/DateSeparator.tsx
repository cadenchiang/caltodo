"use client";

/**
 * iMessage-style date divider between message groups in chat.
 * Centered text, no horizontal lines. Shows time for "Today".
 *
 * @param date - ISO date string to display
 */
interface DateSeparatorProps {
  date: string;
}

/**
 * Formats a date string as an iMessage-style label.
 * "Today" includes the time (e.g. "Today 7:52 PM").
 * "Yesterday" includes time. Older dates show day and time.
 *
 * @param dateStr - ISO date string
 * @returns Formatted date label like "Today 7:52 PM"
 */
function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / 86_400_000);

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Today ${time}`;
  if (diffDays === 1) return `Yesterday ${time}`;
  if (diffDays < 7) {
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    return `${day} ${time}`;
  }
  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${day} ${time}`;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex justify-center py-3">
      <span className="text-[11px] font-medium text-muted-foreground/70">
        {formatDateLabel(date)}
      </span>
    </div>
  );
}
