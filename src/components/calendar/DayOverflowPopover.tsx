"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import type { Task, PendingInvite, GCalEvent } from "@/lib/types";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import CalendarTaskBar from "./CalendarTaskBar";
import CalendarGCalItem from "./CalendarGCalItem";

interface DayOverflowPopoverProps {
  date: string;
  tasks: Task[];
  pendingInvites: PendingInvite[];
  gcalEvents: GCalEvent[];
  anchorRect: DOMRect;
  onClose: () => void;
  onTaskClick: (task: Task, rect: DOMRect) => void;
}

/**
 * Floating popover showing all tasks and events for a day.
 * Appears when the user clicks "+N more" in a month cell.
 *
 * @param date - The date string (YYYY-MM-DD) for the day
 * @param tasks - All tasks for this day
 * @param pendingInvites - Pending invites for this day
 * @param gcalEvents - GCal events for this day
 * @param anchorRect - Bounding rect to position the popover near
 * @param onClose - Callback to close the popover
 * @param onTaskClick - Callback when a task is clicked
 */
export default function DayOverflowPopover({
  date,
  tasks,
  pendingInvites,
  gcalEvents,
  anchorRect,
  onClose,
  onTaskClick,
}: DayOverflowPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        // Don't close if click landed inside a task preview popover
        const preview = document.querySelector("[data-task-preview-popover]");
        if (preview && preview.contains(target)) return;
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // Position: try to place to the right of the anchor, fallback left
  const popoverWidth = 260;
  const popoverMaxHeight = 340;
  const gap = 8;
  let left = anchorRect.right + gap;
  let top = anchorRect.top;

  // If it would overflow the right edge, place to the left
  if (left + popoverWidth > window.innerWidth - 16) {
    left = anchorRect.left - popoverWidth - gap;
  }
  // If it would overflow the left edge, center horizontally on anchor
  if (left < 16) {
    left = Math.max(16, anchorRect.left + anchorRect.width / 2 - popoverWidth / 2);
  }
  // Clamp vertical position
  if (top + popoverMaxHeight > window.innerHeight - 16) {
    top = Math.max(16, window.innerHeight - popoverMaxHeight - 16);
  }

  const parsed = new Date(date + "T00:00:00");
  const title = format(parsed, "EEEE, MMMM d");

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-50 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-card overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{ left, top, width: popoverWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700/50">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Items list */}
      <div className="p-2 flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: popoverMaxHeight - 40 }}>
        {tasks.map((task) => (
          <CalendarTaskBar key={task.id} task={task} onClick={onTaskClick} />
        ))}
        {pendingInvites.map((invite) => (
          <CalendarTaskBar
            key={invite.shareId}
            task={pendingInviteToPseudoTask(invite)}
            onClick={() => {}}
            isPending
          />
        ))}
        {gcalEvents.map((event) => (
          <CalendarGCalItem key={event.id} event={event} />
        ))}
      </div>
    </div>,
    document.body
  );
}
