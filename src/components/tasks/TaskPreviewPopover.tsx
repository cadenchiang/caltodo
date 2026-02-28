"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Pencil, Trash2, X, Tag, AlignLeft, BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import { getRepeatLabel } from "@/lib/repeat";
import { getMiffyColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task } from "@/lib/types";

/** Width of the popover in pixels. */
const POPOVER_WIDTH = 448;
/** Estimated max height for overflow detection. */
const POPOVER_MAX_HEIGHT = 520;
/** Gap between anchor and popover edge. */
const GAP = 12;
/** Consistent icon size for all detail rows. */
const ICON_SIZE = 20;

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
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
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

  const dotColor = colorTheme === "miffy"
    ? getMiffyColor(task.color)
    : task.color;

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

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={`Preview: ${task.title}`}
      className={`fixed z-[9999] rounded-2xl shadow-2xl border border-border bg-popover transition-[opacity,transform] duration-150 ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        left: pos.left,
        top: pos.top,
        width: POPOVER_WIDTH,
        maxHeight: POPOVER_MAX_HEIGHT,
        overflowY: "auto",
      }}
    >
      {/* Header action buttons */}
      <div className="flex items-center justify-end gap-1 px-5 pt-4 pb-2">
        <button
          onClick={() => onEdit(task)}
          className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Edit task"
          title="Edit"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg text-secondary-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          aria-label="Delete task"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close preview"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 pb-6">
        {/* Title row: clickable checkbox square + title */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => onToggle(task.id)}
            className="w-5 h-5 rounded-[4px] shrink-0 mt-1 flex items-center justify-center transition-all cursor-pointer"
            style={{
              backgroundColor: task.is_completed ? dotColor : "transparent",
              border: task.is_completed ? "none" : `2px solid ${dotColor}`,
            }}
            aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.is_completed && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-xl font-semibold text-foreground leading-snug break-words min-w-0">
            {task.title}
          </span>
        </div>

        {/* Date + Time under title */}
        {(dateLabel || timeLabel) && (
          <div className="pl-9 text-sm text-secondary-foreground mt-1">
            {[dateLabel, timeLabel].filter(Boolean).join(" \u00B7 ")}
          </div>
        )}

        {/* Repeat label under date */}
        {repeatLabel && (
          <div className="pl-9 text-sm text-secondary-foreground mt-0.5">
            {repeatLabel}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border my-5" />

        {/* Tags row */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-start gap-4 py-3">
            <Tag size={ICON_SIZE} className="shrink-0 mt-0.5 text-secondary-foreground" />
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-accent text-foreground max-w-[200px] truncate"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description row */}
        {task.description && (
          <div className="flex items-start gap-4 py-3">
            <AlignLeft size={ICON_SIZE} className="shrink-0 mt-0.5 text-secondary-foreground" />
            <p className="text-sm text-foreground line-clamp-3 break-words min-w-0">
              {task.description}
            </p>
          </div>
        )}

        {/* Course name row */}
        {task.course_name && (
          <div className="flex items-center gap-4 py-3 min-w-0">
            <BookOpen size={ICON_SIZE} className="shrink-0 text-secondary-foreground" />
            <span className="text-sm text-foreground truncate">{task.course_name}</span>
          </div>
        )}

      </div>
    </div>,
    document.body,
  );
}
