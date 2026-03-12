"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getRepeatLabel } from "@/lib/repeat";
import { getThemeColor } from "@/lib/constants";
import { getSourceBadges } from "@/lib/task-utils";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, TaskUpdate } from "@/lib/types";
import TaskCreateModal from "./TaskCreateModal";
import TaskCheckbox from "./shared/TaskCheckbox";
import TaskActionBar from "./shared/TaskActionBar";
import {
  TaskDateTimeLabel,
  TaskRepeatLabel,
  TaskCourseRow,
  TaskTagsRow,
  TaskDescriptionRow,
} from "./shared/TaskDetailRows";
import { ClipboardList } from "lucide-react";

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
      <div className="flex-1 h-full border-l border-border flex flex-col items-center justify-center p-5 gap-3">
        {isMiffy ? (
          <img src="/miffy/miffy-snoopy.png" alt="" className="w-32 h-auto opacity-60 select-none pointer-events-none" draggable={false} />
        ) : (
          <ClipboardList size={48} strokeWidth={1.2} className="text-muted-foreground/30" />
        )}
        <p className="text-sm text-muted-foreground">Select a task to view details</p>
      </div>
    );
  }

  const dotColor = getThemeColor(task.color, colorTheme);
  const dateLabel = task.due_date
    ? format(new Date(task.due_date + "T00:00:00"), "EEE, MMM d, yyyy")
    : null;
  const timeLabel = task.due_time
    ? format(new Date(`2000-01-01T${task.due_time}`), "h:mm a")
    : null;
  const repeatLabel = task.repeat_interval && task.repeat_unit
    ? getRepeatLabel(task.repeat_interval, task.repeat_unit)
    : null;

  const sourceBadges = getSourceBadges(task);
  const hasTags = sourceBadges.length > 0 || (task.tags && task.tags.length > 0);

  return (
    <div className="flex-1 h-full border-l border-border flex flex-col min-w-0">
      {/* Header */}
      <TaskActionBar
        onEdit={() => setShowEditModal(true)}
        onDelete={onDelete ? () => { onDelete(task.id); onClose(); } : undefined}
        onClose={onClose}
        sourceUrl={task.source_url}
      />

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto px-6 pb-6 min-w-0">
        {/* Title row: checkbox + title */}
        <div className="flex items-start gap-4 min-w-0">
          <TaskCheckbox
            color={dotColor}
            isCompleted={task.is_completed}
            onToggle={() => onSave(task.id, { is_completed: !task.is_completed })}
            size="lg"
          />
          <span className="text-xl font-semibold text-foreground leading-snug break-words min-w-0">
            {task.title}
          </span>
        </div>

        {/* Date + Time under title */}
        <TaskDateTimeLabel dateLabel={dateLabel} timeLabel={timeLabel} />

        {/* Repeat label under date */}
        <TaskRepeatLabel repeatLabel={repeatLabel} />

        {/* Divider */}
        <div className="border-t border-border my-5" />

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
