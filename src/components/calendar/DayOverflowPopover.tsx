"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import type { Task, PendingInvite, GCalEvent } from "@/lib/types";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useDialog } from "@/components/ui/useDialog";
import { MODAL_BACKDROP } from "@/components/ui/Modal";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
import { ACTIONS } from "@/lib/copy";
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
  /** Adds a task on this day (shown as a button on phones). */
  onAdd?: (date: string, rect: DOMRect) => void;
  /** ID of the task whose popover is currently open (stays highlighted). */
  activeTaskId?: string | null;
}

/** Desktop panel size. */
const POPOVER_WIDTH = 260;
const POPOVER_MAX_HEIGHT = 340;
const GAP = 8;

/**
 * Computes the desktop position beside a cell, flipping left when there is
 * no room on the right and clamping to the viewport.
 *
 * @param anchor - The cell's rect
 * @param viewport - Window size
 * @returns Fixed left/top
 */
export function computeOverflowPosition(anchor: { left: number; right: number; top: number; width: number }, viewport: { width: number; height: number }): { left: number; top: number } {
  let left = anchor.right + GAP;
  if (left + POPOVER_WIDTH > viewport.width - 16) left = anchor.left - POPOVER_WIDTH - GAP;
  if (left < 16) left = Math.max(16, anchor.left + anchor.width / 2 - POPOVER_WIDTH / 2);
  let top = anchor.top;
  if (top + POPOVER_MAX_HEIGHT > viewport.height - 16) top = Math.max(16, viewport.height - POPOVER_MAX_HEIGHT - 16);
  return { left, top };
}

/**
 * Everything on one day. Opens from "N more" in a month cell on desktop
 * (a dialog beside the cell) and from a tap on the day on phones (a bottom
 * sheet with a real backdrop and an Add button). Built on useDialog for
 * the focus trap, Escape and focus restore.
 *
 * @param date - The day (YYYY-MM-DD)
 * @param onAdd - Adds a task on this day
 */
export default function DayOverflowPopover({ date, tasks, pendingInvites, gcalEvents, anchorRect, onClose, onTaskClick, onAdd, activeTaskId }: DayOverflowPopoverProps) {
  const isMobile = useIsMobile();
  const { containerRef, handleBackdropClick } = useDialog({ open: true, onClose, closeOnBackdrop: true });

  // Desktop has no backdrop: close on an outside click, except inside the
  // task preview this list opens.
  useEffect(() => {
    if (isMobile) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (document.querySelector("[data-task-preview-popover]")?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, isMobile, containerRef]);

  const pos = isMobile ? null : computeOverflowPosition(anchorRect, { width: window.innerWidth, height: window.innerHeight });
  const title = format(new Date(date + "T00:00:00"), "EEEE, MMMM d");
  const isEmpty = tasks.length === 0 && pendingInvites.length === 0 && gcalEvents.length === 0;

  return createPortal(
    <div className={`fixed inset-0 z-overlay ${isMobile ? "flex items-end" : "pointer-events-none"}`}>
      {isMobile && <div className={MODAL_BACKDROP} onClick={handleBackdropClick} aria-hidden="true" />}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal={isMobile ? "true" : undefined}
        aria-label={title}
        tabIndex={-1}
        className={`pointer-events-auto bg-popover border border-border shadow-xl overflow-hidden animate-popover-in focus:outline-none ${
          isMobile ? "relative w-full rounded-t-2xl max-h-[70vh] flex flex-col pb-[env(safe-area-inset-bottom,0px)]" : "fixed rounded-xl"
        }`}
        style={pos ? { left: pos.left, top: pos.top, width: POPOVER_WIDTH } : undefined}
      >
        <div className="flex items-center justify-between pl-3 pr-2 py-2 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <IconButton size="sm" aria-label={ACTIONS.close} onClick={onClose}>
            <X size={14} />
          </IconButton>
        </div>

        <div className="p-2 flex flex-col gap-0.5 overflow-y-auto" style={isMobile ? undefined : { maxHeight: POPOVER_MAX_HEIGHT - 40 }}>
          {isEmpty && <p className="text-sm text-muted-foreground text-center py-6">Nothing due this day</p>}
          {tasks.map((task) => (
            <CalendarTaskBar key={task.id} task={task} onClick={onTaskClick} isActive={task.id === activeTaskId} />
          ))}
          {pendingInvites.map((invite) => (
            <CalendarTaskBar key={invite.shareId} task={pendingInviteToPseudoTask(invite)} onClick={() => {}} isPending />
          ))}
          {gcalEvents.map((event) => (
            <CalendarGCalItem key={event.id} event={event} />
          ))}
        </div>

        {onAdd && (
          <div className="p-2 border-t border-border">
            <Button
              variant="secondary"
              className="w-full min-h-11"
              leadingIcon={<Plus size={14} />}
              onClick={() => {
                onClose();
                onAdd(date, anchorRect);
              }}
            >
              Add task
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
