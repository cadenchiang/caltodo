"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { getRepeatLabel } from "@/lib/repeat";
import { getThemeColor } from "@/lib/constants";
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
  /** Called when the user clicks the edit (pencil) button. */
  onEdit: (task: Task) => void;
  /** Called when the user clicks the delete (trash) button. */
  onDelete: (id: string) => void;
  /** Called when the user toggles the completion checkbox. */
  onToggle: (id: string) => void;
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
  onDelete,
  onToggle,
}: TaskPreviewPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { colorTheme } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = "touches" in e ? e.touches[0]?.target : e.target;
      if (ref.current && target && !ref.current.contains(target as Node)) {
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
   * Positions the popover near the anchor but biased towards the viewport
   * center, so it adapts based on where the anchor is on screen rather
   * than always appearing immediately adjacent.
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

    // Vertical: blend between anchor-aligned and viewport-centered
    const anchorTop = anchorRect.top;
    const centeredTop = (vh - popoverHeight) / 2;
    const BLEND = 0.35; // 35% pull towards center
    let top = anchorTop + (centeredTop - anchorTop) * BLEND;

    // Clamp to viewport
    if (top + popoverHeight > vh - GAP) {
      top = vh - popoverHeight - GAP;
    }
    top = Math.max(GAP, top);

    setPos({ left, top });
  }, [anchorRect]);

  const dotColor = getThemeColor(task.color, colorTheme);

  const dateLabel = task.due_date
    ? format(new Date(task.due_date + "T00:00:00"), "EEE, MMM d, yyyy")
    : null;

  const timeLabel = task.due_time
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
          onClick={onClose}
          onTouchStart={onClose}
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
      {/* Header action buttons */}
      <TaskActionBar
        onEdit={() => onEdit(task)}
        onDelete={() => onDelete(task.id)}
        onClose={onClose}
        sourceUrl={task.source_url}
      />

      {/* Body */}
      <div className="px-6 pb-6">
        {/* Title row: clickable checkbox square + title */}
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

        {/* Date + Time under title */}
        <TaskDateTimeLabel dateLabel={dateLabel} timeLabel={timeLabel} />

        {/* Repeat label under date */}
        <TaskRepeatLabel repeatLabel={repeatLabel} />

        {/* Divider */}
        <div className="border-t border-border my-5" />

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
