"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Inbox, RefreshCw } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import TaskList from "@/components/tasks/TaskList";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import PageTransition from "@/components/ui/PageTransition";
import type { Task } from "@/lib/types";

/**
 * Inbox page with split-screen layout: task list on left, detail panel on right.
 * Includes sync button in header to trigger Canvas/Gradescope sync.
 * Sync notification auto-dismisses after 4 seconds.
 */
export default function InboxPage() {
  const {
    tasks, loading, error, addTask, toggleComplete, deleteTask, updateTask,
    syncing, syncProgress, syncResult, triggerSync,
  } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastDismissing, setToastDismissing] = useState(false);

  // Keep selected task in sync with context after updates
  const currentSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  const hasRealResults = syncResult && !syncing;

  // Auto-show and auto-dismiss sync toast
  useEffect(() => {
    if (hasRealResults) {
      setToastVisible(true);
      setToastDismissing(false);
      const timer = setTimeout(() => {
        setToastDismissing(true);
        setTimeout(() => setToastVisible(false), 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hasRealResults, syncResult?.last_synced_at]);

  return (
    <PageTransition>
      <div className="flex h-full -m-10">
        {/* Left: task list */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="px-8 pt-8 pb-4 flex items-center justify-between animate-stagger stagger-1">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Inbox size={20} />
              Inbox
            </h1>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all disabled:opacity-50"
              title="Sync assignments from Canvas & Gradescope"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync"}
            </button>
          </div>

          {/* Sync progress bar */}
          {(syncing || syncProgress > 0) && syncProgress < 100 && (
            <div className="mx-8 mb-2">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Auto-dismissing sync toast */}
          {toastVisible && hasRealResults && (
            <div
              className={`mx-8 mb-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2 ${
                toastDismissing ? "animate-toast-out" : "animate-toast-in"
              }`}
            >
              Synced {syncResult.canvas.synced} from Canvas, {syncResult.gradescope.synced} from Gradescope.
              {(syncResult.canvas.errors.length > 0 || syncResult.gradescope.errors.length > 0) && (
                <span className="text-red-400 ml-1">
                  {[...syncResult.canvas.errors, ...syncResult.gradescope.errors]
                    .map((msg) => msg.replace(/Go to Settings to add them\.?/, ""))
                    .join(". ")
                    .trim()}
                  {" "}
                  <Link
                    href="/app/settings"
                    className="underline text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Go to Settings
                  </Link>
                </span>
              )}
            </div>
          )}

          <div className="flex-1 overflow-auto animate-stagger stagger-2">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              selectedTaskId={selectedTask?.id}
              onAdd={addTask}
              onToggle={toggleComplete}
              onSelect={(task) => setSelectedTask(task)}
              onDelete={deleteTask}
              placeholder='Add task to "Inbox". Press Enter to save.'
            />
          </div>
        </div>

        {/* Right: detail panel */}
        <TaskDetailPanel
          task={currentSelectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={updateTask}
        />
      </div>
    </PageTransition>
  );
}
