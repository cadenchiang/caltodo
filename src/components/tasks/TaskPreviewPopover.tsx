"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { getRepeatLabel } from "@/lib/repeat";
import { getThemeColor } from "@/lib/constants";
import { getDueDateInfo } from "@/lib/task-utils";
import { ExternalLink } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task } from "@/lib/types";
import TaskCheckbox from "./shared/TaskCheckbox";
import TaskActionBar from "./shared/TaskActionBar";
import {
  TaskDateTimeLabel,
  TaskRepeatLabel,
  TaskCourseRow,
  TaskTagsRow,
  TaskDescriptionRow,
} from "./shared/TaskDetailRows";

/** Width of the popover in pixels. */
const POPOVER_WIDTH = 448;
/** Estimated max height for overflow detection. */
const POPOVER_MAX_HEIGHT = 520;
/** Gap between anchor and popover edge. */
const GAP = 6;

interface TaskPreviewPopoverProps {
  /** The task to display in the preview. */
  task: Task;
  /** Bounding rect of the clicked element, used for positioning. */
  anchorRect: DOMRect;
  /** Called when the popover should close. */
  onClose: () => void;
  /** Called when the user opens the full edit modal (date-pill click). */
  onEdit: (task: Task) => void;
  /** Called when the user clicks the delete (trash) button. */
  onDelete: (id: string) => void;
  /** Called when the user toggles the completion checkbox. */
  onToggle: (id: string) => void;
  /**
   * Optional inline-save handler. When provided, the title can be edited
   * directly in the popover and saved via this callback. Without it the
   * title falls back to a read-only span.
   */
  onSave?: (id: string, updates: { title?: string }) => void;
}

/**
 * Lightweight read-only preview popover positioned near a clicked task.
 * Follows the Google Calendar two-step pattern: first click shows preview,
 * then clicking Edit opens the full TaskCreateModal.
 *
 * @param task - Task data to display
 * @param anchorRect - DOMRect of the clicked element for positioning
 * @param onClose - Close handler
 * @param onEdit - Edit handler, receives the task
 * @param onDelete - Delete handler, receives the task ID
 * @param onToggle - Toggle completion handler, receives task ID
 */
export default function TaskPreviewPopover({
  task,
  anchorRect,
  onClose,
  onEdit,
  onSave,
  onDelete,
  onToggle,
}: TaskPreviewPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { colorTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);

  /**
   * Triggers the close animation, then calls onClose after it completes.
   */
  const animateClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 150);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") animateClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = "touches" in e ? e.touches[0]?.target : e.target;
      if (ref.current && target && !ref.current.contains(target as Node)) {
        // Close immediately (no animation delay) so clicking another task
        // can set the new preview without it being wiped by a delayed close.
        onClose();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [onClose]);

  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  /**
   * Positions the popover adjacent to the anchor element.
   * Vertically aligns the popover top with the anchor top, then clamps
   * to keep it within the viewport.
   */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const popoverHeight = el.scrollHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;

    // Horizontal: place on the side of the anchor towards viewport center
    let left: number;
    if (anchorCenterX < vw / 2) {
      // Anchor is on left half — popover goes right
      left = anchorRect.right + GAP;
    } else {
      // Anchor is on right half — popover goes left
      left = anchorRect.left - POPOVER_WIDTH - GAP;
    }
    left = Math.max(GAP, Math.min(left, vw - POPOVER_WIDTH - GAP));

    // Vertical: align popover top with anchor top, then clamp to viewport
    let top = anchorRect.top;

    // Clamp to viewport
    if (top + popoverHeight > vh - GAP) {
      top = vh - popoverHeight - GAP;
    }
    top = Math.max(GAP, top);

    setPos({ left, top });
  }, [anchorRect]);

  const dotColor = getThemeColor(task.color, colorTheme);

  // Mirror the list detail panel: overdue tasks show "Overdue N day(s)"
  // (no time); everything else gets the long EEE, MMM d, yyyy formatting.
  const dueInfo = getDueDateInfo(task.due_date, task.due_time);
  const isOverdue = !!dueInfo && dueInfo.dateLabel.startsWith("Overdue");
  const dateLabel = isOverdue
    ? dueInfo!.dateLabel
    : task.due_date
      ? format(new Date(task.due_date + "T00:00:00"), "EEE, MMM d, yyyy")
      : null;
  const timeLabel = isOverdue
    ? null
    : task.due_time
      ? format(new Date(`2000-01-01T${task.due_time}`), "h:mm a")
      : null;

  const repeatLabel =
    task.repeat_interval && task.repeat_unit
      ? getRepeatLabel(task.repeat_interval, task.repeat_unit)
      : null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return createPortal(
    <>
      {/* Transparent backdrop for easy mobile dismissal */}
      {isMobile && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={animateClose}
          onTouchStart={animateClose}
        />
      )}
      <div
        ref={ref}
        data-task-preview-popover
        role="dialog"
        aria-label={`Preview: ${task.title}`}
        className={`fixed z-[9999] rounded-2xl shadow-2xl border border-border bg-popover transition-[opacity,transform] duration-150 ease-out ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          left: isMobile ? 12 : pos.left,
          top: isMobile ? undefined : pos.top,
          bottom: isMobile ? 12 : undefined,
          width: isMobile ? "calc(100vw - 24px)" : POPOVER_WIDTH,
          maxHeight: isMobile ? "70vh" : POPOVER_MAX_HEIGHT,
          overflowY: "auto",
        }}
      >
      {/* Header — pencil/edit + close. Pencil opens the full edit modal. */}
      <TaskActionBar
        onEdit={() => onEdit(task)}
        onDelete={() => onDelete(task.id)}
        onClose={animateClose}
        sourceUrl={task.source_url}
      />

      {/* Body */}
      <div className="px-6 pb-6">
        {/* Title row — read-only; deeper edits go through the pencil. */}
        <div className="flex items-start gap-4">
          <TaskCheckbox
            color={dotColor}
            isCompleted={task.is_completed}
            onToggle={() => onToggle(task.id)}
            size="lg"
          />
          <span className="text-xl font-semibold text-foreground leading-snug break-words min-w-0">
            {task.title}
          </span>
        </div>

        {/* Date + Time pill — click to open the full editor for date/time changes. */}
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="block text-left hover:opacity-80 transition-opacity"
          aria-label="Edit date and time"
        >
          <TaskDateTimeLabel
            dateLabel={dateLabel}
            timeLabel={timeLabel}
            urgencyClassName={dueInfo?.className}
          />
        </button>

        <TaskRepeatLabel repeatLabel={repeatLabel} />

        {/* Divider */}
        <div className="border-t border-border my-5" />

        {/* Open Assignment — at the top of the body when the task has a source URL. */}
        {task.source_url && (
          <div className="flex items-center gap-4 py-3 min-w-0">
            <div className="shrink-0 w-5 flex items-center justify-center">
              <ExternalLink size={20} className="text-muted-foreground" />
            </div>
            <a
              href={task.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline truncate transition-colors"
            >
              Open assignment
            </a>
          </div>
        )}

        {/* Course name row */}
        <TaskCourseRow courseName={task.course_name} />

        {/* Tags row */}
        <TaskTagsRow tags={task.tags ?? []} />

        {/* Description row */}
        <TaskDescriptionRow description={task.description} lineClamp={3} />
      </div>
    </div>
    </>,
    document.body,
  );
}
