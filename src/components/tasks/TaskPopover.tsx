"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Flag, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskUpdate } from "@/lib/types";
import { TASK_COLORS } from "@/lib/constants";
import DatePicker from "./DatePicker";
import Popover from "@/components/ui/Popover";
import useClickOutside from "@/hooks/useClickOutside";

interface TaskPopoverProps {
  task: Task;
  anchorRect: DOMRect;
  onClose: () => void;
  onSave: (id: string, updates: TaskUpdate) => void;
  onDelete: (id: string) => void;
}

/**
 * Computes popover position relative to the viewport.
 * Flips direction if the popover would overflow edges.
 *
 * @param anchorRect - Bounding rect of the clicked task row
 * @returns CSS position properties for the popover
 */
function computePosition(anchorRect: DOMRect): { top: number; left: number } {
  const popoverWidth = 380;
  const popoverHeight = 420;
  const margin = 8;

  let left = anchorRect.right + margin;
  let top = anchorRect.top;

  if (left + popoverWidth > window.innerWidth) {
    left = anchorRect.left - popoverWidth - margin;
  }
  if (left < margin) {
    left = margin;
  }
  if (top + popoverHeight > window.innerHeight) {
    top = window.innerHeight - popoverHeight - margin;
  }
  if (top < margin) {
    top = margin;
  }

  return { top, left };
}

/**
 * Formats a due date into a friendly string like "Today, Feb 13".
 *
 * @param dueDate - ISO date string or null
 * @returns Formatted date string or "No date"
 */
function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "No date";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const dateStr = format(due, "MMM d");
  if (diffDays === 0) return `Today, ${dateStr}`;
  if (diffDays === 1) return `Tomorrow, ${dateStr}`;
  if (diffDays === -1) return `Yesterday, ${dateStr}`;
  return dateStr;
}

/**
 * Todoist-style task popup rendered via portal.
 * Top bar: checkbox | calendar date | flag (color).
 * Body: editable title, plain white description area with placeholder.
 * Bottom: source/submitted badges, delete.
 * Auto-saves on blur. Closes on click-outside, scroll, or Escape.
 *
 * @param task - The task to view/edit
 * @param anchorRect - DOMRect from the clicked task row for positioning
 * @param onClose - Callback to close the popover
 * @param onSave - Callback with task ID and updated fields
 * @param onDelete - Callback to delete the task
 */
export default function TaskPopover({ task, anchorRect, onClose, onSave, onDelete }: TaskPopoverProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState<string | null>(task.due_date);
  const [color, setColor] = useState(task.color);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date);
    setColor(task.color);
    setShowDatePicker(false);
    setShowColorPicker(false);
  }, [task.id, task.title, task.description, task.due_date, task.color]);

  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => onClose();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [onClose]);

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

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(task.id, { title: trimmed, description, due_date: dueDate, color });
  }

  function handleDelete() {
    onDelete(task.id);
    onClose();
  }

  if (!mounted) return null;

  const pos = computePosition(anchorRect);

  return createPortal(
    <div
      ref={ref}
      className={`fixed z-50 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-150 ease-out ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1"
      }`}
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Top bar: checkbox | calendar date | color flag */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-50">
        {/* Checkbox */}
        <button
          onClick={() => {
            onSave(task.id, { is_completed: !task.is_completed });
          }}
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: task.is_completed ? (color || "#9CA3AF") : "transparent",
            border: task.is_completed ? "none" : `1.5px solid ${color || "#D1D5DB"}`,
          }}
        >
          {task.is_completed && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Calendar date */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowColorPicker(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <CalendarDays size={14} className="text-gray-400" />
            <span>{formatDueDate(dueDate)}</span>
          </button>
          <Popover
            open={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            className="absolute left-0 top-full mt-1 z-10"
          >
            <DatePicker
              value={dueDate}
              onChange={(date) => {
                setDueDate(date);
                setShowDatePicker(false);
                onSave(task.id, { title: title.trim() || task.title, description, due_date: date, color });
              }}
            />
          </Popover>
        </div>

        {/* Color flag (single dot, expands on click) */}
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowDatePicker(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Flag size={14} style={{ color: color || "#9CA3AF" }} />
          </button>
          <Popover
            open={showColorPicker}
            onClose={() => setShowColorPicker(false)}
            className="absolute right-0 top-full mt-1 z-10"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-3">
              <div className="flex gap-2">
                {TASK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                      onSave(task.id, { title: title.trim() || task.title, description, due_date: dueDate, color: c });
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
        </div>
      </div>

      {/* Content: title + description */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
        {/* Source / submitted badges */}
        {(task.source || task.is_submitted) && (
          <div className="flex items-center gap-2 mb-1">
            {task.source && (
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  task.source === "canvas"
                    ? "text-red-600 bg-red-50"
                    : "text-emerald-600 bg-emerald-50"
                }`}
              >
                {task.source === "canvas" ? "Canvas" : "Gradescope"}
              </span>
            )}
            {task.is_submitted && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-green-600 bg-green-50">
                Submitted
              </span>
            )}
          </div>
        )}

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          className="w-full text-base font-semibold text-gray-800 bg-transparent focus:outline-none placeholder-gray-300"
          placeholder="Task title"
        />

        {/* Description — plain white, just a placeholder */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSave}
          rows={3}
          placeholder="Write a description..."
          className="w-full text-sm text-gray-600 bg-transparent rounded-lg focus:outline-none resize-none placeholder-gray-300"
        />
      </div>

      {/* Footer: delete */}
      <div className="px-4 pb-3 pt-1 border-t border-gray-50">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
          Delete task
        </button>
      </div>
    </div>,
    document.body
  );
}
