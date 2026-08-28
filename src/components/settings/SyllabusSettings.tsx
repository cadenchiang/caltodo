"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";

/**
 * Syllabus integration row card.
 * Groups imported tasks by course_name so users can delete individual
 * syllabus uploads without losing tasks from other uploads.
 * "Upload" / "Upload Another" navigates to syllabus onboarding step.
 *
 * Follows the same card pattern as PensieveSettings/CanvasSettings.
 */
export default function SyllabusSettings() {
  const router = useRouter();
  const { showToast } = useToast();
  const { tasks, deleteTasksBySource, deleteSyllabusTasksByCourse } = useTaskContext();
  const [disconnecting, setDisconnecting] = useState(false);
  /** Which course or "all" to confirm deletion for. */
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const syllabusTasks = useMemo(
    () => tasks.filter((t) => t.source === "syllabus"),
    [tasks]
  );

  /** Groups syllabus tasks by course_name, sorted alphabetically. */
  const courseGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of syllabusTasks) {
      const name = t.course_name || "Untitled Syllabus";
      map.set(name, (map.get(name) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count }));
  }, [syllabusTasks]);

  const totalCount = syllabusTasks.length;

  /**
   * Deletes tasks for a specific course or all syllabus tasks.
   *
   * @param target - course_name to delete, or "all" for everything
   */
  async function handleDelete(target: string) {
    setConfirmTarget(null);
    setDisconnecting(true);
    try {
      if (target === "all") {
        await deleteTasksBySource("syllabus");
        showToast("All syllabus tasks removed.");
      } else {
        await deleteSyllabusTasksByCourse(target);
        showToast(`Removed tasks from "${target}".`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove tasks");
    } finally {
      setDisconnecting(false);
    }
  }

  /** Count for the current confirm target. */
  const confirmCount = confirmTarget === "all"
    ? totalCount
    : courseGroups.find((g) => g.name === confirmTarget)?.count ?? 0;

  const confirmLabel = confirmTarget === "all"
    ? `all ${totalCount} imported task${totalCount === 1 ? "" : "s"}`
    : `${confirmCount} task${confirmCount === 1 ? "" : "s"} from "${confirmTarget}"`;

  return (
    <div className="rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-purple-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Syllabus</p>
          <p className="text-xs text-muted-foreground truncate">
            {totalCount === 0
              ? "Assignments from a PDF"
              : totalCount === 1
                ? "1 assignment imported"
                : `${totalCount} assignments imported`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/app/onboarding?setup=syllabus")}
            className="text-xs font-medium text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors cursor-pointer"
          >
            {totalCount > 0 ? "Upload Another" : "Upload"}
          </button>
          {totalCount > 0 && courseGroups.length <= 1 && (
            <button
              onClick={() => setConfirmTarget("all")}
              disabled={disconnecting}
              aria-label="Disconnect Syllabus"
              className="group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-60
                text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30
                hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
            >
              <span className="group-hover:hidden">{disconnecting ? "..." : "Connected"}</span>
              <span className="hidden group-hover:inline">Disconnect</span>
            </button>
          )}
        </div>
      </div>

      {/* Per-course breakdown when multiple syllabuses uploaded */}
      {courseGroups.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {courseGroups.map((group) => (
            <div key={group.name} className="flex items-center justify-between gap-2 px-1">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{group.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {group.count} task{group.count === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => setConfirmTarget(group.name)}
                disabled={disconnecting}
                className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-60 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                aria-label={`Remove ${group.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setConfirmTarget("all")}
            disabled={disconnecting}
            className="w-full text-[11px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg py-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            Remove All
          </button>
        </div>
      )}

      {confirmTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmTarget(null)} />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Remove syllabus tasks?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                This will remove {confirmLabel}. You can upload again later.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDelete(confirmTarget)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmTarget(null)}
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
