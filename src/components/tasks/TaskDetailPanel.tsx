"use client";

import { useState, useEffect } from "react";
import { X, CalendarDays } from "lucide-react";
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
 * Always-visible right-side panel. Shows an empty state when no task is selected,
 * and task details (title, description, due date, color) when a task is selected.
 * Content transitions smoothly between empty and detail states.
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

  // Sync state when a different task is selected
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.due_date);
      setColor(task.color);
      setShowDatePicker(false);
    }
  }, [task?.id, task?.title, task?.description, task?.due_date, task?.color]);

  function handleSave() {
    if (!task) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(task.id, { title: trimmed, description, due_date: dueDate, color });
  }

  return (
    <div className="flex-1 h-full border-l border-gray-100 bg-white flex flex-col">
      {task ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-800">Task Details</span>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-5 flex flex-col gap-5 animate-in">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="w-full text-base font-medium text-gray-800 bg-transparent focus:outline-none placeholder-gray-300"
                placeholder="Task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                rows={5}
                placeholder="Add a description..."
                className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2.5 focus:outline-none focus:bg-gray-100 transition-colors resize-none placeholder-gray-400"
              />
            </div>

            {/* Due Date — inline icon button */}
            <div className="relative inline-flex">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                title={dueDate ? format(new Date(dueDate + "T00:00:00"), "MMMM d, yyyy") : "Set due date"}
              >
                <CalendarDays size={14} />
                {dueDate ? format(new Date(dueDate + "T00:00:00"), "MMM d") : "Date"}
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

            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Color</label>
              <div className="flex gap-2.5">
                {TASK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      onSave(task.id, { title: title.trim() || task.title, description, due_date: dueDate, color: c });
                    }}
                    className={`w-6 h-6 rounded-full transition-all ${
                      color === c ? "scale-125" : "hover:scale-110"
                    }`}
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 2px 8px ${c}50` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Empty state when no task selected */
        <div className="flex-1 flex items-center justify-center p-5">
          <p className="text-sm text-gray-300">Select a task to view details</p>
        </div>
      )}
    </div>
  );
}
