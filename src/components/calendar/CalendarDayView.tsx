"use client";

import { format } from "date-fns";
import { Plus, CalendarDays } from "lucide-react";
import type { Task } from "@/lib/types";
import { getMiffyColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const dayTasks = tasks.filter((t) => t.due_date === dateStr);

  return (
    <div className="overflow-hidden bg-card flex flex-col h-full relative">
      {/* + icon top right */}
      <button
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onAddClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
        }}
        className="absolute top-2 right-3 md:top-3 md:right-4 z-10 w-9 h-9 md:w-8 md:h-8 rounded-full bg-gray-800 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center hover:opacity-80 active:scale-95 transition-all shadow-sm"
      >
        <Plus size={18} />
      </button>

      {/* Task list or empty state */}
      <div
        className="flex-1 overflow-y-auto p-3 md:p-6"
        onDoubleClick={(e) => {
          const rect = new DOMRect(e.clientX - 40, e.clientY, 80, 1);
          onAddClick(dateStr, rect);
        }}
      >
        {dayTasks.length > 0 ? (
          <div className="flex flex-col gap-3 max-w-xl">
            {dayTasks.map((task) => (
              <DayTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
            {isMiffy ? (
              <img
                src="/miffy/miffy-balloon.png"
                alt=""
                className="w-16 md:w-20 h-auto opacity-50 mb-3 md:mb-4 select-none pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center mb-3 md:mb-4">
                <CalendarDays size={24} className="text-muted-foreground md:hidden" />
                <CalendarDays size={28} className="text-muted-foreground hidden md:block" />
              </div>
            )}
            <p className="text-sm md:text-base text-muted-foreground font-medium mb-1">No tasks for this day</p>
            <p className="text-xs md:text-sm text-muted-foreground/70">Press + to add a task</p>
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
  const { colorTheme } = useTheme();
  const rawColor = task.color || "#6b7280";
  const color = colorTheme === "miffy" ? getMiffyColor(task.color) : rawColor;

  return (
    <button
      onClick={(e) => onTaskClick(task, e.currentTarget.getBoundingClientRect())}
      className={`w-full text-left rounded-xl p-3 md:p-4 transition-all hover:-translate-y-px hover:shadow-sm ${
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
