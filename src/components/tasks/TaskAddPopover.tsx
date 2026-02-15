"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { TaskInsert } from "@/lib/types";
import { TASK_COLORS, DEFAULT_TASK_COLOR } from "@/lib/constants";
import useClickOutside from "@/hooks/useClickOutside";
import DatePicker from "./DatePicker";
import Popover from "@/components/ui/Popover";

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
  const popoverWidth = 340;
  const popoverHeight = 230;
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
 * Color picker and date/time picker appear as floating popups above the toolbar.
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
  const [dueDate, setDueDate] = useState<string>(date);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

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
      if (e.key === "Escape") {
        if (showColorPicker || showDatePicker) {
          setShowColorPicker(false);
          setShowDatePicker(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showColorPicker, showDatePicker]);

  const handleClickOutside = useCallback(() => {
    if (!showColorPicker && !showDatePicker) {
      onClose();
    }
  }, [onClose, showColorPicker, showDatePicker]);

  useClickOutside(ref, handleClickOutside, mounted);

  /**
   * Handles form submission — creates a task with title, date, time, color, description.
   *
   * @param e - Form submit event
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      due_date: dueDate,
      due_time: dueTime,
      description: description.trim() || "",
      color,
    });
    onClose();
  }

  if (!mounted) return null;

  const pos = computePosition(anchorRect);

  return createPortal(
    <div
      ref={ref}
      className={`fixed z-50 w-[340px] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-border transition-all duration-150 ease-out ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1"
      }`}
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="px-4 pt-4 pb-3">
        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full text-sm text-foreground bg-transparent focus:outline-none placeholder-subtle-foreground mb-3"
          />

          {/* Toolbar row: color dot + calendar icon with date badge */}
          <div className="relative flex items-center gap-2 mb-2">
            {/* Color dot toggle */}
            <button
              ref={colorButtonRef}
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowDatePicker(false);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                showColorPicker ? "bg-accent" : "hover:bg-accent"
              }`}
              aria-label="Pick color"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            </button>

            {/* Calendar icon + date badge */}
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowColorPicker(false);
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                showDatePicker
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              aria-label="Pick date and time"
            >
              <CalendarDays size={14} />
              <span>{format(new Date(dueDate + "T00:00:00"), "MMM d")}</span>
              {dueTime && (
                <span className="text-blue-500 font-medium">{dueTime}</span>
              )}
            </button>

            {/* Color picker popup */}
            <Popover
              open={showColorPicker}
              onClose={() => setShowColorPicker(false)}
              triggerRef={colorButtonRef}
              className="absolute left-0 top-full mt-1 z-10"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-border p-3">
                <div className="flex gap-2">
                  {TASK_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setColor(c);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full transition-all ${
                        color === c ? "scale-125" : "hover:scale-110"
                      }`}
                      style={{
                        backgroundColor: c,
                        boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            </Popover>

            {/* Date picker popup */}
            <Popover
              open={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              triggerRef={dateButtonRef}
              className="absolute left-0 top-full mt-1 z-10"
            >
              <DatePicker
                value={dueDate}
                timeValue={dueTime}
                onChange={(d) => {
                  if (d) setDueDate(d);
                }}
                onTimeChange={(t) => setDueTime(t)}
              />
            </Popover>
          </div>

          {/* Description textarea */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Description (optional)"
            className="w-full text-xs text-secondary-foreground bg-transparent rounded-lg focus:outline-none resize-none placeholder-subtle-foreground mb-2"
          />

          {/* Action buttons */}
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
