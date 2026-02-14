"use client";

import { format, isSameDay, isSameMonth } from "date-fns";
import type { Task } from "@/lib/types";
import CalendarTaskBar from "./CalendarTaskBar";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  tasks: Task[];
  addingDate?: string | null;
  onDayClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}

/**
 * A single day cell in the calendar grid.
 * Entire cell is clickable to add a task. Task bars stop propagation.
 *
 * @param day - The date this cell represents
 * @param currentMonth - The currently displayed month
 * @param tasks - Tasks assigned to this day
 * @param onDayClick - Callback when the cell is clicked, includes bounding rect for popover positioning
 * @param onTaskClick - Callback when a task bar is clicked, includes bounding rect for popover positioning
 */
export default function CalendarDayCell({
  day,
  currentMonth,
  tasks,
  addingDate,
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
      className={`min-h-[140px] p-1.5 cursor-pointer border-r border-b border-border transition-colors ${
        !isCurrentMonth
          ? "bg-muted/80"
          : isPast
            ? "bg-muted/50"
            : "bg-card/30"
      } hover:bg-blue-50/40 dark:hover:bg-blue-900/20`}
      onClick={(e) => onDayClick(dateStr, e.currentTarget.getBoundingClientRect())}
    >
      {/* Day number */}
      <div
        className={`w-7 h-7 text-xs rounded-full flex items-center justify-center mb-1 ${
          isToday
            ? "bg-blue-500 text-white font-bold shadow-sm"
            : isCurrentMonth
              ? "text-secondary-foreground"
              : "text-subtle-foreground"
        }`}
      >
        {format(day, "d")}
      </div>

      {/* "(No title)" placeholder when this day is being added to */}
      {addingDate === dateStr && (
        <div className="bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded truncate mb-0.5">
          (No title)
        </div>
      )}

      {/* Task bars */}
      <div className="flex flex-col gap-0.5">
        {visibleTasks.map((task) => (
          <CalendarTaskBar key={task.id} task={task} onClick={onTaskClick} />
        ))}
        {overflow > 0 && (
          <span className="text-xs text-subtle-foreground px-1">+{overflow} more</span>
        )}
      </div>
    </div>
  );
}
