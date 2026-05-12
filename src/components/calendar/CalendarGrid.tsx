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
import type { Task, PendingInvite, GCalEvent } from "@/lib/types";
import { getEventDateKey } from "@/lib/gcal/event-utils";
import CalendarDayCell from "./CalendarDayCell";

interface CalendarGridProps {
  currentMonth: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  gcalEvents?: GCalEvent[];
  /** Map of calendarId → backgroundColor from Google. */
  calendarColors?: Record<string, string>;
  /** Current calendar mode — "assignments" uses bigger task bars, no events. */
  calendarMode?: "assignments" | "calendar";
  addingDate?: string | null;
  selectedDate?: string | null;
  onDayClick: (date: string, rect: DOMRect) => void;
  onDaySelect: (date: string) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  onShowMore?: (date: string, rect: DOMRect) => void;
  /** ID of the task whose popover is currently open (stays highlighted). */
  activeTaskId?: string | null;
  /** ID of a task that was just rescheduled — plays a brief drop-in animation. */
  recentlyMovedTaskId?: string | null;
  /** Called when a task bar is dropped on a different day cell. */
  onTaskDrop?: (taskId: string, newDate: string) => void;
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
  pendingInvites = [],
  gcalEvents = [],
  calendarColors = {},
  calendarMode = "calendar",
  addingDate,
  selectedDate,
  onDayClick,
  onDaySelect,
  onTaskClick,
  onShowMore,
  activeTaskId,
  recentlyMovedTaskId,
  onTaskDrop,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const rowCount = days.length / 7;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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

  const invitesByDate: Record<string, PendingInvite[]> = {};
  for (const invite of pendingInvites) {
    if (invite.taskDueDate) {
      if (!invitesByDate[invite.taskDueDate]) {
        invitesByDate[invite.taskDueDate] = [];
      }
      invitesByDate[invite.taskDueDate].push(invite);
    }
  }

  // Group GCal events by date
  const eventsByDate: Record<string, GCalEvent[]> = {};
  for (const event of gcalEvents) {
    const dateKey = getEventDateKey(event.start);
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  }

  const labels = isMobile ? WEEKDAY_LABELS_SHORT : WEEKDAY_LABELS_FULL;
  // Taller default rows so the 2-row task bars (title + status pill)
  // have breathing room and a few tasks can show before truncation.
  const minRowHeight = isMobile ? "68px" : "160px";

  // Weekday index for "today" (Mon=0 ... Sun=6, weekStartsOn:1).
  const todayDow = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  })();

  return (
    <div id="tour-calendar-grid" className="bg-card flex flex-col">
      {/* Weekday header row — inside the rounded card. Current weekday is
          bold + solid foreground; others stay muted. */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700/50 bg-card">
        {labels.map((label, i) => (
          <div
            key={label}
            className={`text-center text-[11px] py-2 tracking-wide ${
              i === todayDow
                ? "font-bold text-foreground"
                : "font-medium text-muted-foreground"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day grid — each week row sizes to its tallest cell, so weeks
          with more tasks grow taller and quiet weeks stay short. The
          min keeps an empty week from collapsing too far. */}
      <div
        className="grid grid-cols-7"
        style={{ gridAutoRows: `minmax(${minRowHeight}, max-content)` }}
      >
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          return (
            <CalendarDayCell
              key={dateStr}
              day={day}
              currentMonth={currentMonth}
              tasks={tasksByDate[dateStr] ?? []}
              pendingInvites={invitesByDate[dateStr] ?? []}
              gcalEvents={eventsByDate[dateStr] ?? []}
              calendarColors={calendarColors}
              assignmentsMode={calendarMode === "assignments"}
              addingDate={addingDate}
              isLastCol={(i + 1) % 7 === 0}
              isSelected={selectedDate === dateStr}
              onDayClick={onDayClick}
              onDaySelect={onDaySelect}
              onTaskClick={onTaskClick}
              onShowMore={onShowMore}
              activeTaskId={activeTaskId}
              recentlyMovedTaskId={recentlyMovedTaskId}
              onTaskDrop={onTaskDrop}
            />
          );
        })}
      </div>
    </div>
  );
}
