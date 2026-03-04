"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";

/**
 * Syllabus integration row card.
 * Shows count of imported syllabus tasks.
 * "Upload Another" navigates to syllabus onboarding step.
 * "Disconnect" hover deletes all syllabus tasks with confirmation.
 *
 * Follows the same card pattern as PensieveSettings/CanvasSettings.
 */
export default function SyllabusSettings() {
  const router = useRouter();
  const { showToast } = useToast();
  const { tasks, deleteTasksBySource } = useTaskContext();
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const syllabusTaskCount = tasks.filter((t) => t.source === "syllabus").length;

  /**
   * Deletes all syllabus tasks after user confirms.
   */
  async function handleDisconnect() {
    setShowConfirm(false);
    setDisconnecting(true);
    try {
      await deleteTasksBySource("syllabus");
      showToast("Syllabus tasks removed.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove tasks");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-purple-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Syllabus</p>
          <p className="text-xs text-muted-foreground truncate">
            {syllabusTaskCount === 1
              ? "1 assignment imported"
              : `${syllabusTaskCount} assignments imported`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/app/onboarding?setup=syllabus")}
            className="text-xs font-medium text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors cursor-pointer"
          >
            Upload Another
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={disconnecting}
            aria-label="Disconnect Syllabus"
            className="group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-60
              text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30
              hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
          >
            <span className="group-hover:hidden">{disconnecting ? "..." : "Connected"}</span>
            <span className="hidden group-hover:inline">Disconnect</span>
          </button>
        </div>
      </div>

      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-sm mx-4 p-6 animate-modal-in">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Remove syllabus tasks?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {syllabusTaskCount > 0
                  ? `This will remove ${syllabusTaskCount === 1 ? "1 imported task" : `${syllabusTaskCount} imported tasks`} from your syllabus uploads. You can upload again later.`
                  : "No imported tasks to remove."}
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
