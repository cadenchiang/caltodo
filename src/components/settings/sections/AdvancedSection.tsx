"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, Play } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";

/**
 * Advanced settings section.
 * Provides restart tutorial, redo setup wizard, and delete-all-tasks
 * actions with double-click confirmation where destructive.
 */
export default function AdvancedSection() {
  const router = useRouter();
  const { tasks, deleteAllTasks } = useTaskContext();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRedo, setConfirmRedo] = useState(false);

  useEffect(() => {
    router.prefetch("/app/onboarding");
  }, [router]);

  /**
   * Handles redo setup wizard with double-click confirmation.
   * First click shows confirmation text, second click navigates.
   * Resets after 3 seconds if not confirmed.
   */
  function handleRedoSetup() {
    if (!confirmRedo) {
      setConfirmRedo(true);
      setTimeout(() => setConfirmRedo(false), 3000);
      return;
    }
    setConfirmRedo(false);
    router.push("/app/onboarding");
  }

  /** Restarts the tour immediately — dispatches event, tour handles navigation. */
  function handleRestartTour() {
    try {
      localStorage.removeItem("caltodo_tour_completed");
      localStorage.removeItem("caltodo_tour_pending");
    } catch { /* non-critical */ }
    window.dispatchEvent(new CustomEvent("caltodo-restart-tour"));
  }

  /**
   * Handles delete all tasks with double-click confirmation.
   * First click shows confirmation text, second click executes.
   * Resets after 3 seconds if not confirmed.
   */
  async function handleDeleteAll() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setConfirmDelete(false);
    await deleteAllTasks();
    showToast("All tasks deleted.");
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Advanced</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Data management and setup options.
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleRestartTour}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent transition-colors text-foreground"
        >
          <Play size={15} />
          Restart Tutorial
        </button>

        <button
          onClick={handleRedoSetup}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors ${
            confirmRedo
              ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              : "border-border bg-card hover:bg-accent text-foreground"
          }`}
        >
          <RotateCcw size={15} />
          {confirmRedo ? "Click again to redo setup" : "Redo Setup Wizard"}
        </button>

        <button
          onClick={handleDeleteAll}
          disabled={tasks.length === 0}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            confirmDelete
              ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
              : "border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trash2 size={15} />
          {confirmDelete
            ? `Click again to delete all ${tasks.length} tasks`
            : `Delete All Tasks (${tasks.length})`}
        </button>
      </div>
    </section>
  );
}
