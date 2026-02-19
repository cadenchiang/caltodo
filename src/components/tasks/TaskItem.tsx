"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Trash2, Repeat, MoreVertical } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
}

/**
 * Formats a 24-hour time string "HH:MM" to 12-hour format "h:mm AM/PM".
 *
 * @param time24 - Time string in "HH:MM" format (e.g. "23:59")
 * @returns Formatted time string (e.g. "11:59 PM")
 */
function formatTime12h(time24: string): string {
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
function getDueDateBadge(dueDate: string | null, dueTime: string | null): { dateLabel: string; timeLabel: string | null; className: string } | null {
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
  return { dateLabel: `${month} ${day}`, timeLabel, className: "text-muted-foreground" };
}

/**
 * Single task row with checkbox, title, source logo, and due date.
 * Hover shows dark gray background. Right-click opens delete context menu.
 * Completed tasks render with reduced opacity for a faded look.
 *
 * @param task - The task data to display
 * @param isSelected - Whether this task is currently selected
 * @param onToggle - Callback to toggle completion
 * @param onSelect - Callback when task is clicked to show detail panel
 * @param onDelete - Callback to delete the task
 */
export default function TaskItem({ task, isSelected, onToggle, onSelect, onDelete }: TaskItemProps) {
  const rawBadge = getDueDateBadge(task.due_date, task.due_time);
  const dueBadge = rawBadge && task.is_completed ? { ...rawBadge, className: "text-subtle-foreground" } : rawBadge;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const isOptimistic = task.id.startsWith("temp-");

  /**
   * Opens the delete menu from right-click context menu.
   */
  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }

  /**
   * Opens the delete menu from the three-dots button.
   */
  function handleDotsClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    }
    setMenuOpen(true);
  }

  function handleDelete() {
    setMenuOpen(false);
    onDelete(task.id);
  }

  return (
    <>
      <div
        className={`group flex items-center gap-3 px-6 h-10 mx-2 rounded-xl transition-colors duration-100 cursor-pointer ${
          isSelected
            ? "bg-black/5 dark:bg-muted/60"
            : "hover:bg-accent"
        } ${task.is_completed ? "opacity-40" : ""} ${isOptimistic ? "animate-task-slide-in" : ""}`}
        onClick={(e) => onSelect(task, e.currentTarget.getBoundingClientRect())}
        onContextMenu={handleContextMenu}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className="group/check flex-shrink-0 w-3.5 h-3.5 rounded-[3px] flex items-center justify-center transition-all"
          style={{
            backgroundColor: task.is_completed ? `color-mix(in srgb, ${task.color || "#D1D5DB"} 35%, #9CA3AF)` : "transparent",
            border: task.is_completed ? "none" : `1px solid ${task.color || "#D1D5DB"}`,
          }}
          aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.is_completed ? (
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none" className="opacity-0 group-hover/check:opacity-40 transition-opacity">
              <path d="M1 4L3.5 6.5L9 1" stroke={task.color || "#D1D5DB"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Title */}
        <span
          className={`flex-1 min-w-0 truncate text-sm ${
            task.is_completed ? "text-foreground line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </span>


        {/* Repeat indicator */}
        {task.repeat_interval && task.repeat_unit && (
          <Repeat size={12} className="text-purple-400 shrink-0" />
        )}

        {/* Due time and date */}
        {dueBadge && (
          <span className={`text-xs shrink-0 font-medium ${dueBadge.className}`}>
            {dueBadge.timeLabel && (
              <span className="text-muted-foreground opacity-70">{dueBadge.timeLabel} </span>
            )}
            {dueBadge.dateLabel}
          </span>
        )}

        {/* Three-dots menu button */}
        <button
          ref={menuBtnRef}
          type="button"
          onClick={handleDotsClick}
          className="shrink-0 -mr-2 p-0.5 rounded text-subtle-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-accent transition-all"
          aria-label="Task options"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Delete menu (from right-click or three-dots) */}
      {menuOpen && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setMenuOpen(false)}
            onContextMenu={(e) => { e.preventDefault(); setMenuOpen(false); }}
          />
          <div
            className="fixed z-50 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[140px]"
            style={{ top: menuPos.y, left: menuPos.x }}
          >
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 size={14} />
              Delete task
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
