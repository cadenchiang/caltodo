"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
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
  onAddClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  onEventCreate?: (date: string, startTime: string, endTime: string) => void;
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
  onAddClick,
  onTaskClick,
  onEventCreate,
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
  }], [timedEvents]);

  return (
    <div className="overflow-hidden bg-white dark:bg-[#141414] flex flex-col h-full relative">
      {/* + icon top right */}
      <button
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onAddClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
        }}
        className="absolute top-2 right-3 md:top-3 md:right-4 z-10 w-9 h-9 md:w-8 md:h-8 rounded-full bg-gray-800 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center hover:opacity-80 active:scale-95 transition-all shadow-sm"
      >
        <Plus size={18} />
      </button>

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
              <CalendarGCalItem key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Always show time grid with hour lines */}
      <TimeGrid
        columns={timeGridColumns}
        columnDates={[dateStr]}
        rowHeight={60}
        showCurrentTime={true}
        onTimeDoubleClick={onEventCreate ? (date, hour, minute) => {
          const start = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          const endH = hour + 1;
          const end = `${String(endH).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          onEventCreate(date, start, end);
        } : undefined}
      />
    </div>
  );
}
