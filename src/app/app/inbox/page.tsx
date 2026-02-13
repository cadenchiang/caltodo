"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import TaskList from "@/components/tasks/TaskList";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import type { Task } from "@/lib/types";

/**
 * Checks if sync result errors indicate missing credentials.
 *
 * @param errors - Array of error strings from a sync source
 * @returns true if errors indicate no credentials are configured
 */
function hasNoCredentialsError(errors: string[]): boolean {
  return errors.some((e) => e.includes("No integration credentials"));
}

/**
 * Inbox page with split-screen layout: task list on left, detail panel on right.
 * Includes sync button in header to trigger Canvas/Gradescope sync.
 * Sync notification auto-dismisses after 4 seconds.
 * Redirects to onboarding if no credentials are configured.
 */
export default function InboxPage() {
  const router = useRouter();
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

  const needsOnboarding = syncResult && !syncing &&
    hasNoCredentialsError(syncResult.canvas.errors) &&
    hasNoCredentialsError(syncResult.gradescope.errors);

  useEffect(() => {
    if (needsOnboarding) {
      router.push("/app/onboarding");
    }
  }, [needsOnboarding, router]);

  const hasRealResults = syncResult && !syncing && !needsOnboarding;

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
    <div className="flex h-full -m-10">
      {/* Left: task list */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Inbox</h1>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-black/5 rounded-lg transition-all disabled:opacity-50"
            title="Sync assignments from Canvas & Gradescope"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </div>

        {/* Sync progress bar */}
        {(syncing || syncProgress > 0) && syncProgress < 100 && (
          <div className="mx-8 mb-2">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
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
            className={`mx-8 mb-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 ${
              toastDismissing ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            Synced {syncResult.canvas.synced} from Canvas, {syncResult.gradescope.synced} from Gradescope.
            {(syncResult.canvas.errors.length > 0 || syncResult.gradescope.errors.length > 0) && (
              <span className="text-red-400 ml-1">
                {[...syncResult.canvas.errors, ...syncResult.gradescope.errors].join(". ")}
              </span>
            )}
          </div>
        )}

        <div className="flex-1 overflow-auto">
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
  );
}
