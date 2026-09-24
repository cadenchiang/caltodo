"use client";

/**
 * Modal that lists tasks a sync just pulled in.
 * Triggered via a "new-assignments-detected" custom DOM event from TaskContext.
 * Shows titles, class names, due dates and the platform each came from.
 *
 * @module NewAssignmentsModal
 */

import { useState, useEffect, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import DueDatePill from "@/components/ui/DueDatePill";
import { providerLabel } from "@/lib/copy";

/** Custom event detail shape dispatched from TaskContext. */
interface NewAssignmentsEventDetail {
  taskIds: string[];
}

/** Name of the custom DOM event. */
export const NEW_ASSIGNMENTS_EVENT = "new-assignments-detected";

/**
 * Dispatches a custom event to open the new tasks modal.
 *
 * @param taskIds - Array of task IDs to display
 */
export function showNewAssignmentsModal(taskIds: string[]): void {
  window.dispatchEvent(new CustomEvent<NewAssignmentsEventDetail>(NEW_ASSIGNMENTS_EVENT, { detail: { taskIds } }));
}

/**
 * Lists the tasks named by the last "new-assignments-detected" event.
 * Built on Modal (dialog role, focus trap, Escape, scroll lock). Due dates
 * use the shared DueDatePill so the wording matches the inbox.
 */
export default function NewAssignmentsModal() {
  const { tasks } = useTaskContext();
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const open = taskIds.length > 0;

  useEffect(() => {
    function handleEvent(e: Event) {
      const detail = (e as CustomEvent<NewAssignmentsEventDetail>).detail;
      if (detail.taskIds.length > 0) setTaskIds(detail.taskIds);
    }
    window.addEventListener(NEW_ASSIGNMENTS_EVENT, handleEvent);
    return () => window.removeEventListener(NEW_ASSIGNMENTS_EVENT, handleEvent);
  }, []);

  const handleClose = useCallback(() => setTaskIds([]), []);

  const newTasks = taskIds.map((id) => tasks.find((t) => t.id === id)).filter((t) => t !== undefined);
  const title = `${newTasks.length} new ${newTasks.length === 1 ? "task" : "tasks"}`;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      bodyClassName="-mx-6"
      footer={<Button onClick={handleClose}>Got it</Button>}
    >
      <ul className="divide-y divide-border">
        {newTasks.map((task) => (
          <li key={task.id} className="px-6 py-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.course_name && <span className="text-xs text-muted-foreground truncate">{task.course_name}</span>}
                {task.source && <span className="text-3xs text-muted-foreground">{providerLabel(task.source)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {task.due_date ? (
                <DueDatePill dueDate={task.due_date} dueTime={task.due_time} isCompleted={task.is_completed} />
              ) : (
                <span className="text-2xs text-muted-foreground">No due date</span>
              )}
              {task.source_url && (
                <a
                  href={task.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${task.title} on ${providerLabel(task.source ?? "")}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
