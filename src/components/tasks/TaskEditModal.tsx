"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Task, TaskUpdate } from "@/lib/types";
import { TASK_COLORS } from "@/lib/constants";
import DatePicker from "./DatePicker";
import Popover from "@/components/ui/Popover";

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
  onSave: (id: string, updates: TaskUpdate) => void;
}

/**
 * Animated modal for editing task details: title, description, due date, and color.
 * Fades in on mount with backdrop blur. Click backdrop to close.
 *
 * @param task - The task being edited
 * @param onClose - Callback to close the modal
 * @param onSave - Callback with the task ID and updated fields
 */
export default function TaskEditModal({ task, onClose, onSave }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState<string | null>(task.due_date);
  const [color, setColor] = useState(task.color);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;

    onSave(task.id, {
      title: trimmed,
      description,
      due_date: dueDate,
      color,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative glass-strong rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 transition-all duration-200 ease-out ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-xl hover:bg-white/40"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-5">Edit Task</h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/50 text-sm text-gray-800 focus:outline-none focus:bg-white/70 transition-all"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-white/50 text-sm text-gray-800 focus:outline-none focus:bg-white/70 transition-all resize-none"
          />
        </div>

        {/* Due Date */}
        <div className="mb-4 relative">
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Due Date</label>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full text-left px-4 py-2.5 rounded-xl bg-white/50 text-sm text-gray-800 hover:bg-white/70 transition-all"
          >
            {dueDate ?? "No date"}
          </button>
          <Popover
            open={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            className="absolute top-full left-0 mt-2 z-10"
          >
            <DatePicker
              value={dueDate}
              onChange={(date) => {
                setDueDate(date);
                setShowDatePicker(false);
              }}
            />
          </Popover>
        </div>

        {/* Color */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Color</label>
          <div className="flex gap-2.5">
            {TASK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${
                  color === c ? "scale-125 shadow-lg" : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 4px 12px ${c}60` : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-800 rounded-xl hover:bg-white/40 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-500/90 text-white text-sm rounded-xl hover:bg-blue-600/90 transition-all shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
