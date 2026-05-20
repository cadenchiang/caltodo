"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getRepeatLabel } from "@/lib/repeat";
import { getThemeColor } from "@/lib/constants";
import { getSourceBadges, getDueDateInfo } from "@/lib/task-utils";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, TaskUpdate } from "@/lib/types";
import TaskCreateModal from "./TaskCreateModal";
import TaskCheckbox from "./shared/TaskCheckbox";
import TaskDuplicatesBanner from "./TaskDuplicatesBanner";
import {
  TaskDateTimeLabel,
  TaskRepeatLabel,
  TaskCourseRow,
  TaskTagsRow,
  TaskDescriptionRow,
} from "./shared/TaskDetailRows";
import { ClipboardList, ExternalLink, Pencil } from "lucide-react";

interface TaskDetailPanelProps {
  /** The selected task, or null for empty state. */
  task: Task | null;
  /** Close/deselect callback. */
  onClose: () => void;
  /** Save changes callback with task ID and field updates. */
  onSave: (id: string, updates: TaskUpdate) => void;
  /** Optional delete callback with task ID. */
  onDelete?: (id: string) => void;
}

/**
 * Right-side read-only detail panel. Clicking the pencil opens
 * TaskCreateModal for editing. Checkbox toggles completion.
 *
 * @param task - The task being viewed, or null for empty state
 * @param onClose - Callback to deselect the task
 * @param onSave - Callback with the task ID and updated fields
 * @param onDelete - Optional callback to delete the task
 */
export default function TaskDetailPanel({ task, onClose, onSave, onDelete }: TaskDetailPanelProps) {
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => { setShowEditModal(false); }, [task?.id]);

  if (!task) {
    return (
      <div className="flex-1 h-full border-l border-border flex flex-col items-center justify-center p-5 pb-24 gap-3">
        {isMiffy ? (
          <img src="/miffy/miffy-snoopy.png" alt="" className="w-32 h-auto opacity-60 select-none pointer-events-none" draggable={false} />
        ) : (
          <img
            src="/empty-task-illustration.png"
            alt=""
            className="w-72 h-auto select-none pointer-events-none"
            draggable={false}
          />
        )}
        <p className="text-sm text-muted-foreground">Select a task to view details</p>
      </div>
    );
  }

  const dotColor = getThemeColor(task.color, colorTheme);
  // For overdue tasks the pill reads "Overdue N day(s)" (no clock time)
  // — matches the list/board view. Non-overdue tasks keep the long
  // "Mon, May 11, 2026" formatting that's nice in the wide panel.
  const dueInfo = getDueDateInfo(task.due_date, task.due_time);
  // Completed tasks never show "Overdue" or red — the check already
  // conveys done. They get the long neutral date instead.
  const isOverdue = !task.is_completed && !!dueInfo && dueInfo.dateLabel.startsWith("Overdue");
  const dateLabel = isOverdue
    ? dueInfo!.dateLabel
    : task.due_date
      ? format(new Date(task.due_date + "T00:00:00"), "EEE, MMM d, yyyy")
      : null;
  const timeLabel = isOverdue
    ? null
    : task.due_time
      ? format(new Date(`2000-01-01T${task.due_time}`), "h:mm a")
      : null;
  const urgencyClass = task.is_completed ? "text-muted-foreground" : dueInfo?.className;
  const repeatLabel = task.repeat_interval && task.repeat_unit
    ? getRepeatLabel(task.repeat_interval, task.repeat_unit)
    : null;

  const sourceBadges = getSourceBadges(task);
  const hasTags = sourceBadges.length > 0 || (task.tags && task.tags.length > 0);

  return (
    <div className="flex-1 h-full border-l border-border flex flex-col min-w-0">
      {/* Edit pencil sits in the top-right corner — opens the full
          TaskCreateModal in edit mode (same pattern the calendar
          preview popover uses). The panel itself is read-only-ish:
          the title supports inline rename for convenience, but other
          fields require opening the modal. */}
      <div className="shrink-0 flex items-center justify-end px-3 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-foreground/[0.05] transition-colors"
          aria-label="Edit task"
          title="Edit"
        >
          <Pencil size={15} strokeWidth={2.25} />
        </button>
      </div>

      {/* Static title section — title (inline-editable), date pill, repeat.
          Stays pinned at the top while the body below scrolls. */}
      <div className="shrink-0 px-6 pt-4 pb-4 border-b border-border min-w-0">
        <div className="flex items-start gap-4 min-w-0">
          <TaskCheckbox
            color={dotColor}
            isCompleted={task.is_completed}
            onToggle={() => onSave(task.id, { is_completed: !task.is_completed })}
            size="lg"
          />
          {/* contentEditable span — single click anywhere to edit, Enter or
              blur commits, Escape reverts. key={task.id} forces a remount
              when the user switches to a different task so the DOM text
              re-syncs with the new task.title. */}
          <span
            key={task.id}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            className="text-xl font-semibold text-foreground leading-snug break-words min-w-0 outline-none rounded-md px-1 -mx-1 focus:bg-accent/30 transition-colors"
            onBlur={(e) => {
              const next = (e.currentTarget.textContent ?? "").trim();
              if (next && next !== task.title) onSave(task.id, { title: next });
              else e.currentTarget.textContent = task.title;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              } else if (e.key === "Escape") {
                e.preventDefault();
                e.currentTarget.textContent = task.title;
                e.currentTarget.blur();
              }
            }}
          >
            {task.title}
          </span>
        </div>

        <TaskDateTimeLabel
          dateLabel={dateLabel}
          timeLabel={timeLabel}
          urgencyClassName={urgencyClass}
        />

        <TaskRepeatLabel repeatLabel={repeatLabel} />
      </div>

      {/* Scrollable body — everything below the title */}
      <div className="flex-1 overflow-auto px-6 pt-5 pb-6 min-w-0">
        {/* Open Assignment — surfaced at the top of the body when the task
            has a source URL. Uses the same row layout as the rows below
            (20px icon column + gap-4 + content) so the icon and label
            line up perfectly with TaskCourseRow / TaskTagsRow / etc. */}
        {task.source_url && (
          <div className="flex items-center gap-4 py-3 min-w-0">
            <div className="shrink-0 w-5 flex items-center justify-center">
              <ExternalLink size={20} className="text-muted-foreground" />
            </div>
            <a
              href={task.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline truncate transition-colors"
            >
              Open assignment
            </a>
          </div>
        )}

        {/* Course name row */}
        <TaskCourseRow courseName={task.course_name} />

        {/* Tags row */}
        {hasTags && (
          <TaskTagsRow
            tags={task.tags ?? []}
            sourceBadges={sourceBadges}
          />
        )}

        {/* Description row */}
        <TaskDescriptionRow description={task.description} />

        {/* Duplicate-assignment merge banner (renders nothing when no dupes) */}
        <TaskDuplicatesBanner task={task} />
      </div>

      {/* Edit modal */}
      <TaskCreateModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onAdd={() => {}}
        editTask={task}
        onSave={(id, updates) => {
          onSave(id, updates);
          setShowEditModal(false);
        }}
        onDelete={onDelete ? (id) => {
          onDelete(id);
          setShowEditModal(false);
          onClose();
        } : undefined}
      />
    </div>
  );
}
