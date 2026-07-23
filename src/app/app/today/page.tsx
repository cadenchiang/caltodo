"use client";

import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import TaskList from "@/components/tasks/TaskList";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import TaskPreviewPopover from "@/components/tasks/TaskPreviewPopover";
import PageTransition from "@/components/ui/PageTransition";
import type { Task } from "@/lib/types";

/**
 * Today page filtering for tasks due today.
 * Uses split-screen layout with task list on left, detail panel on right.
 * On mobile (<768px), shows a TaskPopover instead of the side panel.
 */
export default function TodayPage() {
  // Use the LOCAL calendar date, not UTC. due_date is stored as the user's
  // local date, so `toISOString()` (UTC) made "Today" show tomorrow's tasks
  // every evening west of UTC (e.g. after ~4-5pm in Berkeley).
  const today = format(new Date(), "yyyy-MM-dd");
  const { tasks, loading, error, addTask, toggleComplete, deleteTask, updateTask, reorderTasks } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mobileEditTask, setMobileEditTask] = useState<Task | null>(null);
  const [mobileAnchorRect, setMobileAnchorRect] = useState<DOMRect | null>(null);
  const [mobileModalTask, setMobileModalTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const currentMobileEditTask = mobileEditTask
    ? tasks.find((t) => t.id === mobileEditTask.id) ?? null
    : null;

  return (
    <PageTransition>
      <div className="flex h-full -m-4 md:-m-10">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="px-4 pt-4 pb-3 md:px-8 md:pt-8 md:pb-4 animate-stagger stagger-1 flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-foreground">Today</h1>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              aria-label="Add task due today"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors active:scale-[0.97]"
            >
              <Plus size={14} aria-hidden />
              New task
            </button>
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
                  setMobileEditTask(task);
                  setMobileAnchorRect(anchorRect);
                } else {
                  setSelectedTask(task);
                }
              }}
              onDelete={deleteTask}
              onReorder={handleReorder}
              defaultDate={today}
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

      {/* Mobile: preview popover (first click) */}
      {currentMobileEditTask && mobileAnchorRect && (
        <TaskPreviewPopover
          task={currentMobileEditTask}
          anchorRect={mobileAnchorRect}
          onClose={() => { setMobileEditTask(null); setMobileAnchorRect(null); }}
          onEdit={(task) => {
            setMobileEditTask(null);
            setMobileAnchorRect(null);
            setMobileModalTask(task);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setMobileEditTask(null);
            setMobileAnchorRect(null);
          }}
          onToggle={toggleComplete}
        />
      )}

      {/* Header "+ New task" modal — pre-fills due_date with today */}
      <TaskCreateModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(task) => { addTask(task); setShowAddModal(false); }}
        defaultDate={today}
      />

      {/* Mobile: full edit modal (opened from preview pencil) */}
      <TaskCreateModal
        open={!!mobileModalTask}
        onClose={() => setMobileModalTask(null)}
        onAdd={() => {}}
        editTask={mobileModalTask}
        onSave={async (id, updates) => {
          await updateTask(id, updates);
        }}
        onDelete={async (id) => {
          await deleteTask(id);
          setMobileModalTask(null);
        }}
      />
    </PageTransition>
  );
}
