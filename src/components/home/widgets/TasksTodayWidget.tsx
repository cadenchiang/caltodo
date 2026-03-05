"use client";

/**
 * Widget showing tasks in an inbox-list style.
 * Supports view modes: Today, This Week, All Inbox.
 * Clicking a task opens a TaskPreviewPopover; edit opens a full modal.
 * Includes a + button for quick inline task creation.
 *
 * @param config - Widget configuration (viewMode, showCompleted)
 */

import { useMemo, useState } from "react";
import { Inbox, Plus, Repeat } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColor } from "@/lib/constants";
import { getDueDateInfo } from "@/lib/task-utils";
import { useCompactMode } from "@/hooks/useCompactMode";
import TaskCheckbox from "@/components/tasks/shared/TaskCheckbox";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import TaskPreviewPopover from "@/components/tasks/TaskPreviewPopover";
import { WidgetHeader, WidgetProgressBar } from "./WidgetPrimitives";
import type { Task } from "@/lib/types";

/** View mode labels for the header. */
const VIEW_LABELS: Record<string, string> = {
  today: "Today",
  week: "This Week",
  inbox: "All Tasks",
};

interface TasksTodayWidgetProps {
  config?: Record<string, string>;
}

/**
 * Returns a YYYY-MM-DD date string for a given Date object.
 *
 * @param d - Date to format
 * @returns YYYY-MM-DD string
 */
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TasksTodayWidget({ config }: TasksTodayWidgetProps) {
  const { tasks, addTask, toggleComplete, deleteTask, updateTask } = useTaskContext();
  const { colorTheme } = useTheme();
  const hideCompleted = config?.showCompleted === "false";
  const viewMode = config?.viewMode || "today";
  const { containerRef, compact } = useCompactMode(160);

  const [showAddModal, setShowAddModal] = useState(false);
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [editModalTask, setEditModalTask] = useState<Task | null>(null);

  /** Keep preview task in sync with context updates (e.g. toggle complete). */
  const currentPreviewTask = previewTask
    ? tasks.find((t) => t.id === previewTask.id) ?? null
    : null;

  const todayStr = useMemo(() => toDateStr(new Date()), []);
  const weekEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toDateStr(d);
  }, []);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        if (t.dismissed_at || t.snoozed_until) return false;
        switch (viewMode) {
          case "today":
            return t.due_date === todayStr;
          case "week":
            return t.due_date && t.due_date >= todayStr && t.due_date <= weekEndStr;
          case "inbox":
            return true;
          default:
            return t.due_date === todayStr;
        }
      }),
    [tasks, todayStr, weekEndStr, viewMode]
  );

  const completedCount = filteredTasks.filter((t) => t.is_completed).length;
  const totalCount = filteredTasks.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const label = VIEW_LABELS[viewMode] || "Today";

  /**
   * Opens the task preview popover anchored to the clicked row.
   *
   * @param task - Task to preview
   * @param e - Mouse event used to capture anchor rect and guard checkbox clicks
   */
  function handleTaskClick(task: Task, e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("button, input, .no-drag")) return;
    setPreviewTask(task);
    setPreviewRect(e.currentTarget.getBoundingClientRect());
  }

  /** Closes the preview popover and resets anchor state. */
  function closePreview() {
    setPreviewTask(null);
    setPreviewRect(null);
  }

  /**
   * Transitions from preview popover to full edit modal.
   *
   * @param task - Task to edit
   */
  function handlePreviewEdit(task: Task) {
    closePreview();
    setEditModalTask(task);
  }

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col p-4 overflow-hidden">
      <WidgetHeader
        title={label}
        right={
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground tabular-nums">
              {completedCount}/{totalCount}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddModal(true);
              }}
              className="no-drag w-5 h-5 flex items-center justify-center rounded text-foreground hover:bg-muted transition-colors"
              aria-label="Add task"
            >
              <Plus size={14} />
            </button>
          </div>
        }
      />

      <WidgetProgressBar
        pct={progressPct}
        accentColor={config?.accentColor}
        className="mb-2.5"
      />

      {/* Compact mode — show only header + progress bar */}
      {compact ? null : totalCount === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Inbox size={20} className="text-foreground mb-2" />
          <p className="text-sm text-foreground">
            {viewMode === "today" ? "Nothing due today" : viewMode === "week" ? "Nothing this week" : "No tasks yet"}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredTasks
            .filter((t) => !hideCompleted || !t.is_completed)
            .slice(0, 8)
            .map((task) => {
              const taskColor = getThemeColor(task.color, colorTheme);
              const dueBadge = getDueDateInfo(task.due_date, task.due_time);

              return (
                <div
                  key={task.id}
                  className={`group flex items-center gap-2 px-2 h-8 rounded-lg transition-colors duration-100 cursor-pointer hover:bg-black/10 dark:hover:bg-white/15 ${
                    task.is_completed ? "opacity-50" : ""
                  }`}
                  onClick={(e) => handleTaskClick(task, e)}
                >
                  {/* Checkbox */}
                  <div className="no-drag" onClick={(e) => e.stopPropagation()}>
                    <TaskCheckbox
                      color={taskColor}
                      isCompleted={task.is_completed}
                      onToggle={() => toggleComplete(task.id)}
                      size="sm"
                    />
                  </div>

                  {/* Title */}
                  <span
                    className={`flex-1 min-w-0 truncate text-sm ${
                      task.is_completed ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>

                  {/* Repeat indicator */}
                  {task.repeat_interval && task.repeat_unit && (
                    <Repeat size={10} className="text-purple-400 shrink-0" />
                  )}

                  {/* Due badge */}
                  {dueBadge && !task.is_completed && (
                    <span className={`text-xs shrink-0 ${dueBadge.className}`}>
                      {dueBadge.dateLabel}
                    </span>
                  )}
                </div>
              );
            })}
          {filteredTasks.filter((t) => !hideCompleted || !t.is_completed).length > 8 && (
            <p className="text-xs text-foreground pt-1 px-2">
              +{filteredTasks.filter((t) => !hideCompleted || !t.is_completed).length - 8} more
            </p>
          )}
        </div>
      )}

      {/* Add task modal — same as inbox/calendar */}
      <TaskCreateModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(task) => {
          addTask(task);
          setShowAddModal(false);
        }}
        defaultDate={viewMode === "today" ? todayStr : null}
      />

      {/* Task preview popover — appears on task row click */}
      {currentPreviewTask && previewRect && (
        <TaskPreviewPopover
          task={currentPreviewTask}
          anchorRect={previewRect}
          onClose={closePreview}
          onEdit={handlePreviewEdit}
          onDelete={async (id) => {
            await deleteTask(id);
            closePreview();
          }}
          onToggle={toggleComplete}
        />
      )}

      {/* Full edit modal — opened from popover's Edit button */}
      {editModalTask && (
        <TaskCreateModal
          open={!!editModalTask}
          onClose={() => setEditModalTask(null)}
          onAdd={() => {}}
          editTask={editModalTask}
          onSave={async (id, updates) => {
            await updateTask(id, updates);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setEditModalTask(null);
          }}
        />
      )}
    </div>
  );
}
