"use client";

import { useState, useEffect } from "react";
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
  selectedDate?: string | null;
  onDayClick: (date: string, rect: DOMRect) => void;
  onDaySelect: (date: string) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}

/** Full labels for desktop, single-letter for mobile. */
const WEEKDAY_LABELS_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_LABELS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Month grid layout displaying a 7-column calendar starting on Monday.
 * Equal-height rows using CSS grid 1fr. Scrollable if content overflows.
 */
export default function CalendarGrid({
  currentMonth,
  tasks,
  addingDate,
  selectedDate,
  onDayClick,
  onDaySelect,
  onTaskClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const rowCount = days.length / 7;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const tasksByDate: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (task.due_date) {
      if (!tasksByDate[task.due_date]) {
        tasksByDate[task.due_date] = [];
      }
      tasksByDate[task.due_date].push(task);
    }
  }

  const labels = isMobile ? WEEKDAY_LABELS_SHORT : WEEKDAY_LABELS_FULL;
  const minRowHeight = isMobile ? "70px" : "120px";

  return (
    <div id="tour-calendar-grid" className="bg-card h-full flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-300 dark:border-gray-500 shrink-0">
        {labels.map((label, i) => (
          <div
            key={`${label}-${i}`}
            className="text-center text-[10px] md:text-xs font-semibold text-foreground/70 py-1.5 md:py-2.5"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day grid — equal-height rows filling available space */}
      <div
        className="grid grid-cols-7 flex-1"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(${minRowHeight}, auto))` }}
      >
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          return (
            <CalendarDayCell
              key={dateStr}
              day={day}
              currentMonth={currentMonth}
              tasks={tasksByDate[dateStr] ?? []}
              addingDate={addingDate}
              isLastCol={(i + 1) % 7 === 0}
              isSelected={selectedDate === dateStr}
              onDayClick={onDayClick}
              onDaySelect={onDaySelect}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
}
