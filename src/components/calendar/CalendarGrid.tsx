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
  addingDate?: string | null;
  selectedDate?: string | null;
  onDayClick: (date: string, rect: DOMRect) => void;
  onDaySelect: (date: string) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  onShowMore?: (date: string, rect: DOMRect) => void;
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
  addingDate,
  selectedDate,
  onDayClick,
  onDaySelect,
  onTaskClick,
  onShowMore,
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
  const minRowHeight = isMobile ? "52px" : "120px";

  return (
    <div id="tour-calendar-grid" className="bg-white dark:bg-[#141414] h-full flex flex-col">
      {/* Day grid — weekday labels are inside first-row cells like Google Calendar */}
      <div
        className="grid grid-cols-7 flex-1 min-h-0"
        style={{ gridTemplateRows: `minmax(0, 1.15fr) repeat(${rowCount - 1}, minmax(0, 1fr))` }}
      >
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isFirstRow = i < 7;
          return (
            <CalendarDayCell
              key={dateStr}
              day={day}
              currentMonth={currentMonth}
              tasks={tasksByDate[dateStr] ?? []}
              pendingInvites={invitesByDate[dateStr] ?? []}
              gcalEvents={eventsByDate[dateStr] ?? []}
              addingDate={addingDate}
              isLastCol={(i + 1) % 7 === 0}
              isSelected={selectedDate === dateStr}
              weekdayLabel={isFirstRow ? labels[i % 7] : undefined}
              onDayClick={onDayClick}
              onDaySelect={onDaySelect}
              onTaskClick={onTaskClick}
              onShowMore={onShowMore}
            />
          );
        })}
      </div>
    </div>
  );
}
