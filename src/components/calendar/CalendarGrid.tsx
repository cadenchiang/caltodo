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
  onDayClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
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
    <div id="tour-calendar-grid" className="glass rounded-2xl overflow-hidden shadow-md dark:shadow-black/30">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-input-bg border-b-2 border-border">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3.5 border-r border-border last:border-r-0"
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
