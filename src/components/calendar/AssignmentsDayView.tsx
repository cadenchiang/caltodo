"use client";

import { format, isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import type { Task, PendingInvite } from "@/lib/types";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import CalendarTaskBar from "./CalendarTaskBar";

interface AssignmentsDayViewProps {
  currentDate: Date;
  tasks: Task[];
  pendingInvites?: PendingInvite[];
  onAddClick: (date: string, rect: DOMRect) => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
  /** ID of the task whose popover is currently open (stays highlighted). */
  activeTaskId?: string | null;
}

/**
 * Day view for assignments mode: a single full-width column that mirrors the
 * week view's per-column chrome — the same weekday + date header (today shown
 * in a blue circle), the same task-bar list, and double-click-to-add — so Day,
 * Week, and Month read as one consistent calendar surface.
 *
 * @param currentDate - The date to display
 * @param tasks - All tasks (filtered by date internally)
 * @param pendingInvites - Pending task invites
 * @param onAddClick - Callback to open add-task popover
 * @param onTaskClick - Callback to open task edit popover
 */
export default function AssignmentsDayView({
  currentDate,
  tasks,
  pendingInvites = [],
  onAddClick,
  onTaskClick,
  activeTaskId,
}: AssignmentsDayViewProps) {
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const dayTasks = tasks.filter((t) => t.due_date === dateStr);
  const dayInvites = pendingInvites.filter((inv) => inv.taskDueDate === dateStr);
  const isToday = isSameDay(currentDate, new Date());
  const isEmpty = dayTasks.length === 0 && dayInvites.length === 0;

  return (
    <div className="bg-card flex flex-col h-full overflow-hidden">
      {/* Day header — identical treatment to a week-view column header. */}
      <div className="relative flex flex-col items-center py-2 md:py-2.5 gap-0.5 border-b border-gray-200 dark:border-gray-800">
        <span
          className={`text-[9px] md:text-[11px] font-semibold uppercase ${
            isToday ? "text-[#0e89d6]" : "text-foreground/60"
          }`}
        >
          {format(currentDate, "EEE")}
        </span>
        <span
          className={`text-sm md:text-lg font-semibold inline-flex items-center justify-center ${
            isToday
              ? "w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#0e89d6] text-white"
              : "text-foreground"
          }`}
        >
          {format(currentDate, "d")}
        </span>
        {/* Subtle add button — matches the toolbar icon style, not a heavy
            floating circle. */}
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onAddClick(dateStr, new DOMRect(rect.left, rect.bottom + 4, rect.width, 1));
          }}
          className="absolute top-1.5 right-2 md:top-2 md:right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
          aria-label="Add assignment"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Task list — double-click to add, mirroring the week view columns. */}
      <div
        className="flex-1 overflow-y-auto p-2 md:p-3"
        onDoubleClick={(e) => {
          const rect = new DOMRect(e.clientX - 40, e.clientY, 80, 1);
          onAddClick(dateStr, rect);
        }}
      >
        <div className="flex flex-col gap-0.5 w-full max-w-xl mx-auto">
          {isEmpty && (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No assignments for this day
            </p>
          )}
          {dayTasks.map((task) => (
            <CalendarTaskBar key={task.id} task={task} onClick={onTaskClick} isActive={task.id === activeTaskId} />
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
      </div>
    </div>
  );
}
