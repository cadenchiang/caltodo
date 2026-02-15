"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Trash2, ExternalLink } from "lucide-react";
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
 * Formats a due date into a friendly string like "Today, Feb 13 at 11:59 PM".
 *
 * @param dueDate - ISO date string or null
 * @param dueTime - 24-hour time string ("HH:MM") or null
 * @returns Formatted date string or "No date"
 */
function formatDueDate(dueDate: string | null, dueTime?: string | null): string {
  if (!dueDate) return "No date";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const dateStr = format(due, "MMM d");
  const timeSuffix = dueTime ? ` at ${formatTime12h(dueTime)}` : "";
  if (diffDays === 0) return `Today, ${dateStr}${timeSuffix}`;
  if (diffDays === 1) return `Tomorrow, ${dateStr}${timeSuffix}`;
  if (diffDays === -1) return `Yesterday, ${dateStr}${timeSuffix}`;
  return `${dateStr}${timeSuffix}`;
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
  const [dueTime, setDueTime] = useState<string | null>(task.due_time);
  const [color, setColor] = useState(task.color);
  const [localCompleted, setLocalCompleted] = useState(task.is_completed);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date);
    setDueTime(task.due_time);
    setColor(task.color);
    setLocalCompleted(task.is_completed);
    setShowDatePicker(false);
    setShowColorPicker(false);
  }, [task.id, task.title, task.description, task.due_date, task.due_time, task.color, task.is_completed]);

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
    onSave(task.id, { title: trimmed, description, due_date: dueDate, due_time: dueTime, color });
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
      className={`fixed z-50 w-[380px] bg-card rounded-2xl shadow-2xl border border-border transition-all duration-150 ease-out ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1"
      }`}
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Top bar: checkbox | calendar date | color circle */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border-subtle">
        {/* Checkbox — local optimistic state for instant feedback */}
        <button
          onClick={() => {
            const next = !localCompleted;
            setLocalCompleted(next);
            onSave(task.id, { is_completed: next });
          }}
          className="group/check flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: localCompleted ? (color || "#9CA3AF") : "transparent",
            border: localCompleted ? "none" : `1.5px solid ${color || "#D1D5DB"}`,
          }}
        >
          {localCompleted ? (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="animate-[checkScale_0.2s_ease-out]">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="9" height="7" viewBox="0 0 10 8" fill="none" className="opacity-0 group-hover/check:opacity-40 transition-opacity">
              <path d="M1 4L3.5 6.5L9 1" stroke={color || "#D1D5DB"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-secondary-foreground hover:bg-accent transition-colors"
          >
            <CalendarDays size={14} className="text-subtle-foreground" />
            <span>{formatDueDate(dueDate, task.due_time)}</span>
          </button>
          <Popover
            open={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            className="absolute left-0 top-full mt-1 z-10"
          >
            <DatePicker
              value={dueDate}
              timeValue={dueTime}
              onChange={(date) => {
                setDueDate(date);
                setShowDatePicker(false);
                onSave(task.id, { title: title.trim() || task.title, description, due_date: date, due_time: dueTime, color });
              }}
              onTimeChange={(time) => {
                setDueTime(time);
                onSave(task.id, { title: title.trim() || task.title, description, due_date: dueDate, due_time: time, color });
              }}
            />
          </Popover>
        </div>

        {/* Color circle (expands on click) */}
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowDatePicker(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color || "#9CA3AF" }} />
          </button>
          <Popover
            open={showColorPicker}
            onClose={() => setShowColorPicker(false)}
            className="absolute right-0 top-full mt-1 z-10"
          >
            <div className="bg-card rounded-xl shadow-2xl border border-border p-3">
              <div className="flex gap-2">
                {TASK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                      onSave(task.id, { title: title.trim() || task.title, description, due_date: dueDate, due_time: dueTime, color: c });
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
        {(task.source || task.course_name || task.is_submitted) && (
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {task.source && (
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  task.source === "canvas"
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
                    : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                }`}
              >
                {task.source === "canvas" ? "bCourses" : "Gradescope"}
              </span>
            )}
            {task.course_name && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-purple-600 bg-purple-50 dark:bg-purple-900/30">
                {task.course_name}
              </span>
            )}
            {task.is_submitted && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-green-600 bg-green-50 dark:bg-green-900/30">
                Submitted
              </span>
            )}
            {task.source_url && (
              <a
                href={task.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground bg-accent hover:bg-muted transition-colors"
              >
                <ExternalLink size={10} />
                Open
              </a>
            )}
          </div>
        )}

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          className="w-full text-base font-semibold text-foreground bg-transparent focus:outline-none placeholder-subtle-foreground"
          placeholder="Task title"
        />

        {/* Description — plain white, just a placeholder */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSave}
          rows={3}
          placeholder="Write a description..."
          className="w-full text-sm text-secondary-foreground bg-transparent rounded-lg focus:outline-none resize-none placeholder-subtle-foreground"
        />
      </div>

      {/* Footer: delete */}
      <div className="px-4 pb-3 pt-1 border-t border-border-subtle">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
          Delete task
        </button>
      </div>
    </div>,
    document.body
  );
}
