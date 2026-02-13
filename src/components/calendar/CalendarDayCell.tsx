"use client";

import { format, isSameDay, isSameMonth } from "date-fns";
import type { Task } from "@/lib/types";
import CalendarTaskBar from "./CalendarTaskBar";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  tasks: Task[];
  onDayClick: (date: string) => void;
  onTaskClick: (task: Task) => void;
}

/**
 * A single day cell in the calendar grid.
 * Entire cell is clickable to add a task. Task bars stop propagation.
 *
 * @param day - The date this cell represents
 * @param currentMonth - The currently displayed month
 * @param tasks - Tasks assigned to this day
 * @param onDayClick - Callback when the cell is clicked (to add a task)
 * @param onTaskClick - Callback when a task bar is clicked (to edit)
 */
export default function CalendarDayCell({
  day,
  currentMonth,
  tasks,
  onDayClick,
  onTaskClick,
}: CalendarDayCellProps) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = day.getTime() < today.getTime();
  const dateStr = format(day, "yyyy-MM-dd");
  const maxVisible = 3;
  const visibleTasks = tasks.slice(0, maxVisible);
  const overflow = tasks.length - maxVisible;

  return (
    <div
      className={`min-h-[140px] p-1.5 cursor-pointer border-r border-b border-gray-300/50 transition-colors ${
        !isCurrentMonth
          ? "bg-gray-50/80"
          : isPast
            ? "bg-gray-50/50"
            : "bg-white/30"
      } hover:bg-blue-50/40`}
      onClick={() => onDayClick(dateStr)}
    >
      {/* Day number */}
      <div
        className={`w-7 h-7 text-xs rounded-full flex items-center justify-center mb-1 ${
          isToday
            ? "bg-blue-500 text-white font-bold shadow-sm"
            : isCurrentMonth
              ? "text-gray-700"
              : "text-gray-300"
        }`}
      >
        {format(day, "d")}
      </div>

      {/* Task bars */}
      <div className="flex flex-col gap-0.5">
        {visibleTasks.map((task) => (
          <CalendarTaskBar key={task.id} task={task} onClick={onTaskClick} />
        ))}
        {overflow > 0 && (
          <span className="text-xs text-gray-400 px-1">+{overflow} more</span>
        )}
      </div>
    </div>
  );
}
