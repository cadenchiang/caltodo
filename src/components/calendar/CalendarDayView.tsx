"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import type { Task, PendingInvite, GCalEvent } from "@/lib/types";
import { getEventDateKey } from "@/lib/gcal/event-utils";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import CalendarTaskBar from "./CalendarTaskBar";
import CalendarGCalItem from "./CalendarGCalItem";
import TimeGrid from "./TimeGrid";

interface CalendarDayViewProps {
  currentDate: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  gcalEvents?: GCalEvent[];
  /** Map of calendarId → backgroundColor from Google. */
  calendarColors?: Record<string, string>;
  onAddClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  onEventCreate?: (date: string, startTime: string, endTime: string) => void;
  /** Incremented when create modal closes, to animate-out the preview block. */
  clearPreviewSignal?: number;
}

/**
 * Single-day view with task bars at top (all-day section),
 * then a scrollable time grid for timed GCal events below.
 *
 * @param currentDate - The date to display
 * @param tasks - All tasks (filtered by date in this component)
 * @param gcalEvents - Google Calendar events for the view range
 * @param onAddClick - Callback to open add-task popover
 * @param onTaskClick - Callback to open task edit popover
 */
export default function CalendarDayView({
  currentDate,
  tasks,
  pendingInvites = [],
  gcalEvents = [],
  calendarColors = {},
  onAddClick,
  onTaskClick,
  onEventCreate,
  clearPreviewSignal,
}: CalendarDayViewProps) {
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const dayTasks = tasks.filter((t) => t.due_date === dateStr);
  const dayInvites = pendingInvites.filter((inv) => inv.taskDueDate === dateStr);

  // Split GCal events for this day
  const { allDayEvents, timedEvents } = useMemo(() => {
    const allDay: GCalEvent[] = [];
    const timed: GCalEvent[] = [];
    for (const event of gcalEvents) {
      const eventDate = getEventDateKey(event.start);
      if (eventDate !== dateStr) continue;
      if (event.allDay) {
        allDay.push(event);
      } else {
        timed.push(event);
      }
    }
    return { allDayEvents: allDay, timedEvents: timed };
  }, [gcalEvents, dateStr]);

  const hasAllDayContent = dayTasks.length > 0 || dayInvites.length > 0 || allDayEvents.length > 0;

  // Build time grid column
  const timeGridColumns = useMemo(() => [{
    events: timedEvents,
    calendarColors,
  }], [timedEvents, calendarColors]);

  return (
    <div className="overflow-hidden bg-card flex flex-col h-full relative">
      {/* All-day section: task bars + all-day GCal events */}
      {hasAllDayContent && (
        <div className="shrink-0 border-b border-gray-300 dark:border-gray-500 p-3 md:p-4">
          <div className="flex flex-col gap-1 max-w-xl">
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
            {allDayEvents.map((event) => (
              <CalendarGCalItem key={event.id} event={event} calendarColor={calendarColors[event.calendarId ?? ""]} />
            ))}
          </div>
        </div>
      )}

      {/* Always show time grid with hour lines */}
      <TimeGrid
        columns={timeGridColumns}
        columnDates={[dateStr]}
        rowHeight={48}
        showCurrentTime={true}
        onTimeDoubleClick={onEventCreate ? (date, hour, minute) => {
          const start = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          const endH = hour + 1;
          const end = `${String(endH).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          onEventCreate(date, start, end);
        } : undefined}
        clearPreviewSignal={clearPreviewSignal}
      />
    </div>
  );
}
