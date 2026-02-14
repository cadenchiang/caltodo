"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskUpdate } from "@/lib/types";
import { TASK_COLORS } from "@/lib/constants";
import DatePicker from "./DatePicker";
import Popover from "@/components/ui/Popover";

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, updates: TaskUpdate) => void;
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
export default function TaskDetailPanel({ task, onClose, onSave }: TaskDetailPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [color, setColor] = useState("#3B82F6");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  // Sync state when a different task is selected
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.due_date);
      setDueTime(task.due_time);
      setColor(task.color);
      setShowDatePicker(false);
      setShowColorPicker(false);
    }
  }, [task?.id, task?.title, task?.description, task?.due_date, task?.due_time, task?.color]);

  /**
   * Persists current form state to the backend.
   */
  function save() {
    if (!task) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(task.id, { title: trimmed, description, due_date: dueDate, due_time: dueTime, color });
  }

  /**
   * Saves with an immediate field override (for pickers that change a value and save in one step).
   */
  function saveWith(overrides: Partial<TaskUpdate>) {
    if (!task) return;
    const trimmed = title.trim() || task.title;
    onSave(task.id, { title: trimmed, description, due_date: dueDate, due_time: dueTime, color, ...overrides });
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
                    setShowDatePicker(false);
                    saveWith({ due_date: date });
                  }}
                  onTimeChange={(time) => {
                    setDueTime(time);
                    saveWith({ due_time: time });
                  }}
                />
              </Popover>
            </div>

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
                    {TASK_COLORS.map((c) => (
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

          {/* Source badge */}
          {(task.source || task.is_submitted) && (
            <div className="flex items-center gap-2 px-5 pt-3">
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
              {task.is_submitted && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-green-600 bg-green-50 dark:bg-green-900/30">
                  Submitted
                </span>
              )}
            </div>
          )}

          {/* Title + Description */}
          <div className="flex-1 overflow-auto px-5 pt-5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={save}
              className="w-full text-lg font-bold text-foreground bg-transparent focus:outline-none placeholder-subtle-foreground mb-2"
              placeholder="Task title"
            />
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={save}
              placeholder="Write something..."
              className="w-full text-sm text-secondary-foreground bg-transparent focus:outline-none resize-none placeholder-subtle-foreground leading-relaxed min-h-[200px]"
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-5">
          <p className="text-sm text-subtle-foreground">Select a task to view details</p>
        </div>
      )}
    </div>
  );
}
