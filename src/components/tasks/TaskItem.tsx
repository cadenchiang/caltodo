"use client";

import { useState, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { Trash2, Repeat, MoreVertical, Clock, EyeOff } from "lucide-react";
import type { Task } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { getDueDateInfo } from "@/lib/task-utils";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import TaskCheckbox from "./shared/TaskCheckbox";

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
function TaskItemImpl({ task, isSelected, onToggle, onSelect, onDelete }: TaskItemProps) {
  const { snoozeTask } = useTaskContext();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const taskColor = getThemeColor(task.color, colorTheme);
  const rawBadge = getDueDateInfo(task.due_date, task.due_time);
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
    // 1-click delete with optimistic UI; the toast that follows includes an
    // Undo action (TaskContext.deleteTask), so the prior 2-click confirm was
    // unnecessary friction.
    setMenuOpen(false);
    onDelete(task.id);
  }

  return (
    <>
      <div
        className={`group relative flex items-center gap-3 -ml-3 pl-3 pr-3 py-2.5 md:gap-3 md:-ml-4 md:pl-4 md:pr-4 md:py-2.5 rounded-xl transition-colors duration-100 cursor-pointer hover:bg-foreground/[0.035] dark:hover:bg-foreground/[0.07] ${
          isSelected ? "bg-foreground/[0.06] dark:bg-foreground/[0.11]" : ""
        } ${task.is_completed ? "opacity-60" : ""} ${isOptimistic ? "animate-task-slide-in" : ""}`}
        onClick={(e) => { e.stopPropagation(); onSelect(task, e.currentTarget.getBoundingClientRect()); }}
        onContextMenu={handleContextMenu}
      >
        <TaskCheckbox
          color={taskColor}
          isCompleted={task.is_completed}
          onToggle={() => onToggle(task.id)}
          size="xs"
        />

        {/* Title + tags */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span
            className={`truncate text-sm font-normal ${
              task.is_completed ? "text-muted-foreground line-through" : "text-foreground"
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

        {/* Due time and date — pill, matches the board view styling. Bg
            tint is derived from the badge text color via color-mix so it
            tracks the urgency hue (red overdue, blue upcoming, etc.). */}
        {dueBadge && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] shrink-0 font-semibold ml-auto ${dueBadge.className}`}
            style={{ backgroundColor: "color-mix(in srgb, currentColor 14%, transparent)" }}
          >
            {dueBadge.timeLabel && (
              <span className="opacity-60 mr-1">{dueBadge.timeLabel}</span>
            )}
            {dueBadge.dateLabel}
          </span>
        )}

        {/* Three-dots menu button removed — right-click still opens the
            context menu (handleContextMenu on the row) and tasks can be
            deleted from the detail panel. */}
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
              aria-label="Delete task"
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

/**
 * Memoized export. Re-renders only when one of {task, isSelected, onToggle,
 * onSelect, onDelete} changes by reference. Parents passing inline arrow
 * callbacks will defeat memoization — use useCallback.
 */
const TaskItem = memo(TaskItemImpl);
export default TaskItem;
