"use client";

/**
 * Modal that lists newly synced assignments.
 * Triggered via a "new-assignments-detected" custom DOM event from TaskContext.
 * Shows assignment titles, course names, due dates, and source platform.
 *
 * @module NewAssignmentsModal
 */

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";

/** Custom event detail shape dispatched from TaskContext. */
interface NewAssignmentsEventDetail {
  taskIds: string[];
}

/** Name of the custom DOM event. */
export const NEW_ASSIGNMENTS_EVENT = "new-assignments-detected";

/**
 * Dispatches a custom event to open the new assignments modal.
 *
 * @param taskIds - Array of task IDs to display
 */
export function showNewAssignmentsModal(taskIds: string[]): void {
  window.dispatchEvent(
    new CustomEvent<NewAssignmentsEventDetail>(NEW_ASSIGNMENTS_EVENT, {
      detail: { taskIds },
    })
  );
}

export default function NewAssignmentsModal() {
  const { tasks } = useTaskContext();
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const open = taskIds.length > 0;

  useEffect(() => {
    function handleEvent(e: Event) {
      const detail = (e as CustomEvent<NewAssignmentsEventDetail>).detail;
      if (detail.taskIds.length > 0) {
        setTaskIds(detail.taskIds);
      }
    }
    window.addEventListener(NEW_ASSIGNMENTS_EVENT, handleEvent);
    return () => window.removeEventListener(NEW_ASSIGNMENTS_EVENT, handleEvent);
  }, []);

  const handleClose = useCallback(() => setTaskIds([]), []);

  if (!open || typeof document === "undefined") return null;

  const newTasks = taskIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter(Boolean);

  /**
   * Formats a due date string into a short readable format.
   *
   * @param dateStr - ISO date string or null
   * @returns Formatted date like "Mar 5" or "No due date"
   */
  function formatDue(dateStr: string | null): string {
    if (!dateStr) return "No due date";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  /** Maps source to a display label. */
  function sourceLabel(source: string | null): string {
    if (source === "canvas") return "Canvas";
    if (source === "gradescope") return "Gradescope";
    if (source === "pensieve") return "Pensive";
    return "";
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={handleClose}
      />

      {/* Card */}
      <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full w-[calc(100%-2rem)] max-w-md animate-announce-card-in overflow-hidden max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            {newTasks.length} New Assignment{newTasks.length !== 1 ? "s" : ""}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <ul className="flex-1 overflow-y-auto divide-y divide-border">
          {newTasks.map((task) => (
            <li key={task!.id} className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {task!.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task!.course_name && (
                    <span className="text-xs text-muted-foreground truncate">
                      {task!.course_name}
                    </span>
                  )}
                  {task!.source && (
                    <span className="text-[10px] text-muted-foreground/60">
                      {sourceLabel(task!.source)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatDue(task!.due_date)}
                </span>
                {task!.source_url && (
                  <a
                    href={task!.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-border shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
