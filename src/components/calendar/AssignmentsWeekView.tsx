"use client";

import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import { Plus } from "lucide-react";
import { useWeekStart } from "@/hooks/useWeekStart";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { Task, PendingInvite } from "@/lib/types";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import IconButton from "@/components/ui/IconButton";
import CalendarTaskBar from "./CalendarTaskBar";

interface AssignmentsWeekViewProps {
  currentDate: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  onDayClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  /** ID of the task whose popover is currently open (stays highlighted). */
  activeTaskId?: string | null;
}

/**
 * Groups items by their due date.
 *
 * @param items - Items with a date field
 * @param key - Reads the date from an item
 * @returns Map of YYYY-MM-DD to items
 */
function groupByDay<T>(items: T[], key: (item: T) => string | null): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    (out[k] ??= []).push(item);
  }
  return out;
}

/**
 * Week view for assignments mode. From md up: seven columns with the task
 * bars flowing down each day (double-click to add). Below md: a stacked
 * agenda, one section per day with an add button, since 51px columns
 * cannot show a title.
 *
 * @param currentDate - Any date within the target week
 * @param tasks - All tasks for the week
 * @param onDayClick - Adds a task on a day
 * @param onTaskClick - Opens a task
 */
export default function AssignmentsWeekView({ currentDate, tasks, pendingInvites = [], onDayClick, onTaskClick, activeTaskId }: AssignmentsWeekViewProps) {
  const weekStartsOnPref = useWeekStart();
  const isMobile = useIsMobile();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: weekStartsOnPref });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const tasksByDate = groupByDay(tasks, (t) => t.due_date);
  const invitesByDate = groupByDay(pendingInvites, (i) => i.taskDueDate);

  /** Bars for one day. */
  const renderDay = (dateStr: string) => (
    <>
      {(tasksByDate[dateStr] ?? []).map((task) => (
        <CalendarTaskBar key={task.id} task={task} onClick={onTaskClick} isActive={task.id === activeTaskId} />
      ))}
      {(invitesByDate[dateStr] ?? []).map((invite) => (
        <CalendarTaskBar key={invite.shareId} task={pendingInviteToPseudoTask(invite)} onClick={() => {}} isPending />
      ))}
    </>
  );

  if (isMobile) {
    return (
      <div className="bg-card flex flex-col h-full overflow-y-auto">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, new Date());
          const count = (tasksByDate[dateStr]?.length ?? 0) + (invitesByDate[dateStr]?.length ?? 0);
          return (
            <section key={dateStr} aria-label={format(day, "EEEE, MMMM d")} className="border-b border-border px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold ${isToday ? "bg-blue-500 text-white" : "text-foreground"}`}>
                  {format(day, "d")}
                </span>
                <span className={`text-xs font-medium ${isToday ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>{format(day, "EEEE")}</span>
                <IconButton
                  size="sm"
                  aria-label={`Add task on ${format(day, "MMMM d")}`}
                  className="ml-auto"
                  onClick={(e) => onDayClick(dateStr, e.currentTarget.getBoundingClientRect())}
                >
                  <Plus size={14} />
                </IconButton>
              </div>
              <div className="flex flex-col gap-0.5">
                {count === 0 ? <p className="text-xs text-muted-foreground py-1">Nothing due</p> : renderDay(dateStr)}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-card flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto">
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={dateStr}
              className={`${i === 6 ? "" : "border-r"} border-border p-1 flex flex-col gap-0.5`}
              onDoubleClick={(e) => onDayClick(dateStr, new DOMRect(e.clientX - 40, e.clientY, 80, 1))}
            >
              <div className="flex flex-col items-center py-2.5 gap-0.5">
                <span className={`text-2xs font-medium ${isToday ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>{format(day, "EEE")}</span>
                <span className={`text-lg font-semibold inline-flex items-center justify-center ${isToday ? "w-8 h-8 rounded-full bg-blue-500 text-white" : "text-foreground"}`}>
                  {format(day, "d")}
                </span>
              </div>
              {renderDay(dateStr)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
