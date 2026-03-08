"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import type { Task, PendingInvite, GCalEvent } from "@/lib/types";
import { getThemeColor } from "@/lib/constants";
import { getEventDateKey, getEventColor } from "@/lib/gcal/event-utils";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import { useTheme } from "@/contexts/ThemeContext";
import CalendarTaskBar from "./CalendarTaskBar";
import CalendarGCalItem from "./CalendarGCalItem";
import TimeGrid from "./TimeGrid";

interface CalendarWeekViewProps {
  currentDate: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  gcalEvents?: GCalEvent[];
  /** Date string of the day currently being added to (shows placeholder). */
  addingDate?: string | null;
  onDayClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  onEventCreate?: (date: string, startTime: string, endTime: string) => void;
}

/**
 * Week view with all-day section (task bars + all-day GCal events) at top,
 * then a scrollable time grid for timed GCal events.
 *
 * @param currentDate - Any date within the target week
 * @param tasks - All tasks for the week
 * @param gcalEvents - Google Calendar events for the week
 * @param onDayClick - Handler for adding tasks
 * @param onTaskClick - Click handler for editing tasks
 */
export default function CalendarWeekView({
  currentDate,
  tasks,
  pendingInvites = [],
  gcalEvents = [],
  addingDate,
  onDayClick,
  onTaskClick,
  onEventCreate,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
      if (!tasksByDate[task.due_date]) tasksByDate[task.due_date] = [];
      tasksByDate[task.due_date].push(task);
    }
  }

  const invitesByDate: Record<string, PendingInvite[]> = {};
  for (const invite of pendingInvites) {
    if (invite.taskDueDate) {
      if (!invitesByDate[invite.taskDueDate]) invitesByDate[invite.taskDueDate] = [];
      invitesByDate[invite.taskDueDate].push(invite);
    }
  }

  // Split GCal events into all-day and timed, grouped by date
  const { allDayByDate, timedByDate } = useMemo(() => {
    const allDay: Record<string, GCalEvent[]> = {};
    const timed: Record<string, GCalEvent[]> = {};
    for (const event of gcalEvents) {
      const dateKey = getEventDateKey(event.start);
      if (event.allDay) {
        if (!allDay[dateKey]) allDay[dateKey] = [];
        allDay[dateKey].push(event);
      } else {
        if (!timed[dateKey]) timed[dateKey] = [];
        timed[dateKey].push(event);
      }
    }
    return { allDayByDate: allDay, timedByDate: timed };
  }, [gcalEvents]);

  // Check if there are any all-day items (tasks, all-day events, or adding placeholder)
  const hasAllDayContent = days.some((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return (tasksByDate[dateStr]?.length ?? 0) > 0 ||
           (allDayByDate[dateStr]?.length ?? 0) > 0 ||
           (invitesByDate[dateStr]?.length ?? 0) > 0 ||
           addingDate === dateStr;
  });

  // Build time grid columns
  const timeGridColumns = useMemo(() => {
    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return {
        events: timedByDate[dateStr] ?? [],
      };
    });
  }, [days, timedByDate]);

  const columnDates = useMemo(() => days.map((d) => format(d, "yyyy-MM-dd")), [days]);

  const hasTimedEvents = timeGridColumns.some((col) => col.events.length > 0);

  return (
    <div className="bg-card flex flex-col h-full overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-7 shrink-0 bg-card" style={{ marginLeft: !isMobile ? "56px" : "0" }}>
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={dateStr}
              className="flex flex-col items-center py-1.5 md:py-2.5 gap-0.5"
            >
              <span className={`text-[9px] md:text-[11px] font-semibold uppercase ${
                isToday ? "text-[#007AFF]" : "text-foreground/60"
              }`}>
                <span className="md:hidden">{format(day, "EEEEE")}</span>
                <span className="hidden md:inline">{format(day, "EEE")}</span>
              </span>
              <span
                className={`text-sm md:text-lg font-semibold inline-flex items-center justify-center ${
                  isToday
                    ? "w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#007AFF] text-white"
                    : "text-foreground"
                }`}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* All-day section: task bars + all-day GCal events */}
      {hasAllDayContent && !isMobile && (
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700/50 shrink-0 bg-card" style={{ marginLeft: !isMobile ? "56px" : "0" }}>
          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate[dateStr] ?? [];
            const dayAllDayEvents = allDayByDate[dateStr] ?? [];
            const dayInvites = invitesByDate[dateStr] ?? [];
            const isLastCol = i === 6;
            return (
              <div
                key={dateStr}
                className={`p-1 flex flex-col gap-0.5 ${isLastCol ? "" : "border-r"} border-gray-200 dark:border-gray-700/50`}
                onDoubleClick={(e) => {
                  const rect = new DOMRect(e.clientX - 40, e.clientY, 80, 1);
                  onDayClick(dateStr, rect);
                }}
              >
                {dayTasks.map((task) => (
                  <CalendarTaskBar key={task.id} task={task} onClick={onTaskClick} />
                ))}
                {dayInvites.map((invite) => (
                  <CalendarTaskBar
                    key={invite.shareId}
                    task={pendingInviteToPseudoTask(invite)}
                    onClick={() => {}}
                    isPending
                  />
                ))}
                {dayAllDayEvents.map((event) => (
                  <CalendarGCalItem key={event.id} event={event} />
                ))}
                {addingDate === dateStr && (
                  <div className="bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded truncate">
                    (No title)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid (desktop) or simplified dots (mobile) */}
      {isMobile ? (
        <MobileWeekContent
          days={days}
          tasksByDate={tasksByDate}
          invitesByDate={invitesByDate}
          allDayByDate={allDayByDate}
          timedByDate={timedByDate}
          onDayClick={onDayClick}
          onTaskClick={onTaskClick}
        />
      ) : (
        <TimeGrid
          columns={timeGridColumns}
          columnDates={columnDates}
          rowHeight={60}
          showCurrentTime={true}
          onTimeDoubleClick={onEventCreate ? (date, hour, minute) => {
            const start = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            const endH = hour + 1;
            const end = `${String(endH).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            onEventCreate(date, start, end);
          } : undefined}
        />
      )}
    </div>
  );
}

/**
 * Mobile week view: simplified dots + list items under each day column.
 */
function MobileWeekContent({
  days,
  tasksByDate,
  invitesByDate,
  allDayByDate,
  timedByDate,
  onDayClick,
  onTaskClick,
}: {
  days: Date[];
  tasksByDate: Record<string, Task[]>;
  invitesByDate: Record<string, PendingInvite[]>;
  allDayByDate: Record<string, GCalEvent[]>;
  timedByDate: Record<string, GCalEvent[]>;
  onDayClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}) {
  const { colorTheme } = useTheme();
  const maxDots = 4;

  return (
    <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto">
      {days.map((day, i) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayTasks = tasksByDate[dateStr] ?? [];
        const dayInvites = invitesByDate[dateStr] ?? [];
        const allEvents = [...(allDayByDate[dateStr] ?? []), ...(timedByDate[dateStr] ?? [])];
        const isLastCol = i === 6;
        const totalItems = dayTasks.length + allEvents.length;
        return (
          <div
            key={dateStr}
            className={`${isLastCol ? "" : "border-r"} border-gray-300 dark:border-gray-600 p-1 flex flex-col gap-1.5 hover:bg-muted/30 transition-colors`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onDayClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
            }}
          >
            <div className="flex flex-col items-center justify-start pt-1 gap-1.5">
              {totalItems > 0 && (
                <div className="flex items-center justify-center gap-[3px] flex-wrap max-w-[36px]">
                  {dayTasks.slice(0, maxDots).map((task) => (
                    <span
                      key={task.id}
                      className={`w-[5px] h-[5px] rounded-full shrink-0 ${task.is_completed ? "opacity-40" : ""}`}
                      style={{ backgroundColor: getThemeColor(task.color, colorTheme) }}
                    />
                  ))}
                  {allEvents.slice(0, Math.max(0, maxDots - dayTasks.length)).map((event) => (
                    <span
                      key={event.id}
                      className="w-[5px] h-[5px] rounded-full shrink-0"
                      style={{
                        backgroundColor: "transparent",
                        border: `1.5px solid ${getEventColor(event.colorId, undefined, undefined, colorTheme)}`,
                      }}
                    />
                  ))}
                  {totalItems > maxDots && (
                    <span className="text-[8px] text-muted-foreground leading-none">+{totalItems - maxDots}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
