"use client";

import { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import type { Task, TaskInsert } from "@/lib/types";
import TaskItem from "./TaskItem";
import TaskAddForm from "./TaskAddForm";

/** Maximum items shown per section before "show more" truncation. */
const ITEMS_PER_SECTION = 10;

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId?: string | null;
  onAdd: (task: TaskInsert) => void;
  onToggle: (id: string) => void;
  onSelect: (task: Task) => void;
  onDelete: (id: string) => void;
  defaultDate?: string | null;
  placeholder?: string;
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
 * Active tasks include both overdue and current, sorted by due date.
 * Overdue dates appear in red on the task item itself.
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
}: TaskListProps) {
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl mx-4">
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
        <div className="text-center py-12 text-gray-400 text-sm">
          No tasks yet. Type above and press Enter!
        </div>
      )}

      {/* Active tasks (overdue + current, flat list) */}
      {active.length > 0 && (
        <div className="mt-1">
          {activeToShow.map((task, i) => (
            <div key={task.id}>
              {i > 0 && <div className="mx-12 h-px bg-gray-100" />}
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
              className="px-8 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors w-full text-left"
            >
              {showAllActive ? "Show less" : `+${active.length - ITEMS_PER_SECTION} more`}
            </button>
          )}
        </div>
      )}

      {/* Completed section (collapsible) */}
      {completed.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="flex items-center pl-2.5 pr-4 py-1.5 hover:bg-black/5 transition-colors w-full text-left rounded-lg mx-2"
          >
            <ChevronRight
              size={12}
              className={`shrink-0 text-gray-600 transition-transform duration-200 ${
                completedExpanded ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-semibold text-gray-800 ml-0.5">Completed</span>
            <span className="text-xs text-gray-400 ml-1.5">{completed.length}</span>
          </button>
          {completedExpanded && (
            <>
              {completedToShow.map((task, i) => (
                <div key={task.id}>
                  {i > 0 && <div className="mx-12 h-px bg-gray-100" />}
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
                  className="px-8 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors w-full text-left"
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
