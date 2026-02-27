"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trash2, ExternalLink, MoreVertical, X, AlignLeft, Clock, Tag, Pencil, EyeOff } from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskUpdate } from "@/lib/types";
import { useTaskContext } from "@/contexts/TaskContext";

/** Duration presets for the snooze submenu. */
const SNOOZE_PRESETS = [
  { label: "1 hour", hours: 1 },
  { label: "3 hours", hours: 3 },
  { label: "12 hours", hours: 12 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
] as const;

/** Far-future date used for "Until I unhide" snooze (~100 years). */
const FOREVER_HOURS = 876_000;
import { TASK_COLORS } from "@/lib/constants";
import { getRepeatLabel } from "@/lib/repeat";
import DatePicker from "./DatePicker";
import TagPicker from "./TagPicker";
import InviteSection from "./InviteSection";
import Popover from "@/components/ui/Popover";
import useClickOutside from "@/hooks/useClickOutside";

/**
 * A badge that truncates long text and expands on click.
 *
 * @param text - Full text to display
 * @param maxChars - Max characters before truncation
 * @param className - CSS classes for the badge
 */
function ExpandableBadge({ text, maxChars, className }: { text: string; maxChars: number; className: string }) {
  const [expanded, setExpanded] = useState(false);
  const isTruncated = text.length > maxChars;
  const display = expanded || !isTruncated ? text : text.slice(0, maxChars).trimEnd() + "...";

  return (
    <span
      className={`${className} ${isTruncated ? "cursor-pointer" : ""}`}
      onClick={isTruncated ? (e) => { e.stopPropagation(); setExpanded(!expanded); } : undefined}
      title={isTruncated && !expanded ? text : undefined}
    >
      {display}
    </span>
  );
}

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
  let top: number;

  if (isMobile) {
    // Center horizontally on mobile
    left = (window.innerWidth - popoverWidth) / 2;
    top = anchorRect.top;
  } else {
    // Place to the right of the anchor
    left = anchorRect.right + margin;
    if (left + popoverWidth > window.innerWidth) {
      // Flip to left side
      left = anchorRect.left - popoverWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    // Vertically center on the anchor
    top = anchorRect.top + anchorRect.height / 2 - popoverHeight / 2;
  }

  // Clamp to viewport
  if (top + popoverHeight > window.innerHeight - margin) {
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
  const { snoozeTask, availableTags } = useTaskContext();
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
  const [repeatEndDate, setRepeatEndDate] = useState<string | null>(task.repeat_end_date);
  const [repeatEndCount, setRepeatEndCount] = useState<number | null>(task.repeat_end_count);
  const [localTags, setLocalTags] = useState<string[]>(task.tags ?? []);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [customHours, setCustomHours] = useState("");
  const [isEditing, setIsEditing] = useState(false);
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
  const tagBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date);
    setDueTime(task.due_time);
    setColor(task.color);
    setLocalCompleted(task.is_completed);
    setRepeatInterval(task.repeat_interval);
    setRepeatUnit(task.repeat_unit);
    setRepeatEndDate(task.repeat_end_date);
    setRepeatEndCount(task.repeat_end_count);
    setLocalTags(task.tags ?? []);
    setShowDatePicker(false);
    setShowColorPicker(false);
    setShowTagPicker(false);
    setIsEditing(false);
    setIsEditingDescription(false);
  }, [task.id, task.title, task.description, task.due_date, task.due_time, task.color, task.is_completed, task.repeat_interval, task.repeat_unit, task.repeat_end_date, task.repeat_end_count, task.tags]);

  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Ignore scroll events originating inside the popover itself
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return;
      onClose();
    };
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

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
      autoResize(titleRef.current);
    }
  }, [isEditing]);

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

  /**
   * Persists title and description on blur.
   * Only sends text fields to avoid racing with picker saves that update
   * due_date, due_time, color, or repeat fields.
   */
  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(task.id, { title: trimmed, description });
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
        {/* Edit toggle */}
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`p-1.5 rounded-lg transition-colors ${
            isEditing
              ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30"
              : "text-subtle-foreground hover:text-foreground hover:bg-accent"
          }`}
          aria-label={isEditing ? "Stop editing" : "Edit task"}
        >
          <Pencil size={14} />
        </button>

        {/* Color circle */}
        <div className="relative">
          <button
            ref={colorBtnRef}
            type="button"
            onClick={isEditing ? () => { setShowColorPicker(!showColorPicker); setShowDatePicker(false); } : undefined}
            className={`p-1.5 rounded-lg transition-colors ${isEditing ? "hover:bg-accent cursor-pointer" : "cursor-default"}`}
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
                      onSave(task.id, { color: c });
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

        {/* Three-dot menu */}
        <div className="relative">
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            aria-label="Task options"
          >
            <MoreVertical size={15} />
          </button>
          {showMenu && menuBtnRef.current && createPortal(
            <div onMouseDown={(e) => e.stopPropagation()}>
              <div className="fixed inset-0 z-[60]" onClick={() => { setShowMenu(false); setSnoozeOpen(false); }} />
              <div
                ref={menuDropdownRef}
                className="fixed z-[60] bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[120px]"
                style={{
                  top: menuBtnRef.current.getBoundingClientRect().bottom + 4,
                  left: Math.min(menuBtnRef.current.getBoundingClientRect().left, window.innerWidth - 140),
                }}
              >
                {/* Open source link */}
                {task.source_url && (
                  <a
                    href={task.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <ExternalLink size={13} />
                    Open link
                  </a>
                )}
                {/* Hide for... (snooze) submenu */}
                <div className="relative">
                  <button
                    onClick={() => setSnoozeOpen(!snoozeOpen)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Clock size={13} />
                    Hide for...
                  </button>
                  {snoozeOpen && (
                    <div className="absolute left-full top-0 ml-1 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[140px] z-[61]">
                      {SNOOZE_PRESETS.map((preset) => (
                        <button
                          key={preset.hours}
                          onClick={() => {
                            snoozeTask(task.id, preset.hours);
                            setShowMenu(false);
                            setSnoozeOpen(false);
                            onClose();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                      <div className="border-t border-border my-1" />
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const h = parseFloat(customHours);
                          if (h > 0) {
                            snoozeTask(task.id, h);
                            setShowMenu(false);
                            setSnoozeOpen(false);
                            setCustomHours("");
                            onClose();
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5"
                      >
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={customHours}
                          onChange={(e) => setCustomHours(e.target.value)}
                          placeholder="hrs"
                          className="w-14 px-2 py-1 text-sm rounded-md border border-input-border bg-background text-foreground placeholder-muted-foreground focus:outline-none"
                        />
                        <span className="text-xs text-muted-foreground">hours</span>
                      </form>
                      <button
                        onClick={() => {
                          snoozeTask(task.id, FOREVER_HOURS);
                          setShowMenu(false);
                          setSnoozeOpen(false);
                          onClose();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <EyeOff size={13} />
                        Until I unhide
                      </button>
                    </div>
                  )}
                </div>
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
          {/* Title — editable textarea or read-only text */}
          {isEditing ? (
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
          ) : (
            <span className="flex-1 min-w-0 text-lg font-semibold text-foreground break-words">
              {title || "Untitled"}
            </span>
          )}
        </div>

        {/* Date line — below title, aligned with title text */}
        <div className="relative pl-8 mt-1">
          <button
            ref={dateBtnRef}
            type="button"
            onClick={isEditing ? () => { setShowDatePicker(!showDatePicker); setShowColorPicker(false); } : undefined}
            className={`text-sm text-secondary-foreground transition-colors ${isEditing ? "hover:text-foreground cursor-pointer" : "cursor-default"}`}
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
                onSave(task.id, { due_date: date });
              }}
              onTimeChange={(time) => {
                setDueTime(time);
                onSave(task.id, { due_time: time });
              }}
              repeatInterval={!task.source ? repeatInterval : undefined}
              repeatUnit={!task.source ? repeatUnit : undefined}
              onRepeatChange={!task.source ? (interval, unit) => {
                setRepeatInterval(interval);
                setRepeatUnit(unit);
                if (!interval || !unit) {
                  setRepeatEndDate(null);
                  setRepeatEndCount(null);
                  onSave(task.id, { repeat_interval: interval, repeat_unit: unit, repeat_end_date: null, repeat_end_count: null });
                } else {
                  onSave(task.id, { repeat_interval: interval, repeat_unit: unit });
                }
              } : undefined}
              repeatEndDate={!task.source ? repeatEndDate : undefined}
              repeatEndCount={!task.source ? repeatEndCount : undefined}
              onRepeatEndChange={!task.source ? (endDate, endCount) => {
                setRepeatEndDate(endDate);
                setRepeatEndCount(endCount);
                onSave(task.id, { repeat_end_date: endDate, repeat_end_count: endCount });
              } : undefined}
            />
          </Popover>
        </div>

        {/* Repeat label — shown if repeat is set, hidden for synced tasks */}
        {!task.source && repeatInterval && repeatUnit && (
          <div className="pl-8 mt-1">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
              {getRepeatLabel(repeatInterval, repeatUnit)}
            </span>
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
                    : task.source === "pensieve"
                    ? "text-purple-600 bg-purple-50 dark:bg-purple-900/30"
                    : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                }`}
              >
                {task.source === "canvas" ? "bCourses" : task.source === "pensieve" ? "Pensieve" : "Gradescope"}
              </span>
            )}
            {task.course_name && (
              <ExpandableBadge text={task.course_name} maxChars={24} className="text-xs font-medium px-2 py-0.5 rounded text-black bg-gray-100 dark:text-white dark:bg-white/10" />
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

      {/* ── Tags section — editable tag chips ── */}
      <div className="px-5 pb-3">
        <div className="pl-8 flex items-center gap-2 flex-wrap">
          {localTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {tag}
            </span>
          ))}
          <div className="relative">
            <button
              ref={tagBtnRef}
              type="button"
              onClick={() => { setShowTagPicker(!showTagPicker); setShowDatePicker(false); setShowColorPicker(false); }}
              className={`p-1 rounded-lg hover:bg-accent transition-colors ${
                localTags.length > 0 ? "text-blue-500" : isEditing ? "text-muted-foreground hover:text-blue-500" : "text-muted-foreground hover:text-blue-500 hidden"
              }`}
              aria-label="Edit tags"
            >
              <Tag size={13} />
            </button>
            <Popover
              open={showTagPicker}
              onClose={() => setShowTagPicker(false)}
              className="absolute left-0 top-full mt-1 z-10"
              triggerRef={tagBtnRef}
            >
              <div className="bg-card rounded-xl shadow-2xl border border-border p-3 w-52">
                <TagPicker
                  selectedTags={localTags}
                  availableTags={availableTags}
                  onChange={(newTags) => {
                    setLocalTags(newTags);
                    onSave(task.id, { tags: newTags });
                  }}
                />
              </div>
            </Popover>
          </div>
        </div>
      </div>

      {/* ── Invite section — only visible in edit mode ── */}
      {isEditing && (
        <div className="px-5 pb-3">
          <div className="pl-8">
            <InviteSection taskId={task.id} />
          </div>
        </div>
      )}

      <div className="border-t border-border-subtle" />

      {/* ── Description section — icon + text ── */}
      <div
        className={`flex items-start gap-3 px-5 py-3 min-h-[44px] ${isEditing && !description && !isEditingDescription ? "cursor-pointer" : ""}`}
        onClick={() => { if (isEditing && !description && !isEditingDescription) setIsEditingDescription(true); }}
      >
        <AlignLeft size={18} className="text-subtle-foreground flex-shrink-0 mt-0.5" />
        {isEditing && (description || isEditingDescription) ? (
          <textarea
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => { handleSave(); if (!description) setIsEditingDescription(false); }}
            rows={Math.max(2, (description || "").split("\n").length + 1)}
            className="flex-1 min-w-0 text-sm text-secondary-foreground bg-transparent focus:outline-none resize-none max-h-[200px] overflow-y-auto"
          />
        ) : description ? (
          <p className="flex-1 min-w-0 text-sm text-secondary-foreground whitespace-pre-wrap break-words">
            {description}
          </p>
        ) : null}
      </div>


      <div className="pb-1" />
    </div>,
    document.body
  );
}
