"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import type { TaskInsert } from "@/lib/types";
import { TASK_COLORS, DEFAULT_TASK_COLOR } from "@/lib/constants";
import useClickOutside from "@/hooks/useClickOutside";

interface TaskAddPopoverProps {
  date: string;
  anchorRect: DOMRect;
  onClose: () => void;
  onAdd: (task: TaskInsert) => void;
}

/**
 * Computes popover position relative to the viewport.
 * Positions below and centered on the anchor, flipping if needed.
 *
 * @param anchorRect - Bounding rect of the clicked day cell
 * @returns CSS position properties for the popover
 */
function computePosition(anchorRect: DOMRect): { top: number; left: number } {
  const popoverWidth = 380;
  const popoverHeight = 260;
  const margin = 8;

  let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
  let top = anchorRect.bottom + margin;

  if (left + popoverWidth > window.innerWidth) {
    left = window.innerWidth - popoverWidth - margin;
  }
  if (left < margin) {
    left = margin;
  }
  if (top + popoverHeight > window.innerHeight) {
    top = anchorRect.top - popoverHeight - margin;
  }
  if (top < margin) {
    top = margin;
  }

  return { top, left };
}

/**
 * Google Calendar-style quick-add popup for creating a task on a specific date.
 * Rendered via portal, positioned next to the clicked day cell.
 * No blur overlay — click outside or press Escape to close.
 *
 * @param date - The date string (YYYY-MM-DD) for the new task
 * @param anchorRect - DOMRect from the clicked day cell for positioning
 * @param onClose - Callback to close the popover
 * @param onAdd - Callback with the new task data
 */
export default function TaskAddPopover({ date, anchorRect, onClose, onAdd }: TaskAddPopoverProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_TASK_COLOR);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleClickOutside = useCallback(() => {
    onClose();
  }, [onClose]);

  useClickOutside(ref, handleClickOutside, mounted);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({ title: trimmed, due_date: date, description: description.trim() || "", color });
    onClose();
  }

  if (!mounted) return null;

  const pos = computePosition(anchorRect);

  return createPortal(
    <div
      ref={ref}
      className={`fixed z-50 w-[380px] bg-card rounded-2xl shadow-2xl border border-border transition-all duration-150 ease-out ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1"
      }`}
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="px-4 pt-4 pb-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {format(new Date(date + "T00:00:00"), "MMMM d, yyyy")}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full text-sm text-foreground bg-transparent focus:outline-none placeholder-subtle-foreground mb-2"
          />

          {/* Color picker row */}
          <div className="flex items-center gap-1.5 mb-2">
            {TASK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full transition-all ${
                  color === c ? "scale-125" : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px var(--color-card, white), 0 0 0 3.5px ${c}` : "none",
                }}
              />
            ))}
          </div>

          {/* Description textarea */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Description (optional)"
            className="w-full text-xs text-secondary-foreground bg-transparent rounded-lg focus:outline-none resize-none placeholder-subtle-foreground mb-3"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
