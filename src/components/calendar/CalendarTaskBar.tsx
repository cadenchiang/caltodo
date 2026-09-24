"use client";

import { useState } from "react";
import { Check, Repeat } from "lucide-react";
import type { Task } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { hexToRgba } from "@/lib/gcal/event-utils";
import { isVirtualRepeatInstance } from "@/lib/expand-repeating-tasks";

/** MIME type carried by a task drag so day cells can recognise it. */
export const TASK_DRAG_TYPE = "application/x-caltodo-task-id";

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
  /**
   * Allows the bar to be dragged to another day. Only the month grid has
   * drop targets, so it is the only caller that sets this. Pending invites
   * and virtual repeat instances are never draggable.
   */
  draggable?: boolean;
}

/**
 * Formats a 24-hour time string "HH:MM" to compact 12-hour format.
 * e.g. "23:59" -> "11:59p", "09:00" -> "9a", "14:30" -> "2:30p"
 *
 * @param time24 - Time string in "HH:MM" format
 * @returns Compact formatted time string
 */
export function formatTimeCompact(time24: string): string {
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "p" : "a";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  if (m === "00") return `${h12}${suffix}`;
  return `${h12}:${m}${suffix}`;
}

/**
 * Compact task bar in a calendar cell: coloured left edge and tint, time in
 * the task colour, title in text-foreground so it passes contrast on every
 * colour. Drag is opt-in and off for pending invites and virtual repeats.
 *
 * @param task - The task to display
 * @param onClick - Callback when clicked (opens the preview)
 * @param isPending - Dashed outline for a pending invite
 * @param draggable - Enables drag to another day (month grid only)
 */
export default function CalendarTaskBar({
  task,
  onClick,
  isPending,
  compact = false,
  isActive = false,
  justDropped = false,
  draggable = false,
}: CalendarTaskBarProps) {
  const { colorTheme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const color = getThemeColor(task.color, colorTheme);
  const highlighted = hovered || isActive;
  const canDrag = draggable && !isPending && !isVirtualRepeatInstance(task.id);

  /** Starts a drag, storing the task id for the drop target and anchoring the preview at the pickup point. */
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!canDrag) return;
    e.stopPropagation();
    e.dataTransfer.setData(TASK_DRAG_TYPE, task.id);
    e.dataTransfer.effectAllowed = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    e.dataTransfer.setDragImage(e.currentTarget, e.clientX - rect.left, e.clientY - rect.top);
    requestAnimationFrame(() => setIsDragging(true));
  };

  return (
    <button
      type="button"
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(task, e.currentTarget.getBoundingClientRect());
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full text-left flex items-center gap-1 rounded transition-all overflow-hidden hover:-translate-y-px hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        compact ? "px-1 py-0 h-[16px]" : "px-1.5 py-0.5 h-[22px]"
      } ${task.is_completed || isPending ? "opacity-60" : ""} ${justDropped ? "calendar-task-drop-in" : ""} ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={
        isPending
          ? {
              backgroundColor: "transparent",
              border: `1px dashed ${hexToRgba(color, 0.4)}`,
              borderLeftWidth: "2px",
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
      aria-label={isPending ? `Pending invite: ${task.title}` : task.title}
    >
      {task.is_completed && !isPending && (
        <Check size={10} strokeWidth={3} className="shrink-0 hidden md:block" style={{ color }} aria-hidden="true" />
      )}
      {task.due_time && (
        <span className={`${compact ? "text-3xs" : "text-2xs"} font-medium shrink-0`} style={{ color }}>
          {formatTimeCompact(task.due_time)}
        </span>
      )}
      <span className={`${compact ? "text-3xs" : "text-xs"} font-medium truncate text-foreground ${task.is_completed ? "line-through" : ""}`}>
        {task.title}
      </span>
      {task.repeat_interval && task.repeat_unit && (
        <Repeat size={10} strokeWidth={2.5} className="shrink-0 text-muted-foreground" aria-label="Repeats" />
      )}
    </button>
  );
}
