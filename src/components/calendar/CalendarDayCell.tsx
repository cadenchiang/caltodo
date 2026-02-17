"use client";

import { useState } from "react";
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
  const [expanded, setExpanded] = useState(false);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = day.getTime() < today.getTime();
  const dateStr = format(day, "yyyy-MM-dd");
  const maxVisible = 3;
  const visibleTasks = expanded ? tasks : tasks.slice(0, maxVisible);
  const overflow = tasks.length - maxVisible;

  return (
    <div
      className={`min-h-[140px] p-1.5 cursor-pointer border-r border-b border-border transition-all duration-150 ${
        !isCurrentMonth
          ? "bg-muted/80"
          : isPast
            ? "bg-muted/50"
            : "bg-card/30"
      } hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:shadow-[inset_0_0_0_1.5px_var(--color-blue-300)] dark:hover:shadow-[inset_0_0_0_1.5px_var(--color-blue-600)] hover:z-10`}
      onClick={(e) => {
        const rect = new DOMRect(e.clientX - 40, e.clientY, 80, 1);
        onDayClick(dateStr, rect);
      }}
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
        {overflow > 0 && !expanded && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            className="text-xs text-blue-500 hover:text-blue-600 px-1 text-left transition-colors"
          >
            +{overflow} more
          </button>
        )}
        {expanded && overflow > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            className="text-xs text-subtle-foreground hover:text-secondary-foreground px-1 text-left transition-colors"
          >
            show less
          </button>
        )}
      </div>
    </div>
  );
}
