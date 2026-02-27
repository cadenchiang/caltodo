"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Clock, ExternalLink, EyeOff, MoreVertical, PenLine, Tag, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import type { Task, TaskUpdate } from "@/lib/types";
import { TASK_COLORS, getMiffyColor } from "@/lib/constants";
import { getRepeatLabel } from "@/lib/repeat";
import { useTaskContext } from "@/contexts/TaskContext";
import DatePicker from "./DatePicker";
import TagPicker from "./TagPicker";
import InviteSection from "./InviteSection";
import TaskCreateModal from "./TaskCreateModal";
import Popover from "@/components/ui/Popover";

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

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, updates: TaskUpdate) => void;
  onDelete?: (id: string) => void;
}

/**
 * Formats a 24-hour time string "HH:MM" to 12-hour format "h:mm AM/PM".
 *
 * @param time24 - Time string in "HH:MM" format
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
 * Returns a formatted due date label (with time if available) and color for the top bar.
 *
 * @param dueDate - ISO date string or null
 * @param dueTime - 24-hour time string ("HH:MM") or null
 * @returns Object with label and className, or null if no date
 */
function getDateDisplay(dueDate: string | null, dueTime: string | null): { label: string; className: string } | null {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formatted = format(due, "EEE, MMM d");
  const timeSuffix = dueTime ? ` at ${formatTime12h(dueTime)}` : "";

  if (diffDays < 0) return { label: `${formatted}${timeSuffix}`, className: "text-red-500" };
  if (diffDays === 0) return { label: `Today${timeSuffix}`, className: "text-red-500" };
  if (diffDays === 1) return { label: `Tomorrow${timeSuffix}`, className: "text-orange-500" };
  return { label: `${formatted}${timeSuffix}`, className: "text-blue-500" };
}

/**
 * Right-side detail panel matching Todoist layout.
 * Top bar: checkbox + date picker + color picker.
 * Below divider: editable title + description textarea.
 * Auto-saves on blur.
 *
 * @param task - The task being viewed/edited, or null for empty state
 * @param onClose - Callback to close/deselect the task
 * @param onSave - Callback with the task ID and updated fields
 */
export default function TaskDetailPanel({ task, onClose, onSave, onDelete }: TaskDetailPanelProps) {
  const { availableTags, snoozeTask } = useTaskContext();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const [tags, setTags] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [color, setColor] = useState("#3B82F6");
  const [repeatInterval, setRepeatInterval] = useState<number | null>(null);
  const [repeatUnit, setRepeatUnit] = useState<"day" | "week" | "month" | null>(null);
  const [repeatEndDate, setRepeatEndDate] = useState<string | null>(null);
  const [repeatEndCount, setRepeatEndCount] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [customHours, setCustomHours] = useState("");
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Sync state when a different task is selected
  useEffect(() => {
    if (task) {
      setDueDate(task.due_date);
      setDueTime(task.due_time);
      setColor(task.color);
      setRepeatInterval(task.repeat_interval);
      setRepeatUnit(task.repeat_unit);
      setTags(task.tags ?? []);
      setRepeatEndDate(task.repeat_end_date);
      setRepeatEndCount(task.repeat_end_count);
      setShowDatePicker(false);
      setShowColorPicker(false);
      setShowEditModal(false);
      setMenuOpen(false);
      setSnoozeOpen(false);
      setCustomHours("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  /**
   * Saves only the specified field overrides (from pickers).
   * Does NOT include other fields — prevents stale-state race conditions
   * where a concurrent blur save overwrites a just-changed value.
   */
  function saveWith(overrides: Partial<TaskUpdate>) {
    if (!task) return;
    onSave(task.id, overrides);
  }

  const dateDisplay = task ? getDateDisplay(dueDate, dueTime) : null;

  return (
    <div className="flex-1 h-full border-l border-border flex flex-col">
      {task ? (
        <>
          {/* Top bar: checkbox | date | color circle */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
            {/* Checkbox */}
            <button
              onClick={() => saveWith({ is_completed: !task.is_completed })}
              className="flex-shrink-0 w-[18px] h-[18px] rounded-[3px] flex items-center justify-center transition-all"
              style={{
                backgroundColor: task.is_completed ? (color || "#9CA3AF") : "transparent",
                border: task.is_completed ? "none" : `1.5px solid ${color || "#D1D5DB"}`,
              }}
              aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
            >
              {task.is_completed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-input-border" />

            {/* Date picker trigger */}
            <div className="relative">
              <button
                ref={dateButtonRef}
                type="button"
                onClick={() => { setShowDatePicker(!showDatePicker); setShowColorPicker(false); }}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80 ${
                  dateDisplay ? dateDisplay.className : "text-subtle-foreground"
                }`}
              >
                <CalendarDays size={16} />
                {dateDisplay ? dateDisplay.label : "No date"}
              </button>
              <Popover
                open={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                triggerRef={dateButtonRef}
                className="absolute left-0 top-full mt-2 z-10"
              >
                <DatePicker
                  value={dueDate}
                  timeValue={dueTime}
                  onChange={(date) => {
                    setDueDate(date);
                    saveWith({ due_date: date });
                  }}
                  onTimeChange={(time) => {
                    setDueTime(time);
                    saveWith({ due_time: time });
                  }}
                  repeatInterval={!task.source ? repeatInterval : undefined}
                  repeatUnit={!task.source ? repeatUnit : undefined}
                  onRepeatChange={!task.source ? (interval, unit) => {
                    setRepeatInterval(interval);
                    setRepeatUnit(unit);
                    if (!interval || !unit) {
                      setRepeatEndDate(null);
                      setRepeatEndCount(null);
                      saveWith({ repeat_interval: interval, repeat_unit: unit, repeat_end_date: null, repeat_end_count: null });
                    } else {
                      saveWith({ repeat_interval: interval, repeat_unit: unit });
                    }
                  } : undefined}
                  repeatEndDate={!task.source ? repeatEndDate : undefined}
                  repeatEndCount={!task.source ? repeatEndCount : undefined}
                  onRepeatEndChange={!task.source ? (endDate, endCount) => {
                    setRepeatEndDate(endDate);
                    setRepeatEndCount(endCount);
                    saveWith({ repeat_end_date: endDate, repeat_end_count: endCount });
                  } : undefined}
                />
              </Popover>
            </div>

            {/* Repeat label (shown alongside date, repeat is set via unified DatePicker) */}
            {!task.source && repeatInterval && repeatUnit && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                {getRepeatLabel(repeatInterval, repeatUnit)}
              </span>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Color picker (flag icon) */}
            <div className="relative">
              <button
                ref={colorButtonRef}
                type="button"
                onClick={() => { setShowColorPicker(!showColorPicker); setShowDatePicker(false); }}
                className="p-1 text-subtle-foreground hover:text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
                aria-label="Pick color"
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
              </button>
              <Popover
                open={showColorPicker}
                onClose={() => setShowColorPicker(false)}
                triggerRef={colorButtonRef}
                className="absolute right-0 top-full mt-2 z-10"
              >
                <div className="bg-card rounded-xl shadow-2xl border border-border p-3">
                  <div className="flex gap-2">
                    {TASK_COLORS.map((c) => {
                      const displayColor = isMiffy ? getMiffyColor(c) : c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setColor(c);
                            setShowColorPicker(false);
                            saveWith({ color: c });
                          }}
                          className={`w-6 h-6 rounded-full transition-all ${
                            color === c ? "scale-125" : "hover:scale-110"
                          }`}
                          style={{
                            backgroundColor: displayColor,
                            boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${displayColor}` : "none",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </Popover>
            </div>

            {/* Open source link */}
            {task.source_url && (
              <a
                href={task.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                aria-label="Open in source"
              >
                <ExternalLink size={14} />
              </a>
            )}

            {/* Edit (pencil) icon — opens edit modal */}
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="p-1 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
              aria-label="Edit task"
            >
              <PenLine size={14} />
            </button>

            {/* Three-dots menu button */}
            {onDelete && (
              <button
                ref={menuBtnRef}
                type="button"
                onClick={() => {
                  if (menuBtnRef.current) {
                    const rect = menuBtnRef.current.getBoundingClientRect();
                    const x = Math.min(rect.left, window.innerWidth - 156);
                    setMenuPos({ x, y: rect.bottom + 4 });
                  }
                  setMenuOpen(true);
                }}
                className="p-1 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                aria-label="Task options"
              >
                <MoreVertical size={14} />
              </button>
            )}
          </div>

          {/* Source badge + course name + late due date + tags (single row) */}
          <div className="flex items-center gap-3 px-5 pt-3 flex-wrap">
            <Tag size={16} className="text-muted-foreground shrink-0" />
            {task.source && (
              <span
                className={`text-sm font-medium px-1.5 py-0.5 rounded ${
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
              <ExpandableBadge text={task.course_name} maxChars={24} className="text-sm font-medium px-1.5 py-0.5 rounded text-black bg-gray-100 dark:text-white dark:bg-white/10" />
            )}
            {task.is_submitted && (
              <span className="text-sm font-medium px-1.5 py-0.5 rounded text-green-600 bg-green-50 dark:bg-green-900/30">
                Submitted
              </span>
            )}
            {task.late_due_date && (
              <span className="text-sm font-medium px-1.5 py-0.5 rounded text-orange-600 bg-orange-50 dark:bg-orange-900/30">
                Late due {format(new Date(task.late_due_date + "T00:00:00"), "MMM d")}
              </span>
            )}
            <TagPicker
              selectedTags={tags}
              availableTags={availableTags}
              onChange={(newTags) => {
                setTags(newTags);
                saveWith({ tags: newTags });
              }}
            />
          </div>

          {/* Invite section — Google Calendar-style guest picker */}
          <div className="px-5 pt-3">
            <InviteSection taskId={task.id} />
          </div>

          {/* Title + Description (read-only — edit via pencil icon) */}
          <div className="flex-1 overflow-auto px-5 pt-3">
            <p className="text-lg font-bold text-foreground mb-2">
              {task.title}
            </p>
            {task.description ? (
              <p className="text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            ) : (
              <p className="text-sm text-subtle-foreground italic">No description</p>
            )}
          </div>

          {/* Edit modal — opened by pencil icon */}
          <TaskCreateModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            onAdd={() => {}}
            editTask={task}
            onSave={(id, updates) => {
              // Update local state for picker-controlled fields
              if (updates.due_date !== undefined) setDueDate(updates.due_date ?? null);
              if (updates.due_time !== undefined) setDueTime(updates.due_time ?? null);
              if (updates.color !== undefined) setColor(updates.color ?? "#3B82F6");
              if (updates.tags !== undefined) setTags(updates.tags ?? []);
              if (updates.repeat_interval !== undefined) setRepeatInterval(updates.repeat_interval ?? null);
              if (updates.repeat_unit !== undefined) setRepeatUnit(updates.repeat_unit ?? null);
              if (updates.repeat_end_date !== undefined) setRepeatEndDate(updates.repeat_end_date ?? null);
              if (updates.repeat_end_count !== undefined) setRepeatEndCount(updates.repeat_end_count ?? null);
              onSave(id, updates);
              setShowEditModal(false);
            }}
          />

          {/* Delete menu (three-dots dropdown) */}
          {menuOpen && onDelete && typeof document !== "undefined" && createPortal(
            <>
              <div
                className="fixed inset-0 z-50"
                onClick={() => setMenuOpen(false)}
                onContextMenu={(e) => { e.preventDefault(); setMenuOpen(false); }}
              />
              <div
                className="fixed z-50 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[140px]"
                style={{ top: menuPos.y, left: menuPos.x }}
              >
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
                            setMenuOpen(false);
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
                            setMenuOpen(false);
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
                          setMenuOpen(false);
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
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task.id);
                    onClose();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete task
                </button>
              </div>
            </>,
            document.body
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-5 gap-3">
          {isMiffy && (
            <img
              src="/miffy/miffy-snoopy.png"
              alt=""
              className="w-32 h-auto opacity-60 select-none pointer-events-none"
              draggable={false}
            />
          )}
          <p className="text-sm text-subtle-foreground">Select a task to view details</p>
        </div>
      )}
    </div>
  );
}
