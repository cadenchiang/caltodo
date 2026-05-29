"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import type { Task } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";

interface TaskPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (taskIds: string[]) => void;
  alreadySelected: string[];
}

/**
 * Modal for selecting tasks to focus on during a pomodoro session.
 * Shows incomplete tasks with due dates and tags. Users can multi-select
 * and confirm, or skip to start without tasks.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Close callback
 * @param onSelect - Callback with selected task IDs
 * @param alreadySelected - IDs already in the focus list
 */
export default function TaskPickerModal({
  open,
  onClose,
  onSelect,
  alreadySelected,
}: TaskPickerModalProps) {
  const { tasks } = useTaskContext();
  const { colorTheme } = useTheme();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(alreadySelected),
  );

  if (!open) return null;

  const incompleteTasks = tasks.filter((t) => !t.is_completed);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatDate(task: Task): string {
    if (!task.due_date) return "";
    const d = new Date(task.due_date + "T00:00:00");
    const dateStr = d.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
    if (task.due_time) {
      const [h, m] = task.due_time.split(":");
      const dt = new Date();
      dt.setHours(Number(h), Number(m));
      return `${dateStr}, ${dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
    return dateStr;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={onClose}
      />
      <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-lg mx-4 animate-announce-card-in overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Choose Your Focus Tasks
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Select the tasks you want to work on during this session
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-border">
          {incompleteTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No incomplete tasks to show.
            </div>
          ) : (
            incompleteTasks.map((task) => {
              const isChecked = selected.has(task.id);
              const taskColor = getThemeColor(task.color, colorTheme);
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggle(task.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-b border-border transition-colors ${
                    isChecked
                      ? "bg-accent/60"
                      : "hover:bg-accent/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? "border-blue-500 bg-blue-500"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isChecked && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: taskColor }}
                      >
                        {formatDate(task)}
                      </p>
                    )}
                  </div>
                  {task.course_name && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      # {task.course_name}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {selected.size === 0
              ? "No tasks selected"
              : `${selected.size} task${selected.size > 1 ? "s" : ""} selected`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSelect([...selected]);
                onClose();
              }}
              className="px-4 py-2 text-sm rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
              Start Focus Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
