"use client";

/**
 * Widget showing tasks in an inbox-list style.
 * Supports view modes: Today, This Week, All Inbox.
 * Clicking a task navigates to /app/inbox.
 * Includes a + button for quick inline task creation.
 *
 * @param config - Widget configuration (viewMode, showCompleted)
 */

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Plus, Repeat } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColor } from "@/lib/constants";
import { getDueDateInfo } from "@/lib/task-utils";
import TaskCheckbox from "@/components/tasks/shared/TaskCheckbox";

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
  const { tasks, addTask, toggleComplete } = useTaskContext();
  const { colorTheme } = useTheme();
  const router = useRouter();
  const hideCompleted = config?.showCompleted === "false";
  const viewMode = config?.viewMode || "today";

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  /** Handles inline task submission. */
  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    addTask({
      title: trimmed,
      due_date: viewMode === "today" ? todayStr : null,
    });
    setNewTitle("");
    setShowAdd(false);
  }

  /**
   * Navigates to inbox with the specific task opened.
   *
   * @param taskId - ID of the task to open
   * @param e - Mouse event to check for interactive child clicks
   */
  function handleTaskClick(taskId: string, e: React.MouseEvent) {
    // Don't navigate if clicking the checkbox
    const target = e.target as HTMLElement;
    if (target.closest("button, input, .no-drag")) return;
    router.push(`/app/inbox?task=${taskId}`);
  }

  return (
    <div className="h-full w-full flex flex-col p-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 px-1">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-foreground">
            {completedCount}/{totalCount}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAdd((p) => !p);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="no-drag w-5 h-5 flex items-center justify-center rounded text-foreground hover:bg-muted transition-colors"
            aria-label="Add task"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-muted overflow-hidden mb-2 mx-1">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Inline add form */}
      {showAdd && (
        <form onSubmit={handleAddTask} className="no-drag flex items-center gap-1.5 mb-2 px-1">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowAdd(false);
            }}
            placeholder="Task name..."
            className="flex-1 text-sm bg-muted rounded-lg px-2 py-1 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-0"
          />
          <button type="submit" className="text-xs px-2 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shrink-0">
            Add
          </button>
        </form>
      )}

      {/* Task list — inbox style */}
      {totalCount === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Inbox size={20} className="text-foreground mb-2" />
          <p className="text-sm text-foreground">
            {viewMode === "today" ? "Nothing due today" : viewMode === "week" ? "Nothing this week" : "No tasks"}
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
                  onClick={(e) => handleTaskClick(task.id, e)}
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
                    <span className={`text-[10px] shrink-0 ${dueBadge.className}`}>
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
    </div>
  );
}
