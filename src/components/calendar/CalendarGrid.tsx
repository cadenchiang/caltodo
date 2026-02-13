"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from "date-fns";
import type { Task } from "@/lib/types";
import CalendarDayCell from "./CalendarDayCell";

interface CalendarGridProps {
  currentMonth: Date;
  tasks: Task[];
  addingDate?: string | null;
  onDayClick: (date: string) => void;
  onTaskClick: (task: Task) => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Month grid layout displaying a 7-column calendar.
 * Glassy card container with no outline borders.
 */
export default function CalendarGrid({
  currentMonth,
  tasks,
  addingDate,
  onDayClick,
  onTaskClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const tasksByDate: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (task.due_date) {
      if (!tasksByDate[task.due_date]) {
        tasksByDate[task.due_date] = [];
      }
      tasksByDate[task.due_date].push(task);
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-sm">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-white/30 border-b border-gray-300/50">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium text-gray-500 py-3 border-r border-gray-300/50 last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          return (
            <CalendarDayCell
              key={dateStr}
              day={day}
              currentMonth={currentMonth}
              tasks={tasksByDate[dateStr] ?? []}
              addingDate={addingDate}
              onDayClick={onDayClick}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
}
