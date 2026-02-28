"use client";

import { useState, useEffect } from "react";
import {
  Pencil, Trash2, X, Tag, AlignLeft, BookOpen, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { getRepeatLabel } from "@/lib/repeat";
import { getMiffyColor } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, TaskUpdate } from "@/lib/types";
import TaskCreateModal from "./TaskCreateModal";

/** Consistent icon size for all detail rows. */
const ICON_SIZE = 20;

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
        {isMiffy && (
          <img src="/miffy/miffy-snoopy.png" alt="" className="w-32 h-auto opacity-60 select-none pointer-events-none" draggable={false} />
        )}
        <p className="text-sm text-subtle-foreground">Select a task to view details</p>
      </div>
    );
  }

  const dotColor = isMiffy ? getMiffyColor(task.color) : task.color;
  const dateLabel = task.due_date
    ? format(new Date(task.due_date + "T00:00:00"), "EEE, MMM d, yyyy")
    : null;
  const timeLabel = task.due_time
    ? format(new Date(`2000-01-01T${task.due_time}`), "h:mm a")
    : null;
  const repeatLabel = task.repeat_interval && task.repeat_unit
    ? getRepeatLabel(task.repeat_interval, task.repeat_unit)
    : null;

  const sourceBadges: { label: string; className: string }[] = [];
  if (task.source) {
    const map: Record<string, { label: string; cls: string }> = {
      canvas: { label: "bCourses", cls: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
      pensieve: { label: "Pensieve", cls: "text-purple-600 bg-purple-50 dark:bg-purple-900/30" },
      gradescope: { label: "Gradescope", cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" },
    };
    const entry = map[task.source];
    if (entry) sourceBadges.push({ label: entry.label, className: entry.cls });
  }
  if (task.is_submitted) {
    sourceBadges.push({ label: "Submitted", className: "text-green-600 bg-green-50 dark:bg-green-900/30" });
  }
  if (task.late_due_date) {
    sourceBadges.push({
      label: `Late due ${format(new Date(task.late_due_date + "T00:00:00"), "MMM d")}`,
      className: "text-orange-600 bg-orange-50 dark:bg-orange-900/30",
    });
  }
  const hasTags = sourceBadges.length > 0 || (task.tags && task.tags.length > 0);

  return (
    <div className="flex-1 h-full border-l border-border flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-end gap-1 px-5 pt-4 pb-2">
        {task.source_url && (
          <a href={task.source_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors" title="Open in source">
            <ExternalLink size={18} />
          </a>
        )}
        <button onClick={() => setShowEditModal(true)} className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors" title="Edit">
          <Pencil size={18} />
        </button>
        {onDelete && (
          <button onClick={() => { onDelete(task.id); onClose(); }} className="p-2 rounded-lg text-secondary-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete">
            <Trash2 size={18} />
          </button>
        )}
        <button onClick={onClose} className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors" title="Close">
          <X size={18} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto px-6 pb-6 min-w-0">
        {/* Title row: checkbox + title */}
        <div className="flex items-start gap-4 min-w-0">
          <button
            onClick={() => onSave(task.id, { is_completed: !task.is_completed })}
            className="w-5 h-5 rounded-[4px] shrink-0 mt-1 flex items-center justify-center transition-all cursor-pointer"
            style={{
              backgroundColor: task.is_completed ? dotColor : "transparent",
              border: task.is_completed ? "none" : `2px solid ${dotColor}`,
            }}
            aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.is_completed && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-xl font-semibold text-foreground leading-snug break-words min-w-0">
            {task.title}
          </span>
        </div>

        {/* Date + Time under title */}
        {(dateLabel || timeLabel) && (
          <div className="pl-9 text-sm text-secondary-foreground mt-1">
            {[dateLabel, timeLabel].filter(Boolean).join(" \u00B7 ")}
          </div>
        )}

        {/* Repeat label under date */}
        {repeatLabel && (
          <div className="pl-9 text-sm text-secondary-foreground mt-0.5">
            {repeatLabel}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border my-5" />

        {/* Tags row */}
        {hasTags && (
          <div className="flex items-start gap-4 py-3">
            <Tag size={ICON_SIZE} className="shrink-0 mt-0.5 text-secondary-foreground" />
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {sourceBadges.map((b) => (
                <span key={b.label} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${b.className}`}>{b.label}</span>
              ))}
              {(task.tags ?? []).map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 text-xs rounded-full bg-accent text-foreground max-w-[200px] truncate">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description row */}
        {task.description && (
          <div className="flex items-start gap-4 py-3">
            <AlignLeft size={ICON_SIZE} className="shrink-0 mt-0.5 text-secondary-foreground" />
            <p className="text-sm text-foreground whitespace-pre-wrap break-words min-w-0">
              {task.description}
            </p>
          </div>
        )}

        {/* Course name row */}
        {task.course_name && (
          <div className="flex items-center gap-4 py-3 min-w-0">
            <BookOpen size={ICON_SIZE} className="shrink-0 text-secondary-foreground" />
            <span className="text-sm text-foreground truncate">{task.course_name}</span>
          </div>
        )}
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
