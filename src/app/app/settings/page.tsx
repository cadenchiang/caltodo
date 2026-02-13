"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import CalendarFeedSettings from "@/components/settings/CalendarFeedSettings";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Settings page for configuring Canvas and Gradescope integrations.
 * Includes a button to redo the onboarding wizard and delete all tasks.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { tasks, deleteAllTasks } = useTaskContext();
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
            <h1 className="text-xl font-bold text-gray-800">Settings</h1>
          </div>
          <div className="flex-1 overflow-auto px-8 pb-8">
            <div className="animate-stagger stagger-2">
              <IntegrationSettings />
            </div>
            <div className="animate-stagger stagger-3">
              <CalendarFeedSettings />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-2 animate-stagger stagger-4">
              <button
                onClick={() => router.push("/app/onboarding")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors w-fit"
              >
                <RotateCcw size={15} />
                Redo Setup Wizard
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={tasks.length === 0}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors w-fit disabled:opacity-40 disabled:cursor-not-allowed ${
                  confirmDelete
                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-50"
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
