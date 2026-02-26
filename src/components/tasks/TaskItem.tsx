"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Trash2, Repeat, MoreVertical, Clock, EyeOff } from "lucide-react";
import type { Task } from "@/lib/types";
import { getMiffyColor } from "@/lib/constants";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";

/** Duration presets for the snooze submenu. */
const SNOOZE_PRESETS = [
  { label: "1 hour", hours: 1 },
  { label: "3 hours", hours: 3 },
  { label: "12 hours", hours: 12 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
] as const;

/** Far-future date used for "Until I unhide" snooze (~100 years). */
const FOREVER_HOURS = 876_000;

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
  return { dateLabel: `${month} ${day}`, timeLabel, className: "text-subtle-foreground" };
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
  const { snoozeTask } = useTaskContext();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const taskColor = isMiffy ? getMiffyColor(task.color) : task.color;
  const rawBadge = getDueDateBadge(task.due_date, task.due_time);
  // Miffy theme: swap blue-400 date badges to pink; completed tasks stay subtle
  const dueBadge = rawBadge && task.is_completed
    ? { ...rawBadge, className: "text-subtle-foreground" }
    : rawBadge && isMiffy && rawBadge.className === "text-blue-400"
      ? { ...rawBadge, className: "text-[#e8729a] dark:text-[#f4a0bc]" }
      : rawBadge;
  const [menuOpen, setMenuOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [customHours, setCustomHours] = useState("");
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const isOptimistic = task.id.startsWith("temp-");

  /**
   * Opens the delete menu from right-click context menu.
   */
  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 156);
    setMenuPos({ x, y: e.clientY });
    setMenuOpen(true);
  }

  /**
   * Opens the delete menu from the three-dots button.
   * Clamps x so the menu never overflows the right edge of the viewport.
   */
  function handleDotsClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      const x = Math.min(rect.left, window.innerWidth - 156);
      setMenuPos({ x, y: rect.bottom + 4 });
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
        className={`group flex items-center gap-2 px-3 h-10 mx-1 md:gap-3 md:px-6 md:mx-2 rounded-xl transition-colors duration-100 cursor-pointer ${
          isSelected
            ? "bg-black/5 dark:bg-muted/60"
            : "hover:bg-accent"
        } ${task.is_completed ? "opacity-60" : ""} ${isOptimistic ? "animate-task-slide-in" : ""}`}
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
            backgroundColor: task.is_completed ? `color-mix(in srgb, ${taskColor || "#D1D5DB"} 35%, #9CA3AF)` : "transparent",
            border: task.is_completed ? "none" : `1px solid ${taskColor || "#D1D5DB"}`,
          }}
          aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.is_completed ? (
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none" className="opacity-0 group-hover/check:opacity-40 transition-opacity">
              <path d="M1 4L3.5 6.5L9 1" stroke={taskColor || "#D1D5DB"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Title + tags */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span
            className={`truncate text-sm ${
              task.is_completed ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.title}
          </span>
          {task.tags && task.tags.length > 0 && (
            <span className="text-[9px] font-medium px-1 py-px rounded bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 shrink-0 truncate max-w-[80px]">
              {task.tags.length === 1 ? task.tags[0] : `${task.tags.length} tags`}
            </span>
          )}
        </div>

        {/* Repeat indicator */}
        {task.repeat_interval && task.repeat_unit && (
          <Repeat size={12} className="text-purple-400 shrink-0" />
        )}

        {/* Due time and date */}
        {dueBadge && (
          <span className={`text-[11px] shrink-0 font-normal ${dueBadge.className}`}>
            {dueBadge.timeLabel && (
              <span className="text-muted-foreground opacity-60">{dueBadge.timeLabel} </span>
            )}
            {dueBadge.dateLabel}
          </span>
        )}

        {/* Three-dots menu button */}
        <button
          ref={menuBtnRef}
          type="button"
          onClick={handleDotsClick}
          className="shrink-0 -mr-2 p-1.5 md:p-0.5 rounded text-subtle-foreground md:opacity-0 md:group-hover:opacity-100 hover:text-foreground hover:bg-accent transition-all"
          aria-label="Task options"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Context menu (from right-click or three-dots) */}
      {menuOpen && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => { setMenuOpen(false); setSnoozeOpen(false); }}
            onContextMenu={(e) => { e.preventDefault(); setMenuOpen(false); setSnoozeOpen(false); }}
          />
          <div
            className="fixed z-50 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[140px]"
            style={{ top: menuPos.y, left: menuPos.x }}
          >
            {/* Hide for... (snooze) submenu */}
            <div className="relative">
              <button
                onClick={() => setSnoozeOpen(!snoozeOpen)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <Clock size={14} />
                Hide for...
              </button>
              {snoozeOpen && (
                <div className="absolute left-full top-0 ml-1 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[140px] z-50">
                  {SNOOZE_PRESETS.map((preset) => (
                    <button
                      key={preset.hours}
                      onClick={() => {
                        snoozeTask(task.id, preset.hours);
                        setMenuOpen(false);
                        setSnoozeOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                  <div className="border-t border-border my-1" />
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const h = parseFloat(customHours);
                      if (h > 0) {
                        snoozeTask(task.id, h);
                        setMenuOpen(false);
                        setSnoozeOpen(false);
                        setCustomHours("");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5"
                  >
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      placeholder="hrs"
                      className="w-14 px-2 py-1 text-sm rounded-md border border-input-border bg-background text-foreground placeholder-muted-foreground focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground">hours</span>
                  </form>
                  <button
                    onClick={() => {
                      snoozeTask(task.id, FOREVER_HOURS);
                      setMenuOpen(false);
                      setSnoozeOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <EyeOff size={13} />
                    Until I unhide
                  </button>
                </div>
              )}
            </div>
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
