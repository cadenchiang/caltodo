"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink } from "lucide-react";
import { getRepeatLabel } from "@/lib/repeat";
import { getThemeColor } from "@/lib/constants";
import { getDetailDateInfo } from "@/lib/task-utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useTaskContext } from "@/contexts/TaskContext";
import { MODAL_BACKDROP } from "@/components/ui/Modal";
import { useDialog } from "@/components/ui/useDialog";
import type { Task } from "@/lib/types";
import TaskCheckbox from "./shared/TaskCheckbox";
import TaskActionBar from "./shared/TaskActionBar";
import { TaskDateTimeLabel, TaskRepeatLabel, TaskCourseRow, TaskTagsRow, TaskDescriptionRow } from "./shared/TaskDetailRows";

/** Width of the popover in pixels (desktop). */
const POPOVER_WIDTH = 448;
/** Maximum height before the body scrolls (desktop). */
const POPOVER_MAX_HEIGHT = 520;
/** Gap between anchor and popover edge. */
const GAP = 6;

interface TaskPreviewPopoverProps {
  /** The task to display in the preview. */
  task: Task;
  /** Bounding rect of the clicked element, used for positioning. */
  anchorRect: DOMRect;
  /** Called when the popover should close. */
  onClose: () => void;
  /** Called when the user opens the full edit modal. */
  onEdit: (task: Task) => void;
  /** Called when the user deletes the task. */
  onDelete: (id: string) => void;
  /** Called when the user toggles the completion checkbox. */
  onToggle: (id: string) => void;
}

/**
 * Task preview beside a clicked card or row: a dialog with a focus trap,
 * Escape and focus restore (useDialog), positioned next to the anchor on
 * desktop and as a bottom sheet with a real backdrop on phones. The date
 * uses the same relative wording as the detail panel.
 *
 * @param task - Task data to display
 * @param anchorRect - DOMRect of the clicked element for positioning
 * @param onClose - Close handler
 * @param onEdit - Opens the full editor
 * @param onDelete - Deletes the task (single click; the toast has Undo)
 * @param onToggle - Toggles completion
 */
export default function TaskPreviewPopover({ task, anchorRect, onClose, onEdit, onDelete, onToggle }: TaskPreviewPopoverProps) {
  const { colorTheme } = useTheme();
  const { snoozeTask } = useTaskContext();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const { containerRef, handleBackdropClick } = useDialog({ open: true, onClose, closeOnBackdrop: true });
  // Desktop has no backdrop, so an outside click closes it directly (no
  // exit delay, so clicking another card can open its preview at once).
  // Clicks inside the portaled action menu are not "outside".
  const outsideRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (isMobile) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = ("touches" in e ? e.touches[0]?.target : e.target) as Element | null;
      if (!target || !outsideRef.current) return;
      if (outsideRef.current.contains(target) || target.closest('[role="menu"]')) return;
      onClose();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [isMobile, onClose]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  /** Places the popover beside the anchor (toward the viewport centre) and clamps it. */
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || isMobile) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    let left = anchorCenterX < vw / 2 ? anchorRect.right + GAP : anchorRect.left - POPOVER_WIDTH - GAP;
    left = Math.max(GAP, Math.min(left, vw - POPOVER_WIDTH - GAP));
    let top = anchorRect.top;
    if (top + el.scrollHeight > vh - GAP) top = vh - el.scrollHeight - GAP;
    setPos({ left, top: Math.max(GAP, top) });
  }, [anchorRect, containerRef, isMobile]);

  const dotColor = getThemeColor(task.color, colorTheme);
  // Same wording as the detail panel: relative for near dates with the
  // calendar date beside it, the long date form further out.
  const dueInfo = getDetailDateInfo(task.due_date, task.due_time, !!task.is_completed);
  const repeatLabel = task.repeat_interval && task.repeat_unit ? getRepeatLabel(task.repeat_interval, task.repeat_unit) : null;

  return createPortal(
    <div className={`fixed inset-0 z-overlay ${isMobile ? "flex items-end" : "pointer-events-none"}`}>
      {isMobile && <div className={MODAL_BACKDROP} onClick={handleBackdropClick} aria-hidden="true" />}
      <div
        ref={(node) => {
          containerRef.current = node;
          outsideRef.current = node;
        }}
        role="dialog"
        aria-modal={isMobile ? "true" : undefined}
        aria-label={`Preview: ${task.title}`}
        tabIndex={-1}
        data-task-preview-popover
        className={`pointer-events-auto bg-popover border border-border shadow-2xl transition-[opacity,transform] duration-150 ease-out focus:outline-none overflow-y-auto ${
          isMobile ? "relative w-full rounded-t-2xl max-h-[70vh]" : "fixed rounded-2xl"
        } ${visible ? "opacity-100 translate-y-0 scale-100" : isMobile ? "opacity-0 translate-y-4" : "opacity-0 scale-95"}`}
        style={isMobile ? undefined : { left: pos.left, top: pos.top, width: POPOVER_WIDTH, maxHeight: POPOVER_MAX_HEIGHT }}
      >
        <TaskActionBar
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
          onSnooze={(hours) => { snoozeTask(task.id, hours); onClose(); }}
          onClose={onClose}
          sourceUrl={task.source_url}
        />

        <div className="px-6 pb-6">
          <div className="flex items-start gap-4">
            <TaskCheckbox color={dotColor} isCompleted={task.is_completed} onToggle={() => onToggle(task.id)} size="lg" />
            <span className="text-xl font-semibold text-foreground leading-snug break-words min-w-0">{task.title}</span>
          </div>

          <button type="button" onClick={() => onEdit(task)} className="block text-left hover:opacity-80 transition-opacity rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Edit date and time">
            <TaskDateTimeLabel
              dateLabel={dueInfo?.dateLabel ?? null}
              exactDate={dueInfo?.exactDate ?? null}
              timeLabel={dueInfo?.timeLabel ?? null}
              urgencyClassName={dueInfo?.className}
            />
          </button>

          <TaskRepeatLabel repeatLabel={repeatLabel} />

          <div className="border-t border-border my-5" />

          {task.source_url && (
            <div className="flex items-start gap-4 py-3 min-w-0">
              <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                <ExternalLink size={16} className="text-muted-foreground" />
              </div>
              <a href={task.source_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline truncate transition-colors">
                Open assignment
              </a>
            </div>
          )}

          <TaskCourseRow courseName={task.course_name} />
          <TaskTagsRow tags={task.tags ?? []} />
          <TaskDescriptionRow description={task.description} lineClamp={3} />
        </div>
      </div>
    </div>,
    document.body
  );
}
