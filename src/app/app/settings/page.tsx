"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, Moon, Sun } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import CalendarFeedSettings from "@/components/settings/CalendarFeedSettings";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Settings page with sections: Integrations, Calendar Feed, Appearance, and Advanced.
 * Each integration section manages its own Edit/Save/Cancel independently.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { tasks, deleteAllTasks } = useTaskContext();
  const { theme, toggleTheme } = useTheme();
  const [confirmDelete, setConfirmDelete] = useState(false);

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
  }

  return (
    <PageTransition>
      <div className="flex h-full -m-10">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 pt-8 pb-4 animate-stagger stagger-1">
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
          <div className="flex-1 overflow-auto px-8 pb-8">
            {/* Integrations */}
            <div className="animate-stagger stagger-2">
              <IntegrationSettings />
            </div>

            {/* Calendar Feed */}
            <div className="mt-8 pt-6 border-t border-border animate-stagger stagger-3">
              <CalendarFeedSettings />
            </div>

            {/* Appearance */}
            <div className="mt-8 pt-6 border-t border-border animate-stagger stagger-4">
              <div className="max-w-xl">
                <h2 className="text-lg font-semibold text-foreground mb-1">Appearance</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Choose between light and dark theme.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={theme === "dark" ? toggleTheme : undefined}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                      theme === "light"
                        ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Sun size={16} />
                    Light
                  </button>
                  <button
                    onClick={theme === "light" ? toggleTheme : undefined}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                      theme === "dark"
                        ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Moon size={16} />
                    Dark
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced actions */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col gap-2 animate-stagger stagger-4">
              <button
                onClick={() => router.push("/app/onboarding")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors w-fit"
              >
                <RotateCcw size={15} />
                Redo Setup Wizard
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
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
