"use client";

import { useState, useEffect } from "react";
import { format, isSameDay, isSameMonth } from "date-fns";
import type { Task } from "@/lib/types";
import CalendarTaskBar from "./CalendarTaskBar";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  tasks: Task[];
  addingDate?: string | null;
  isLastCol?: boolean;
  isSelected?: boolean;
  onDayClick: (date: string, rect: DOMRect) => void;
  onDaySelect: (date: string) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}

/**
 * A single day cell in the month grid. Double-click to add a task.
 * Shows a "Double-click to add" hint on hover for every day.
 *
 * @param day - The date this cell represents
 * @param currentMonth - The currently displayed month
 * @param tasks - Tasks assigned to this day
 * @param onDayClick - Callback when double-clicked
 * @param onTaskClick - Callback when a task is clicked
 */
export default function CalendarDayCell({
  day,
  currentMonth,
  tasks,
  addingDate,
  isLastCol,
  isSelected,
  onDayClick,
  onDaySelect,
  onTaskClick,
}: CalendarDayCellProps) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const dateStr = format(day, "yyyy-MM-dd");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const maxVisible = isMobile ? 2 : 3;
  const visibleTasks = expanded ? tasks : tasks.slice(0, maxVisible);
  const overflow = tasks.length - maxVisible;

  return (
    <div
      className={`p-1 md:p-1.5 ${isLastCol ? "" : "border-r"} border-b border-gray-300 dark:border-gray-600 transition-colors relative ${
        !isCurrentMonth
          ? "bg-muted/40"
          : "bg-card"
      } hover:bg-muted/50`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onDaySelect(dateStr)}
      onDoubleClick={(e) => {
        const rect = new DOMRect(e.clientX - 40, e.clientY, 80, 1);
        onDayClick(dateStr, rect);
      }}
    >
      {/* Day number + add button row */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`inline-flex items-center justify-center text-[11px] leading-none ${
            isToday
              ? "w-5 h-5 rounded-full bg-[#007AFF] text-white font-bold"
              : isSelected
                ? "w-5 h-5 rounded-full bg-gray-800 dark:bg-white text-white dark:text-gray-900 font-bold"
                : isCurrentMonth
                  ? "text-foreground font-medium"
                  : "text-muted-foreground/60"
          }`}
        >
          {format(day, "d")}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            onDayClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
          }}
          className={`w-4 h-4 rounded-full items-center justify-center text-muted-foreground hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-foreground transition-all hidden md:flex ${
            hovered && !addingDate ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
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
            className="text-[10px] text-blue-500 font-semibold hover:text-blue-700 hover:underline px-0.5 text-left transition-all"
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
            className="text-[10px] text-muted-foreground hover:text-foreground hover:underline px-0.5 text-left transition-all"
          >
            show less
          </button>
        )}
      </div>

    </div>
  );
}
