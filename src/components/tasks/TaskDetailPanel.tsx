"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, Flag } from "lucide-react";
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
 * Returns a formatted due date label and color for the top bar.
 *
 * @param dueDate - ISO date string or null
 * @returns Object with label and className, or null if no date
 */
function getDateDisplay(dueDate: string | null): { label: string; className: string } | null {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formatted = format(due, "EEE, MMM d");

  if (diffDays < 0) return { label: formatted, className: "text-red-500" };
  if (diffDays === 0) return { label: "Today", className: "text-red-500" };
  if (diffDays === 1) return { label: "Tomorrow", className: "text-orange-500" };
  return { label: formatted, className: "text-blue-500" };
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
      setColor(task.color);
      setShowDatePicker(false);
      setShowColorPicker(false);
    }
  }, [task?.id, task?.title, task?.description, task?.due_date, task?.color]);

  /**
   * Persists current form state to the backend.
   */
  function save() {
    if (!task) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(task.id, { title: trimmed, description, due_date: dueDate, color });
  }

  /**
   * Saves with an immediate field override (for pickers that change a value and save in one step).
   */
  function saveWith(overrides: Partial<TaskUpdate>) {
    if (!task) return;
    const trimmed = title.trim() || task.title;
    onSave(task.id, { title: trimmed, description, due_date: dueDate, color, ...overrides });
  }

  const dateDisplay = task ? getDateDisplay(dueDate) : null;

  return (
    <div className="flex-1 h-full border-l border-gray-100 bg-white flex flex-col">
      {task ? (
        <>
          {/* Top bar: checkbox | date | color flag */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
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
            <div className="w-px h-5 bg-gray-200" />

            {/* Date picker trigger */}
            <div className="relative">
              <button
                ref={dateButtonRef}
                type="button"
                onClick={() => { setShowDatePicker(!showDatePicker); setShowColorPicker(false); }}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80 ${
                  dateDisplay ? dateDisplay.className : "text-gray-400"
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
                  onChange={(date) => {
                    setDueDate(date);
                    setShowDatePicker(false);
                    saveWith({ due_date: date });
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
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Pick color"
              >
                <Flag size={18} style={{ color }} />
              </button>
              <Popover
                open={showColorPicker}
                onClose={() => setShowColorPicker(false)}
                triggerRef={colorButtonRef}
                className="absolute right-0 top-full mt-2 z-10"
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

          {/* Title + Description */}
          <div className="flex-1 overflow-auto px-5 pt-5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={save}
              className="w-full text-lg font-bold text-gray-800 bg-transparent focus:outline-none placeholder-gray-300 mb-2"
              placeholder="Task title"
            />
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={save}
              placeholder="Write something..."
              className="w-full text-sm text-gray-600 bg-transparent focus:outline-none resize-none placeholder-gray-400 leading-relaxed min-h-[200px]"
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-5">
          <p className="text-sm text-gray-300">Select a task to view details</p>
        </div>
      )}
    </div>
  );
}
