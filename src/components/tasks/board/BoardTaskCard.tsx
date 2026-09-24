"use client";

import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { MoreHorizontal } from "lucide-react";
import type { Task } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import DueDatePill from "@/components/ui/DueDatePill";
import IconButton from "@/components/ui/IconButton";
import TaskCheckbox from "../shared/TaskCheckbox";
import TaskContextMenu from "../shared/TaskContextMenu";

export interface BoardTaskCardProps {
  task: Task;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
}

/**
 * Task card for the board view: checkbox, title and due-date pill. The card
 * is a real button (Enter and Space open the preview), the More control is
 * revealed on hover and keyboard focus, and right-click opens the shared
 * task menu. Completed cards are dimmed once, on the card.
 *
 * @param task - Task to render
 * @param isSelected - Whether the preview for this card is open
 */
export default function BoardTaskCard({ task, isSelected, onToggle, onSelect, onDelete }: BoardTaskCardProps) {
  const { colorTheme } = useTheme();
  const { snoozeTask } = useTaskContext();
  const taskColor = getThemeColor(task.color, colorTheme);
  const isCompleted = task.is_completed || task.is_submitted;
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const cursorAnchorRef = useRef<HTMLSpanElement>(null);

  /** Enter and Space open the card like a click. */
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(task, e.currentTarget.getBoundingClientRect());
    }
  }

  /** Opens the menu at the pointer. */
  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    setCursor({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }

  return (
    <>
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={task.title}
        aria-pressed={isSelected || undefined}
        className={`group relative rounded-xl border bg-card px-3 py-2 cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isSelected ? "border-blue-500 shadow-sm" : "border-input-border hover:shadow-md dark:hover:border-hairline"
        } ${isCompleted ? "opacity-50" : ""}`}
        onClick={(e) => onSelect(task, e.currentTarget.getBoundingClientRect())}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-start gap-2.5">
          <div className="pt-0.5">
            <TaskCheckbox color={taskColor} isCompleted={isCompleted} onToggle={() => onToggle(task.id)} size="sm" />
          </div>
          <span
            className={`text-sm font-semibold leading-snug flex-1 min-w-0 ${
              isCompleted ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {task.title}
          </span>
          <IconButton
            ref={moreBtnRef}
            size="sm"
            bleed
            aria-label={`More actions for ${task.title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => { e.stopPropagation(); setCursor(null); setMenuOpen(true); }}
            onKeyDown={(e) => e.stopPropagation()}
            className="shrink-0 -mt-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
          >
            <MoreHorizontal size={14} />
          </IconButton>
        </div>

        {task.due_date && (
          <div className="mt-1 pl-[26px]">
            <DueDatePill
              dueDate={task.due_date}
              dueTime={task.due_time}
              isCompleted={isCompleted}
              className="px-1.5 py-0.5 rounded-md bg-[color-mix(in_srgb,currentColor_10%,transparent)]"
            />
          </div>
        )}
      </div>

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
        triggerRef={cursor ? cardRef : moreBtnRef}
        placement={cursor ? "bottom-start" : "bottom-end"}
        onSnooze={(hours) => snoozeTask(task.id, hours)}
        onDelete={() => onDelete(task.id)}
        sourceUrl={task.source_url}
      />
    </>
  );
}
