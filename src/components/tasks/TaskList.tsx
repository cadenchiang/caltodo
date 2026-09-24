"use client";

import { useState, useMemo, useCallback } from "react";
import { AlertCircle, Inbox } from "lucide-react";
import { useNow } from "@/hooks/useNow";
import type { Task, TaskInsert, PendingInvite } from "@/lib/types";
import { useTaskContext } from "@/contexts/TaskContext";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import TaskItem from "./TaskItem";
import ClassGroupHeader from "./ClassGroupHeader";
import RequestsSection from "./list/RequestsSection";
import HiddenSection from "./list/HiddenSection";
import CompletedSection from "./list/CompletedSection";
import LaterSection from "./list/LaterSection";
import TaskListSkeleton from "./list/TaskListSkeleton";
import { useListReorder, type SortOrderUpdates } from "./list/useListReorder";
import { loadColumnAliases, saveColumnAliases, loadHideHours, saveHideHours } from "./board-storage";
import { ITEMS_PER_SECTION, groupByCourse, partitionTasks } from "./task-list-helpers";

/** Copy for the empty list, keyed by the inbox filter. */
const EMPTY_COPY: Record<"all" | "today" | "7days", { title: string; description: string }> = {
  all: { title: "No tasks yet", description: "Add one, or sync your classes to bring in their tasks." },
  today: { title: "Nothing due today", description: "Anything due today or overdue shows up here." },
  "7days": { title: "Nothing due in the next 7 days", description: "Tasks due this week show up here." },
};

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  /** Plain message for a failed initial load; null otherwise. */
  error: string | null;
  selectedTaskId?: string | null;
  onAdd: (task: TaskInsert) => void | Promise<boolean | void>;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
  defaultDate?: string | null;
  /** When "class", active tasks are grouped under collapsible course headers. */
  sortMode?: "date" | "class";
  /** Active inbox filter, for filter-aware empty copy. */
  filter?: "all" | "today" | "7days";
  /** Opens the add-task modal from the empty state. */
  onAddClick?: () => void;
  /** Called after a reorder with sort_order writes for the affected siblings. Only in "date" sortMode. */
  onReorder?: (updates: SortOrderUpdates) => void;
  /** Callback to change the color for all tasks in a class. */
  onColorChange?: (courseName: string, color: string) => void;
  /** Callback to delete all tasks in a class. */
  onDeleteClass?: (courseName: string) => void;
  /** Callback to add a task pre-filled with a specific class. */
  onAddTaskToClass?: (courseName: string) => void;
  /** Pending task invitations to show in the "Requests" section. */
  pendingInvites?: PendingInvite[];
  /** Callback when user accepts or declines an invite. */
  onRespondInvite?: (shareId: string, action: "accept" | "decline") => void;
  /** Callback to accept all pending invites at once. */
  onAcceptAllInvites?: () => void;
  /** Called when the user clicks the empty area below the list (deselects). */
  onDeselect?: () => void;
}

/**
 * Task list: Requests, active tasks (flat or grouped by class), Later,
 * Hidden and Completed sections. Rows are keyboard reachable, drag reorder
 * is limited to same-date siblings, and the loading state is a row skeleton.
 *
 * @param tasks - Tasks to display (already filtered by the page)
 * @param loading - Whether the initial fetch is still running
 * @param error - Plain message when the initial load failed
 * @param sortMode - "date" for a flat list, "class" for grouped
 * @param filter - Inbox filter, used only for the empty-state copy
 */
export default function TaskList({
  tasks,
  loading,
  error,
  selectedTaskId,
  onToggle,
  onSelect,
  onDelete,
  sortMode = "date",
  filter = "all",
  onAddClick,
  onReorder,
  onColorChange,
  onDeleteClass,
  onAddTaskToClass,
  pendingInvites = [],
  onRespondInvite,
  onAcceptAllInvites,
  onDeselect,
}: TaskListProps) {
  const { unsnoozeTask, fetchTasks } = useTaskContext();
  const [showAllActive, setShowAllActive] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [aliases, setAliases] = useState<Map<string, string>>(() => loadColumnAliases());
  const [hideHours, setHideHours] = useState<number>(() => loadHideHours());

  /** Toggles a course group's collapsed state. */
  const toggleGroup = useCallback((groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  }, []);

  /** Renames a group by saving a display alias (shared with board view). */
  const renameGroup = useCallback((originalName: string, newDisplayName: string) => {
    setAliases((prev) => {
      const next = new Map(prev);
      const trimmed = newDisplayName.trim();
      if (!trimmed || trimmed === originalName) next.delete(originalName);
      else next.set(originalName, trimmed);
      saveColumnAliases(next);
      return next;
    });
  }, []);

  /** Resets a group alias back to its original name. */
  const resetGroupName = useCallback((originalName: string) => {
    setAliases((prev) => {
      const next = new Map(prev);
      next.delete(originalName);
      saveColumnAliases(next);
      return next;
    });
  }, []);

  /** Updates the auto-hide duration for completed tasks. */
  const updateHideHours = useCallback((hours: number) => {
    setHideHours(hours);
    saveHideHours(hours);
  }, []);

  const now = useNow();
  const { active, later, snoozed, completed } = useMemo(
    () => partitionTasks(tasks, now, hideHours),
    [tasks, hideHours, now]
  );

  /** Active tasks grouped by course when sortMode is "class". */
  const activeGroups = useMemo(() => (sortMode === "class" ? groupByCourse(active) : []), [active, sortMode]);

  const dragEnabled = sortMode === "date" && !!onReorder;
  const reorder = useListReorder(active, onReorder, dragEnabled);

  if (loading) return <TaskListSkeleton />;

  // Only a failed initial load reaches here (TaskContext keeps write
  // failures out of `error`), so there is nothing to keep on screen.
  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle size={20} />}
        title={error}
        description="Check your connection and try again."
        action={
          <Button variant="inverted" onClick={() => fetchTasks()}>
            Try again
          </Button>
        }
      />
    );
  }

  const activeToShow = showAllActive ? active : active.slice(0, ITEMS_PER_SECTION);
  const isEmpty = active.length === 0 && later.length === 0 && snoozed.length === 0 && completed.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <RequestsSection invites={pendingInvites} onSelect={onSelect} onRespond={onRespondInvite} onAcceptAll={onAcceptAllInvites} />

      {isEmpty && (
        <EmptyState
          icon={<Inbox size={20} />}
          title={EMPTY_COPY[filter].title}
          description={EMPTY_COPY[filter].description}
          action={onAddClick ? <Button onClick={onAddClick}>Add task</Button> : undefined}
        />
      )}

      {/* Active tasks: grouped by class or flat list depending on sortMode */}
      {active.length > 0 && sortMode === "class" ? (
        <div className="mt-1">
          {activeGroups.map(([groupName, groupTasks], groupIdx) => {
            const isCollapsed = collapsedGroups.has(groupName);
            return (
              <div key={groupName} className={groupIdx > 0 ? "mt-6" : ""}>
                <ClassGroupHeader
                  groupName={groupName}
                  displayName={aliases.get(groupName) || groupName}
                  hasAlias={aliases.has(groupName)}
                  count={groupTasks.length}
                  isCollapsed={isCollapsed}
                  onToggle={() => toggleGroup(groupName)}
                  onRename={renameGroup}
                  onResetName={resetGroupName}
                  onColorChange={onColorChange}
                  onDeleteClass={onDeleteClass}
                  onAddTask={onAddTaskToClass}
                />
                {!isCollapsed &&
                  groupTasks.map((task) => (
                    <div key={task.id} className="cv-auto-task px-4 -mx-4">
                      <TaskItem task={task} isSelected={selectedTaskId === task.id} onToggle={onToggle} onSelect={onSelect} onDelete={onDelete} />
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      ) : active.length > 0 ? (
        <div className="mt-1">
          {activeToShow.map((task, i) => (
            <div
              key={task.id}
              className={`cv-auto-task px-4 -mx-4 ${dragEnabled ? "cursor-grab active:cursor-grabbing" : ""} ${
                reorder.dropBlocked && reorder.draggedId && reorder.draggedId !== task.id ? "cursor-not-allowed" : ""
              }`}
              draggable={dragEnabled}
              onDragStart={dragEnabled ? (e) => reorder.onDragStart(e, task.id) : undefined}
              onDragOver={dragEnabled ? (e) => reorder.onDragOver(e, i, task) : undefined}
              onDrop={dragEnabled ? reorder.onDrop : undefined}
              onDragEnd={dragEnabled ? reorder.onDragEnd : undefined}
              style={reorder.draggedId === task.id ? { opacity: 0.4 } : undefined}
            >
              {reorder.dropTargetIndex === i && reorder.draggedId !== task.id && (
                <div className="h-0.5 bg-blue-500 mx-4 rounded-full" />
              )}
              <TaskItem
                task={task}
                isSelected={selectedTaskId === task.id}
                onToggle={onToggle}
                onSelect={onSelect}
                onDelete={onDelete}
                onMoveUp={dragEnabled && reorder.canMove(task.id, -1) ? reorder.moveUp : undefined}
                onMoveDown={dragEnabled && reorder.canMove(task.id, 1) ? reorder.moveDown : undefined}
              />
            </div>
          ))}
          {reorder.dropTargetIndex === activeToShow.length && reorder.draggedId && (
            <div className="h-0.5 bg-blue-500 mx-4 rounded-full" />
          )}
          {active.length > ITEMS_PER_SECTION && (
            <button
              type="button"
              onClick={() => setShowAllActive(!showAllActive)}
              className="px-8 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
            >
              {showAllActive ? "Show less" : `+${active.length - ITEMS_PER_SECTION} more`}
            </button>
          )}
        </div>
      ) : null}

      <LaterSection tasks={later} selectedTaskId={selectedTaskId} onToggle={onToggle} onSelect={onSelect} onDelete={onDelete} />
      <HiddenSection tasks={snoozed} onUnhide={unsnoozeTask} onToggle={onToggle} onDelete={onDelete} />
      <CompletedSection
        tasks={completed}
        selectedTaskId={selectedTaskId}
        hideHours={hideHours}
        onHideHoursChange={updateHideHours}
        onToggle={onToggle}
        onSelect={onSelect}
        onDelete={onDelete}
      />

      {/* Click-catcher below all sections: deselects only when the user
          clicks the empty vertical space under the last task. */}
      {onDeselect && <div className="flex-1 min-h-[24px]" onClick={onDeselect} />}
    </div>
  );
}
