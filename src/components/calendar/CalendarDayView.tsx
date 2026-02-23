"use client";

import { format } from "date-fns";
import { Plus, CalendarDays } from "lucide-react";
import type { Task } from "@/lib/types";

interface CalendarDayViewProps {
  currentDate: Date;
  tasks: Task[];
  onAddClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}

/**
 * Formats a 24-hour time string to compact 12-hour format.
 *
 * @param time24 - "HH:MM" format
 * @returns e.g. "6:43 PM"
 */
function formatTime(time24: string): string {
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

/**
 * Converts a hex color to an rgba string at the given opacity.
 *
 * @param hex - Hex color string (e.g. "#3b82f6")
 * @param opacity - Opacity between 0 and 1
 * @returns rgba string
 */
function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Single-day view showing all tasks for a specific date.
 * Task cards use the task's color as a tinted background.
 * Shows empty state with calendar icon when no tasks exist.
 *
 * @param currentDate - The date to display
 * @param tasks - All tasks (filtered by date in this component)
 * @param onAddClick - Callback to open add-task popover
 * @param onTaskClick - Callback to open task edit popover
 */
export default function CalendarDayView({
  currentDate,
  tasks,
  onAddClick,
  onTaskClick,
}: CalendarDayViewProps) {
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const dayTasks = tasks.filter((t) => t.due_date === dateStr);

  return (
    <div className="overflow-hidden bg-card flex flex-col h-full">
      {/* Task list or empty state */}
      <div className="flex-1 overflow-y-auto p-6">
        {dayTasks.length > 0 ? (
          <div className="flex flex-col gap-3 max-w-xl">
            {dayTasks.map((task) => (
              <DayTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
            ))}
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onAddClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-muted-foreground hover:text-foreground hover:border-gray-400 hover:bg-muted/30 active:scale-95 transition-all"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarDays size={28} className="text-muted-foreground" />
            </div>
            <p className="text-base text-muted-foreground font-medium mb-3">No tasks for this day</p>
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onAddClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-gray-800 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Task card for day view with color-tinted background and hover effect.
 *
 * @param task - The task to render
 * @param onTaskClick - Click callback
 */
function DayTaskCard({
  task,
  onTaskClick,
}: {
  task: Task;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}) {
  const color = task.color || "#6b7280";

  return (
    <button
      onClick={(e) => onTaskClick(task, e.currentTarget.getBoundingClientRect())}
      className={`w-full text-left rounded-xl p-4 transition-all hover:-translate-y-px hover:shadow-sm ${
        task.is_completed ? "opacity-50" : ""
      }`}
      style={{
        backgroundColor: hexToRgba(color, 0.1),
        borderLeft: `2px solid ${color}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hexToRgba(color, 0.18);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = hexToRgba(color, 0.1);
      }}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold flex items-center gap-1.5 ${task.is_completed ? "line-through" : ""}`} style={{ color }}>
          {task.is_completed && (
            <svg className="w-4 h-4 shrink-0" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {task.title}
        </p>
        {task.due_time && (
          <p className="text-xs mt-1" style={{ color, opacity: 0.7 }}>
            {formatTime(task.due_time)}
          </p>
        )}
        {task.description && (
          <p className="text-xs mt-1 truncate" style={{ color, opacity: 0.6 }}>{task.description}</p>
        )}
      </div>
    </button>
  );
}
