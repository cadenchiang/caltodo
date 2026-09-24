"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
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
 * Compact task bar in a calendar day cell. Restored from commit
 * 400e1bf ("Polish calendar UI: event colors, animations, grid
 * refinements") — single-row chip with a colored left border, light
 * tinted background, and time + title on one line. Drag-and-drop +
 * active-state highlighting layered back on top of the visual.
 *
 * @param task - The task to display
 * @param onClick - Callback when clicked (opens popover with full details)
 * @param isPending - When true, renders as a dashed outline bar for pending invites
 */
export default function CalendarTaskBar({
  task,
  onClick,
  isPending,
  compact = false,
  isActive = false,
  justDropped = false,
}: CalendarTaskBarProps) {
  const { colorTheme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const color = getThemeColor(task.color, colorTheme);
  const highlighted = hovered || isActive;
  const draggable = !isPending;

  /**
   * Begin a drag for this task. Stores the task id in dataTransfer so the
   * target day cell can resolve it on drop and call updateTask with the
   * new due_date. Uses setDragImage to anchor the drag preview to the
   * exact pickup point under the cursor.
   */
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    e.stopPropagation();
    e.dataTransfer.setData("application/x-caltodo-task-id", task.id);
    e.dataTransfer.effectAllowed = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    e.dataTransfer.setDragImage(
      e.currentTarget,
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
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
      className={`w-full text-left flex items-center gap-0.5 rounded transition-all overflow-hidden hover:-translate-y-px hover:shadow-sm ${compact ? "px-1 py-0 h-[16px]" : "px-1.5 py-0.5 h-[22px]"} ${
        task.is_completed ? "opacity-50" : ""
      } ${isPending ? "opacity-50" : ""} ${justDropped ? "calendar-task-drop-in" : ""}`}
      style={
        isPending
          ? {
              backgroundColor: "transparent",
              border: `1px dashed ${hexToRgba(color, 0.4)}`,
              borderLeftWidth: "2px",
              opacity: isDragging ? 0.35 : undefined,
            }
          : {
              backgroundColor: hexToRgba(color, highlighted ? 0.22 : 0.12),
              borderLeft: `2px solid ${color}`,
              opacity: isDragging ? 0.35 : undefined,
              transform: isActive ? "scale(1.02)" : undefined,
              zIndex: isActive ? 20 : "auto",
              position: isActive ? "relative" : undefined,
            }
      }
      title={isPending ? `Pending invite: ${task.title}` : task.title}
    >
      {task.is_completed && !isPending && (
        <svg
          className="w-2.5 h-2.5 shrink-0 mr-1 hidden md:block"
          style={{ color }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {task.due_time && (
        <span
          className={`${compact ? "text-[9px]" : "text-[11px]"} font-medium shrink-0`}
          style={{ color }}
        >
          {formatTimeCompact(task.due_time)}
        </span>
      )}
      <span
        className={`${compact ? "text-[10px]" : "text-[12px]"} font-medium truncate ${task.is_completed ? "line-through" : ""}`}
        style={{ color }}
      >
        {truncateTitle(task.title, MAX_TITLE_CHARS)}
      </span>
      {task.repeat_interval && task.repeat_unit && (
        <svg
          className="w-2.5 h-2.5 shrink-0 opacity-40 text-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 2l4 4-4 4" />
          <path d="M3 11v-1a4 4 0 014-4h14" />
          <path d="M7 22l-4-4 4-4" />
          <path d="M21 13v1a4 4 0 01-4 4H3" />
        </svg>
      )}
    </button>
  );
}
