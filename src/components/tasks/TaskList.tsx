"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import type { Task, TaskInsert } from "@/lib/types";
import TaskItem from "./TaskItem";
import TaskAddForm from "./TaskAddForm";
import ClassGroupHeader from "./ClassGroupHeader";

/** Maximum items shown per section before "show more" truncation. */
const ITEMS_PER_SECTION = 10;

/** Shared localStorage key for column/group name aliases (same as board view). */
const COLUMN_ALIASES_KEY = "caltodo_board_column_aliases";

/**
 * Loads column name aliases from localStorage.
 *
 * @returns Map of original course_name to display alias
 */
function loadColumnAliases(): Map<string, string> {
  try {
    const raw = localStorage.getItem(COLUMN_ALIASES_KEY);
    if (!raw) return new Map();
    const entries: Array<[string, string]> = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

/**
 * Saves column name aliases to localStorage.
 *
 * @param aliases - Map of original course_name to display alias
 */
function saveColumnAliases(aliases: Map<string, string>): void {
  try {
    localStorage.setItem(COLUMN_ALIASES_KEY, JSON.stringify([...aliases.entries()]));
  } catch {
    // non-critical
  }
}

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId?: string | null;
  onAdd: (task: TaskInsert) => void;
  onToggle: (id: string) => void;
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  onDelete: (id: string) => void;
  defaultDate?: string | null;
  placeholder?: string;
  /** When "class", active tasks are grouped under collapsible course headers. */
  sortMode?: "date" | "class";
}

/**
 * Groups tasks by course_name, preserving input order within each group.
 * Tasks with null course_name are grouped under "General".
 *
 * @param tasks - Pre-sorted array of tasks
 * @returns Ordered array of [groupName, tasks[]] pairs
 */
function groupByCourse(tasks: Task[]): [string, Task[]][] {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    const key = t.course_name || "General";
    const list = map.get(key);
    if (list) {
      list.push(t);
    } else {
      map.set(key, [t]);
    }
  }
  return Array.from(map.entries());
}

/**
 * Sorts tasks by closest due date first.
 * Tasks without a due date are placed at the end.
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */
function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

/**
 * Task list with add input and two areas: active tasks (flat list) and Completed (collapsible).
 * When sortMode is "class", active tasks are grouped under collapsible course headers
 * with a three-dot menu for renaming (aliases shared with board view).
 *
 * @param tasks - Array of tasks to display
 * @param loading - Whether tasks are being fetched
 * @param error - Error message if fetch failed
 * @param selectedTaskId - ID of the currently selected task
 * @param onAdd - Callback for adding a task
 * @param onToggle - Callback for toggling task completion
 * @param onSelect - Callback for selecting a task (opens detail panel)
 * @param onDelete - Callback for deleting a task
 * @param defaultDate - Optional default date for new tasks
 * @param placeholder - Optional placeholder text for the add input
 * @param sortMode - "date" for flat list, "class" for grouped by course
 */
export default function TaskList({
  tasks,
  loading,
  error,
  selectedTaskId,
  onAdd,
  onToggle,
  onSelect,
  onDelete,
  defaultDate,
  placeholder,
  sortMode = "date",
}: TaskListProps) {
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [aliases, setAliases] = useState<Map<string, string>>(() => loadColumnAliases());

  /** Toggles a course group's collapsed state. */
  const toggleGroup = useCallback((groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }, []);

  /** Renames a group by saving a display alias (shared with board view). */
  const renameGroup = useCallback((originalName: string, newDisplayName: string) => {
    setAliases((prev) => {
      const next = new Map(prev);
      const trimmed = newDisplayName.trim();
      if (!trimmed || trimmed === originalName) {
        next.delete(originalName);
      } else {
        next.set(originalName, trimmed);
      }
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

  const { active, completed } = useMemo(() => {
    const activeList: Task[] = [];
    const completedList: Task[] = [];

    for (const t of tasks) {
      if (t.is_completed) {
        completedList.push(t);
      } else {
        activeList.push(t);
      }
    }

    return {
      active: sortByDueDate(activeList),
      completed: sortByDueDate(completedList),
    };
  }, [tasks]);

  /** Active tasks grouped by course when sortMode is "class". */
  const activeGroups = useMemo(
    () => (sortMode === "class" ? groupByCourse(active) : []),
    [active, sortMode]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-subtle-foreground text-sm">
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-500 text-sm p-4 rounded-xl mx-4">
        Error loading tasks: {error}
      </div>
    );
  }

  const activeToShow = showAllActive ? active : active.slice(0, ITEMS_PER_SECTION);
  const completedToShow = showAllCompleted ? completed : completed.slice(0, ITEMS_PER_SECTION);

  return (
    <div className="flex flex-col">
      <TaskAddForm onAdd={onAdd} defaultDate={defaultDate} placeholder={placeholder} />

      {active.length === 0 && completed.length === 0 && (
        <div className="text-center py-12 text-subtle-foreground text-sm">
          No tasks yet. Type above and press Enter!
        </div>
      )}

      {/* Active tasks — grouped by class or flat list depending on sortMode */}
      {active.length > 0 && sortMode === "class" ? (
        <div className="mt-1">
          {activeGroups.map(([groupName, groupTasks], groupIdx) => {
            const isCollapsed = collapsedGroups.has(groupName);
            return (
              <div key={groupName} className={groupIdx > 0 ? "mt-4 border-t border-border pt-1" : ""}>
                <ClassGroupHeader
                  groupName={groupName}
                  displayName={aliases.get(groupName) || groupName}
                  hasAlias={aliases.has(groupName)}
                  count={groupTasks.length}
                  isCollapsed={isCollapsed}
                  onToggle={() => toggleGroup(groupName)}
                  onRename={renameGroup}
                  onResetName={resetGroupName}
                />
                {!isCollapsed && (
                  <>
                    {groupTasks.map((task, i) => (
                      <div key={task.id}>
                        {i > 0 && <div className="mx-12 h-px bg-border" />}
                        <TaskItem
                          task={task}
                          isSelected={selectedTaskId === task.id}
                          onToggle={onToggle}
                          onSelect={onSelect}
                          onDelete={onDelete}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : active.length > 0 ? (
        <div className="mt-1">
          {activeToShow.map((task, i) => (
            <div key={task.id}>
              {i > 0 && <div className="mx-12 h-px bg-border" />}
              <TaskItem
                task={task}
                isSelected={selectedTaskId === task.id}
                onToggle={onToggle}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            </div>
          ))}
          {active.length > ITEMS_PER_SECTION && (
            <button
              onClick={() => setShowAllActive(!showAllActive)}
              className="px-8 py-2 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors w-full text-left"
            >
              {showAllActive ? "Show less" : `+${active.length - ITEMS_PER_SECTION} more`}
            </button>
          )}
        </div>
      ) : null}

      {/* Completed section (collapsible) */}
      {completed.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="flex items-center pl-2.5 pr-4 py-1.5 hover:bg-accent transition-colors w-full text-left rounded-lg mx-2"
          >
            <ChevronRight
              size={12}
              className={`shrink-0 text-secondary-foreground transition-transform duration-200 ${
                completedExpanded ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-semibold text-foreground ml-0.5">Completed</span>
            <span className="text-xs text-subtle-foreground ml-1.5">{completed.length}</span>
          </button>
          {completedExpanded && (
            <>
              {completedToShow.map((task, i) => (
                <div key={task.id}>
                  {i > 0 && <div className="mx-12 h-px bg-border" />}
                  <TaskItem
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                </div>
              ))}
              {completed.length > ITEMS_PER_SECTION && (
                <button
                  onClick={() => setShowAllCompleted(!showAllCompleted)}
                  className="px-8 py-2 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors w-full text-left"
                >
                  {showAllCompleted ? "Show less" : `+${completed.length - ITEMS_PER_SECTION} more`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
