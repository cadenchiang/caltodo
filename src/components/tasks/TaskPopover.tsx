"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trash2, ExternalLink, MoreHorizontal, X, AlignLeft, Repeat } from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskUpdate } from "@/lib/types";
import { TASK_COLORS } from "@/lib/constants";
import { getRepeatLabel } from "@/lib/repeat";
import DatePicker from "./DatePicker";
import RepeatPicker from "./RepeatPicker";
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
  const popoverWidth = Math.min(380, window.innerWidth - 16);
  const popoverHeight = 420;
  const margin = 8;
  const isMobile = window.innerWidth < 768;

  let left: number;
  let top = anchorRect.top;

  if (isMobile) {
    // Center horizontally on mobile
    left = (window.innerWidth - popoverWidth) / 2;
  } else {
    left = anchorRect.right + margin;
    if (left + popoverWidth > window.innerWidth) {
      left = anchorRect.left - popoverWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }
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
 * Formats a due date into a long friendly string like "Wednesday, February 18 at 11:59 PM".
 * Shows "Today" or "Tomorrow" prefix for nearby dates.
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

  const timeSuffix = dueTime ? ` at ${formatTime12h(dueTime)}` : "";
  if (diffDays === 0) return `Today, ${format(due, "MMMM d")}${timeSuffix}`;
  if (diffDays === 1) return `Tomorrow, ${format(due, "MMMM d")}${timeSuffix}`;
  return `${format(due, "EEEE, MMMM d")}${timeSuffix}`;
}

/**
 * Google Calendar-style task detail popover rendered via portal.
 * Top right: action icons (color, source link, menu, close).
 * Title section: checkbox + large title, date below.
 * Description section: icon + editable text (blank if empty).
 * Source section: badges for platform, course, submission status.
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
  const [repeatInterval, setRepeatInterval] = useState<number | null>(task.repeat_interval);
  const [repeatUnit, setRepeatUnit] = useState<"day" | "week" | "month" | null>(task.repeat_unit);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const repeatBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date);
    setDueTime(task.due_time);
    setColor(task.color);
    setLocalCompleted(task.is_completed);
    setRepeatInterval(task.repeat_interval);
    setRepeatUnit(task.repeat_unit);
    setShowDatePicker(false);
    setShowColorPicker(false);
    setShowRepeatPicker(false);
    setIsEditingDescription(false);
  }, [task.id, task.title, task.description, task.due_date, task.due_time, task.color, task.is_completed, task.repeat_interval, task.repeat_unit]);

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

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [isEditingDescription]);

  /**
   * Auto-resizes a textarea to fit its content.
   *
   * @param el - The textarea element to resize
   */
  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  // Auto-resize title textarea on mount and when title changes
  useEffect(() => {
    if (titleRef.current) autoResize(titleRef.current);
  }, [title]);

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(task.id, { title: trimmed, description, due_date: dueDate, due_time: dueTime, color, repeat_interval: repeatInterval, repeat_unit: repeatUnit });
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
      className={`fixed z-50 w-[min(380px,calc(100vw-16px))] bg-card rounded-2xl shadow-2xl border border-border transition-all duration-150 ease-out ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1"
      }`}
      style={{ top: pos.top, left: pos.left }}
    >
      {/* ── Top action bar — right-aligned icons ── */}
      <div className="flex items-center justify-end gap-0.5 px-3 pt-3">
        {/* Color circle */}
        <div className="relative">
          <button
            ref={colorBtnRef}
            type="button"
            onClick={() => { setShowColorPicker(!showColorPicker); setShowDatePicker(false); }}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            aria-label="Change color"
          >
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color || "#9CA3AF" }} />
          </button>
          <Popover
            open={showColorPicker}
            onClose={() => setShowColorPicker(false)}
            className="absolute right-0 top-full mt-1 z-10"
            triggerRef={colorBtnRef}
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
                      onSave(task.id, { title: title.trim() || task.title, description, due_date: dueDate, due_time: dueTime, color: c, repeat_interval: repeatInterval, repeat_unit: repeatUnit });
                    }}
                    className={`w-6 h-6 rounded-full transition-all ${color === c ? "scale-125" : "hover:scale-110"}`}
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

        {/* Source link */}
        {task.source_url && (
          <a
            href={task.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            aria-label="Open in source"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={15} />
          </a>
        )}

        {/* Three-dot menu */}
        <div className="relative">
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            aria-label="Task options"
          >
            <MoreHorizontal size={15} />
          </button>
          {showMenu && menuBtnRef.current && createPortal(
            <div onMouseDown={(e) => e.stopPropagation()}>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowMenu(false)} />
              <div
                ref={menuDropdownRef}
                className="fixed z-[60] bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[120px]"
                style={{
                  top: menuBtnRef.current.getBoundingClientRect().bottom + 4,
                  left: Math.min(menuBtnRef.current.getBoundingClientRect().left, window.innerWidth - 140),
                }}
              >
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-1.5 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Title section: checkbox + title, date below ── */}
      <div className="px-5 pt-2 pb-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => {
              const next = !localCompleted;
              setLocalCompleted(next);
              onSave(task.id, { is_completed: next });
            }}
            className="group/check flex-shrink-0 w-5 h-5 mt-1 rounded-full flex items-center justify-center transition-all duration-200"
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
          {/* Title input — auto-growing textarea for long titles */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => { setTitle(e.target.value); autoResize(e.target); }}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            rows={1}
            className="flex-1 min-w-0 text-lg font-semibold text-foreground bg-transparent focus:outline-none placeholder-subtle-foreground resize-none overflow-hidden"
            placeholder="Task title"
          />
        </div>

        {/* Date line — below title, aligned with title text */}
        <div className="relative pl-8 mt-1">
          <button
            ref={dateBtnRef}
            type="button"
            onClick={() => { setShowDatePicker(!showDatePicker); setShowColorPicker(false); }}
            className="text-sm text-secondary-foreground hover:text-foreground transition-colors"
          >
            {formatDueDate(dueDate, dueTime)}
          </button>
          <Popover
            open={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            className="absolute left-8 top-full mt-1 z-10"
            triggerRef={dateBtnRef}
          >
            <DatePicker
              value={dueDate}
              timeValue={dueTime}
              onChange={(date) => {
                setDueDate(date);
                setShowDatePicker(false);
                onSave(task.id, { title: title.trim() || task.title, description, due_date: date, due_time: dueTime, color, repeat_interval: repeatInterval, repeat_unit: repeatUnit });
              }}
              onTimeChange={(time) => {
                setDueTime(time);
                onSave(task.id, { title: title.trim() || task.title, description, due_date: dueDate, due_time: time, color, repeat_interval: repeatInterval, repeat_unit: repeatUnit });
              }}
            />
          </Popover>
        </div>

        {/* Repeat line — below date, hidden for synced tasks */}
        {!task.source && (
          <div className="relative pl-8 mt-1">
            <button
              ref={repeatBtnRef}
              type="button"
              onClick={() => { setShowRepeatPicker(!showRepeatPicker); setShowDatePicker(false); setShowColorPicker(false); }}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                repeatInterval ? "text-purple-500 hover:text-purple-600" : "text-secondary-foreground hover:text-foreground"
              }`}
            >
              <Repeat size={14} />
              {repeatInterval && repeatUnit ? getRepeatLabel(repeatInterval, repeatUnit) : "No repeat"}
            </button>
            <Popover
              open={showRepeatPicker}
              onClose={() => setShowRepeatPicker(false)}
              className="absolute left-8 top-full mt-1 z-10"
              triggerRef={repeatBtnRef}
            >
              <RepeatPicker
                interval={repeatInterval}
                unit={repeatUnit}
                onChange={(interval, unit) => {
                  setRepeatInterval(interval);
                  setRepeatUnit(unit);
                  setShowRepeatPicker(false);
                  onSave(task.id, { title: title.trim() || task.title, description, due_date: dueDate, due_time: dueTime, color, repeat_interval: interval, repeat_unit: unit });
                }}
              />
            </Popover>
          </div>
        )}

        {/* Tags — source, course, submission, late due date badges */}
        {(task.source || task.course_name || task.is_submitted || task.late_due_date) && (
          <div className="pl-8 mt-2 flex items-center gap-2 flex-wrap">
            {task.source && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  task.source === "canvas"
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
                    : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                }`}
              >
                {task.source === "canvas" ? "bCourses" : "Gradescope"}
              </span>
            )}
            {task.course_name && (
              <span className="text-xs font-medium px-2 py-0.5 rounded text-black bg-gray-100 dark:text-white dark:bg-white/10">
                {task.course_name}
              </span>
            )}
            {task.is_submitted && (
              <span className="text-xs font-medium px-2 py-0.5 rounded text-green-600 bg-green-50 dark:bg-green-900/30">
                Submitted
              </span>
            )}
            {task.late_due_date && (
              <span className="text-xs font-medium px-2 py-0.5 rounded text-orange-600 bg-orange-50 dark:bg-orange-900/30">
                Late due {format(new Date(task.late_due_date + "T00:00:00"), "MMM d")}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle" />

      {/* ── Description section — icon + text ── */}
      <div
        className={`flex items-start gap-3 px-5 py-3 min-h-[44px] ${!description && !isEditingDescription ? "cursor-pointer" : ""}`}
        onClick={() => { if (!description && !isEditingDescription) setIsEditingDescription(true); }}
      >
        <AlignLeft size={18} className="text-subtle-foreground flex-shrink-0 mt-0.5" />
        {(description || isEditingDescription) ? (
          <textarea
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => { handleSave(); if (!description) setIsEditingDescription(false); }}
            rows={Math.max(2, (description || "").split("\n").length + 1)}
            className="flex-1 min-w-0 text-sm text-secondary-foreground bg-transparent focus:outline-none resize-none max-h-[200px] overflow-y-auto"
          />
        ) : null}
      </div>


      <div className="pb-1" />
    </div>,
    document.body
  );
}
