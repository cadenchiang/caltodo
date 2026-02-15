"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import CalendarFeedSettings from "@/components/settings/CalendarFeedSettings";
import ThemeToggle from "@/components/layout/ThemeToggle";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Settings page with unified section styling.
 * Sections: Integrations, Sync to Google Calendar, Appearance, Advanced.
 * Each section has consistent h2 + subtitle + content layout.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { tasks, deleteAllTasks } = useTaskContext();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRedo, setConfirmRedo] = useState(false);

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
    <PageTransition>
      <div className="flex h-full -m-10">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 pt-8 pb-4 animate-stagger stagger-1">
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
          <div className="flex-1 overflow-auto px-8 pb-8">
            <div className="max-w-xl space-y-10">
              {/* Integrations */}
              <section className="animate-stagger stagger-2">
                <IntegrationSettings />
              </section>

              {/* Sync to Google Calendar */}
              <section className="pt-6 border-t border-border animate-stagger stagger-3">
                <CalendarFeedSettings />
              </section>

              {/* Appearance */}
              <section className="pt-6 border-t border-border animate-stagger stagger-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">Appearance</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Choose your preferred appearance.
                </p>
                <ThemeToggle />
              </section>

              {/* Advanced */}
              <section className="pt-6 border-t border-border animate-stagger stagger-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">Advanced</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Data management and setup options.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleRedoSetup}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors w-fit ${
                      confirmRedo
                        ? "text-amber-600 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <RotateCcw size={15} />
                    {confirmRedo ? "Click again to redo setup" : "Redo Setup Wizard"}
                  </button>

                  <button
                    onClick={handleDeleteAll}
                    disabled={tasks.length === 0}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors w-fit disabled:opacity-40 disabled:cursor-not-allowed ${
                      confirmDelete
                        ? "text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
                        : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    }`}
                  >
                    <Trash2 size={15} />
                    {confirmDelete
                      ? `Click again to delete all ${tasks.length} tasks`
                      : `Delete All Tasks (${tasks.length})`}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
