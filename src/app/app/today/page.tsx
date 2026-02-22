"use client";

import { useState, useMemo, useCallback } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import TaskList from "@/components/tasks/TaskList";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import TaskPopover from "@/components/tasks/TaskPopover";
import PageTransition from "@/components/ui/PageTransition";
import type { Task } from "@/lib/types";

/**
 * Today page filtering for tasks due today.
 * Uses split-screen layout with task list on left, detail panel on right.
 * On mobile (<768px), shows a TaskPopover instead of the side panel.
 */
export default function TodayPage() {
  const today = new Date().toISOString().split("T")[0];
  const { tasks, loading, error, addTask, toggleComplete, deleteTask, updateTask, reorderTasks } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mobilePopoverTask, setMobilePopoverTaskRaw] = useState<Task | null>(null);
  const [mobileAnchorRect, setMobileAnchorRect] = useState<DOMRect | null>(null);

  /** Opens mobile popover near the tapped task row. */
  const setMobilePopoverTask = useCallback((task: Task | null, anchorRect?: DOMRect) => {
    setMobilePopoverTaskRaw(task);
    if (task && anchorRect) {
      setMobileAnchorRect(anchorRect);
    } else {
      setMobileAnchorRect(null);
    }
  }, []);

  /**
   * Handles drag-and-drop reorder by mapping new ID order to sort_order values.
   * Uses gaps of 1000 between values to allow future insertions without reindexing.
   *
   * @param reorderedIds - Task IDs in their new display order
   */
  const handleReorder = useCallback((reorderedIds: string[]) => {
    const updates = reorderedIds.map((id, index) => ({
      id,
      sort_order: (index + 1) * 1000,
    }));
    reorderTasks(updates);
  }, [reorderTasks]);

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.due_date === today),
    [tasks, today]
  );

  const currentSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  const currentMobilePopoverTask = mobilePopoverTask
    ? tasks.find((t) => t.id === mobilePopoverTask.id) ?? null
    : null;

  return (
    <PageTransition>
      <div className="flex h-full -m-4 md:-m-10">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="px-4 pt-4 pb-3 md:px-8 md:pt-8 md:pb-4 animate-stagger stagger-1">
            <h1 className="text-xl font-bold text-foreground">Today</h1>
          </div>
          <div className="flex-1 overflow-auto animate-stagger stagger-2">
            <TaskList
              tasks={todayTasks}
              loading={loading}
              error={error}
              selectedTaskId={selectedTask?.id}
              onAdd={addTask}
              onToggle={toggleComplete}
              onSelect={(task, anchorRect) => {
                if (typeof window !== "undefined" && window.innerWidth < 768 && anchorRect) {
                  setMobilePopoverTask(task, anchorRect);
                } else {
                  setSelectedTask(task);
                }
              }}
              onDelete={deleteTask}
              onReorder={handleReorder}
              defaultDate={today}
              placeholder='Add task for today. Press Enter to save.'
            />
          </div>
        </div>

        <div className="hidden md:flex">
          <TaskDetailPanel
            task={currentSelectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={updateTask}
            onDelete={deleteTask}
          />
        </div>
      </div>

      {/* Mobile: floating task popover instead of side panel */}
      {currentMobilePopoverTask && mobileAnchorRect && (
        <TaskPopover
          task={currentMobilePopoverTask}
          anchorRect={mobileAnchorRect}
          onClose={() => { setMobilePopoverTask(null); setMobileAnchorRect(null); }}
          onSave={async (id, updates) => {
            await updateTask(id, updates);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setMobilePopoverTask(null);
            setMobileAnchorRect(null);
          }}
        />
      )}
    </PageTransition>
  );
}
