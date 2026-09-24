"use client";

import { useRef, useState, memo, type KeyboardEvent, type MouseEvent } from "react";
import { MoreHorizontal, Repeat } from "lucide-react";
import type { Task } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import DueDatePill from "@/components/ui/DueDatePill";
import IconButton from "@/components/ui/IconButton";
import TaskCheckbox from "./shared/TaskCheckbox";
import TaskContextMenu from "./shared/TaskContextMenu";

export interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
  /** Keyboard reorder: move one place up among same-date siblings. */
  onMoveUp?: (id: string) => void;
  /** Keyboard reorder: move one place down among same-date siblings. */
  onMoveDown?: (id: string) => void;
}

/**
 * Single task row: checkbox, title, tags, repeat mark and a due-date pill.
 * The row is a real button (Enter and Space open it), the "More" control
 * appears on hover and on keyboard focus, and right-click opens the same
 * task menu at the cursor. Completed rows are dimmed once, on the row.
 *
 * @param task - The task data to display
 * @param isSelected - Whether this task is currently selected
 * @param onToggle - Callback to toggle completion
 * @param onSelect - Callback when the row is activated (opens detail panel)
 * @param onDelete - Callback to delete the task (single click, toast has Undo)
 * @param onMoveUp - Enables "Move up" in the menu when provided
 * @param onMoveDown - Enables "Move down" in the menu when provided
 */
function TaskItemImpl({ task, isSelected, onToggle, onSelect, onDelete, onMoveUp, onMoveDown }: TaskItemProps) {
  const { snoozeTask } = useTaskContext();
  const { colorTheme } = useTheme();
  const taskColor = getThemeColor(task.color, colorTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const cursorAnchorRef = useRef<HTMLSpanElement>(null);

  /** Opens the task menu at the pointer (right-click). */
  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    setCursor({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }

  /** Opens the task menu from the "More" button. */
  function handleMoreClick(e: MouseEvent) {
    e.stopPropagation();
    setCursor(null);
    setMenuOpen(true);
  }

  /** Enter and Space activate the row like a click; Shift+F10 opens the menu. */
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(task, e.currentTarget.getBoundingClientRect());
    } else if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
      e.preventDefault();
      setCursor(null);
      setMenuOpen(true);
    }
  }

  return (
    <>
      <div
        ref={rowRef}
        role="button"
        tabIndex={0}
        aria-label={task.title}
        aria-pressed={isSelected || undefined}
        className={`group relative flex items-center gap-3 -ml-3 pl-3 pr-3 py-2.5 md:gap-3 md:-ml-4 md:pl-4 md:pr-4 md:py-2.5 rounded-xl transition-colors duration-100 cursor-pointer hover:bg-foreground/[0.035] dark:hover:bg-foreground/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isSelected ? "bg-foreground/[0.06] dark:bg-foreground/[0.11]" : ""
        } ${task.is_completed ? "opacity-60" : ""}`}
        onClick={(e) => { e.stopPropagation(); onSelect(task, e.currentTarget.getBoundingClientRect()); }}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
      >
        <TaskCheckbox color={taskColor} isCompleted={task.is_completed} onToggle={() => onToggle(task.id)} size="xs" />

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
            <span className="text-3xs font-medium px-1 py-px rounded bg-blue-50 text-blue-600 dark:bg-blue-600/40 dark:text-blue-400 shrink-0 truncate max-w-[80px]">
              {task.tags.length === 1 ? task.tags[0] : `${task.tags.length} tags`}
            </span>
          )}
        </div>

        {/* Repeat indicator */}
        {task.repeat_interval && task.repeat_unit && (
          <Repeat size={12} className="text-purple-500 dark:text-purple-400 shrink-0" aria-label="Repeats" />
        )}

        {/* Due date pill. The tint is mixed from the pill's own text colour
            so it tracks the urgency hue. */}
        <DueDatePill
          dueDate={task.due_date}
          dueTime={task.due_time}
          isCompleted={task.is_completed}
          className="ml-auto px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,currentColor_14%,transparent)]"
        />

        {/* More: hidden until hover or keyboard focus lands in the row. */}
        <IconButton
          ref={moreBtnRef}
          size="sm"
          bleed
          aria-label={`More actions for ${task.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={handleMoreClick}
          onKeyDown={(e) => e.stopPropagation()}
          className="shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
        >
          <MoreHorizontal size={14} />
        </IconButton>
      </div>

      {/* 0x0 marker at the pointer so the menu can anchor to a right-click. */}
      {cursor && (
        <span
          ref={cursorAnchorRef}
          aria-hidden="true"
          style={{ position: "fixed", left: cursor.x, top: cursor.y, width: 0, height: 0 }}
        />
      )}

      <TaskContextMenu
        open={menuOpen}
        onClose={() => { setMenuOpen(false); setCursor(null); }}
        anchorRef={cursor ? cursorAnchorRef : moreBtnRef}
        triggerRef={cursor ? rowRef : moreBtnRef}
        placement={cursor ? "bottom-start" : "bottom-end"}
        onSnooze={(hours) => snoozeTask(task.id, hours)}
        onDelete={() => onDelete(task.id)}
        onMoveUp={onMoveUp ? () => onMoveUp(task.id) : undefined}
        onMoveDown={onMoveDown ? () => onMoveDown(task.id) : undefined}
        sourceUrl={task.source_url}
      />
    </>
  );
}

/**
 * Memoized export. Re-renders only when one of the props changes by
 * reference. Parents passing inline arrow callbacks defeat memoization;
 * use useCallback.
 */
const TaskItem = memo(TaskItemImpl);
export default TaskItem;
