"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";

interface CalendarTaskBarProps {
  task: Task;
  onClick: (task: Task, rect: DOMRect) => void;
  /** When true, renders as a dashed outline bar for pending invites. */
  isPending?: boolean;
}

/**
 * Converts a hex color to an rgba string at the given opacity.
 *
 * @param hex - Hex color string (e.g. "#3b82f6")
 * @param opacity - Opacity between 0 and 1
 * @returns rgba string
 */
function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Formats a 24-hour time string "HH:MM" to compact 12-hour format.
 * e.g. "23:59" → "11:59p", "09:00" → "9a", "14:30" → "2:30p"
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
 * Left colored border, light glassy background, colored text.
 * Titles are truncated to MAX_TITLE_CHARS with "..." — full title shown on hover.
 *
 * @param task - The task to display
 * @param onClick - Callback when clicked (opens popover with full details)
 */
export default function CalendarTaskBar({ task, onClick, isPending }: CalendarTaskBarProps) {
  const { colorTheme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const color = getThemeColor(task.color, colorTheme);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(task, e.currentTarget.getBoundingClientRect());
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full text-left flex items-center gap-1 px-2 py-0.5 rounded-md transition-all overflow-hidden hover:-translate-y-px hover:shadow-sm ${
        task.is_completed ? "opacity-70" : ""
      } ${isPending ? "opacity-50" : ""}`}
      style={isPending ? {
        backgroundColor: "transparent",
        borderLeft: `2px dashed ${color}`,
        border: `1px dashed ${hexToRgba(color, 0.4)}`,
        borderLeftWidth: "2px",
      } : {
        backgroundColor: hexToRgba(color, hovered ? 0.18 : 0.1),
        borderLeft: `2px solid ${color}`,
      }}
      title={isPending ? `Pending invite: ${task.title}` : task.title}
    >
      {task.is_completed && !isPending && (
        <svg className="w-3 h-3 shrink-0 mr-1 hidden md:block" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {task.due_time && (
        <span
          className="text-[10px] font-semibold shrink-0 opacity-70"
          style={{ color: isPending ? hexToRgba(color, 0.6) : color }}
        >
          {formatTimeCompact(task.due_time)}
        </span>
      )}
      <span
        className={`text-[11px] font-medium truncate ${task.is_completed && !isPending ? "line-through" : ""}`}
        style={{ color: isPending ? hexToRgba(color, 0.6) : color }}
      >
        {truncateTitle(task.title, MAX_TITLE_CHARS)}
      </span>
    </button>
  );
}
