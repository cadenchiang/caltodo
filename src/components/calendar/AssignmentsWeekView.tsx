"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import type { Task, PendingInvite } from "@/lib/types";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import CalendarTaskBar from "./CalendarTaskBar";

interface AssignmentsWeekViewProps {
  currentDate: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  onDayClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}

/**
 * Week view for assignments mode: task-only columns with no time grid.
 * Shows task bars flowing vertically per day. Double-click to add.
 *
 * @param currentDate - Any date within the target week
 * @param tasks - All tasks for the week
 * @param pendingInvites - Pending task invites
 * @param onDayClick - Handler for adding tasks (double-click)
 * @param onTaskClick - Click handler for editing tasks
 */
export default function AssignmentsWeekView({
  currentDate,
  tasks,
  pendingInvites = [],
  onDayClick,
  onTaskClick,
}: AssignmentsWeekViewProps) {
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

  return (
    <div className="bg-white dark:bg-[#141414] flex flex-col h-full overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-7 shrink-0 bg-white dark:bg-[#141414]">
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

      {/* Task columns */}
      <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto border-t border-gray-200 dark:border-gray-800">
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate[dateStr] ?? [];
          const dayInvites = invitesByDate[dateStr] ?? [];
          const isLastCol = i === 6;
          return (
            <div
              key={dateStr}
              className={`${isLastCol ? "" : "border-r"} border-gray-200 dark:border-gray-800 p-1 flex flex-col gap-0.5`}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
