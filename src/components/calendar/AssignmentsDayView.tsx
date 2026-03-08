"use client";

import { format } from "date-fns";
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
}

/**
 * Day view for assignments mode: scrollable task list with no time grid.
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
}: AssignmentsDayViewProps) {
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const dayTasks = tasks.filter((t) => t.due_date === dateStr);
  const dayInvites = pendingInvites.filter((inv) => inv.taskDueDate === dateStr);

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

      {/* Scrollable task list */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="flex flex-col gap-1 max-w-xl">
          {dayTasks.length === 0 && dayInvites.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No assignments for this day
            </p>
          )}
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
      </div>
    </div>
  );
}
