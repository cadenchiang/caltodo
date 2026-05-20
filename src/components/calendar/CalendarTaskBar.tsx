"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { getDueDateInfo } from "@/lib/task-utils";
import { useTheme } from "@/contexts/ThemeContext";
import { hexToRgba } from "@/lib/gcal/event-utils";

interface CalendarTaskBarProps {
  task: Task;
  onClick: (task: Task, rect: DOMRect) => void;
  /** When true, renders as a dashed outline bar for pending invites. */
  isPending?: boolean;
  /** When true, uses compact 16px height (month view). Default false = 24px (week/day). */
  compact?: boolean;
  /** When true, the task bar stays in its hover/highlighted state (popover is open). */
  isActive?: boolean;
  /** When true, plays a one-shot drop-in animation (used after drag-and-drop). */
  justDropped?: boolean;
}

/**
 * Formats a 24-hour time string "HH:MM" to compact 12-hour format.
 * e.g. "23:59" -> "11:59p", "09:00" -> "9a", "14:30" -> "2:30p"
 *
 * @param time24 - Time string in "HH:MM" format
 * @returns Compact formatted time string
 */
function formatTimeCompact(time24: string): string {
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const minute = m;
  const suffix = hour >= 12 ? "p" : "a";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  if (minute === "00") return `${h12}${suffix}`;
  return `${h12}:${minute}${suffix}`;
}

/** Max characters to display before truncating with ellipsis. */
const MAX_TITLE_CHARS = 28;

/**
 * Truncates a title to a max character count, appending "..." if needed.
 *
 * @param title - The full task title
 * @param max - Maximum characters before truncation
 * @returns Truncated title with ellipsis, or original if short enough
 */
function truncateTitle(title: string, max: number): string {
  if (title.length <= max) return title;
  return title.slice(0, max).trimEnd() + "...";
}

/**
 * Compact task bar in a calendar day cell.
 * Solid colored background with dark text, matching Google Calendar style.
 *
 * @param task - The task to display
 * @param onClick - Callback when clicked (opens popover with full details)
 * @param isPending - When true, renders as a dashed outline bar for pending invites
 */
export default function CalendarTaskBar({ task, onClick, isPending, compact = false, isActive = false, justDropped = false }: CalendarTaskBarProps) {
  const { colorTheme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const color = getThemeColor(task.color, colorTheme);
  const highlighted = hovered || isActive;

  // Pending invites can't be dragged — they aren't real tasks yet.
  const draggable = !isPending;

  /**
   * Begin a drag for this task. Stores the task id in dataTransfer so the
   * target day cell can resolve it on drop and call updateTask with the
   * new due_date. Uses setDragImage to anchor the drag preview to the
   * exact pickup point under the cursor (eliminates the default offset
   * jump and produces a much smoother glide). See CalendarDayCell.handleDrop.
   */
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    e.stopPropagation();
    e.dataTransfer.setData("application/x-caltodo-task-id", task.id);
    e.dataTransfer.effectAllowed = "move";
    // Anchor the drag image at the cursor's exact offset within the bar.
    const rect = e.currentTarget.getBoundingClientRect();
    e.dataTransfer.setDragImage(
      e.currentTarget,
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    // Defer state flip to next frame so the dragImage snapshot above is
    // captured at full opacity (otherwise the drag preview itself would dim).
    requestAnimationFrame(() => setIsDragging(true));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <button
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick(task, e.currentTarget.getBoundingClientRect());
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full text-left flex flex-col items-stretch gap-1 rounded-md overflow-hidden bg-white dark:bg-card border border-border ${compact ? "px-1.5 py-1" : "px-2 py-1.5"} ${
        task.is_completed ? "opacity-50" : ""
      } ${isPending ? "opacity-50" : ""} ${justDropped ? "calendar-task-drop-in" : ""}`}
      style={{
        transition:
          "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background-color 0.15s ease, opacity 0.18s ease",
        transform: isActive ? "scale(1.04)" : hovered && !isDragging ? "translateY(-1px)" : "none",
        boxShadow: isActive
          ? "0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)"
          : hovered && !isDragging ? "0 1px 3px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.03)",
        opacity: isDragging ? 0.35 : undefined,
        zIndex: isActive ? 20 : "auto",
        position: isActive ? "relative" : undefined,
        ...(isPending ? { borderStyle: "dashed" } : {}),
      }}
      title={isPending ? `Pending invite: ${task.title}` : task.title}
    >
      {/* Row 1: squircle (always shown) + title. Filled when completed
          (green for Gradescope submissions, blue otherwise), outlined
          when not. */}
      <div className="flex items-center gap-1.5 min-w-0">
        {!isPending && (() => {
          // Prefer the user-picked task color (pink, etc.) over the
          // source-based default so the checkmark visually matches the
          // task's class color everywhere it appears. Fall back to the
          // green/blue source defaults only when no custom color is set.
          const isGradescope = task.source === "gradescope";
          const sourceDefault = isGradescope ? "#10B981" : "#0e89d6";
          const fillColor = task.color ? color : sourceDefault;
          if (task.is_completed) {
            return (
              <span
                className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-[4px]"
                style={{ backgroundColor: fillColor }}
                aria-label="Completed"
              >
                <svg width={8} height={6} viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            );
          }
          return (
            <span
              className="shrink-0 inline-block w-3.5 h-3.5 rounded-[4px]"
              style={{ border: `1.75px solid ${fillColor}`, backgroundColor: "transparent" }}
              aria-label="Incomplete"
            />
          );
        })()}
        <span
          className={`${compact ? "text-[10px]" : "text-[12px]"} font-semibold truncate ${
            task.is_completed ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </span>
        {task.repeat_interval && task.repeat_unit && (
          <svg className="w-2.5 h-2.5 shrink-0 opacity-40 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 014-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 01-4 4H3" />
          </svg>
        )}
      </div>

      {/* Row 2: date / overdue status pill. Skipped entirely when the
          task is completed — the squircle on the title row already
          conveys done, and an "Overdue" label on a finished task would
          be misleading. */}
      {!isPending && !task.is_completed && (() => {
        const due = getDueDateInfo(task.due_date, task.due_time);
        if (!due) return null;
        const isOverdue = due.dateLabel.startsWith("Overdue");
        const text = isOverdue
          ? due.dateLabel
          : due.timeLabel
            ? `${due.timeLabel} · ${due.dateLabel}`
            : due.dateLabel;
        return (
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-1.5 py-px rounded-full text-[9px] font-semibold ${due.className}`}
              style={{ backgroundColor: "color-mix(in srgb, currentColor 14%, transparent)" }}
            >
              {text}
            </span>
          </div>
        );
      })()}
    </button>
  );
}
