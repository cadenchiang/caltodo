"use client";

import { useState, useMemo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import TaskList from "@/components/tasks/TaskList";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import type { Task } from "@/lib/types";

/**
 * Today page filtering for tasks due today.
 * Uses split-screen layout with task list on left, detail panel on right.
 */
export default function TodayPage() {
  const today = new Date().toISOString().split("T")[0];
  const { tasks, loading, error, addTask, toggleComplete, deleteTask, updateTask } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.due_date === today),
    [tasks, today]
  );

  const currentSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  return (
    <div className="flex h-full -m-10">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-xl font-bold text-gray-800">Today</h1>
        </div>
        <div className="flex-1 overflow-auto">
          <TaskList
            tasks={todayTasks}
            loading={loading}
            error={error}
            selectedTaskId={selectedTask?.id}
            onAdd={addTask}
            onToggle={toggleComplete}
            onSelect={(task) => setSelectedTask(task)}
            onDelete={deleteTask}
            defaultDate={today}
            placeholder='Add task for today. Press Enter to save.'
          />
        </div>
      </div>

      <TaskDetailPanel
        task={currentSelectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={updateTask}
      />
    </div>
  );
}
