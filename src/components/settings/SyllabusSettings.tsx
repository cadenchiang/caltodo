"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import IconButton from "@/components/ui/IconButton";
import { PROVIDER_LABELS } from "@/lib/copy";

/** Sentinel for "every syllabus upload" in the confirm target. */
const ALL = "all";

/** Course name used when an imported task carries none. */
const UNTITLED = "Untitled syllabus";

/**
 * Wording for the confirm dialog body.
 *
 * @param target - A course name, or ALL
 * @param count - Tasks that will be removed
 * @returns "all 3 imported tasks" or '2 tasks from "CS 61A"'
 */
export function removalPhrase(target: string, count: number): string {
  const noun = count === 1 ? "task" : "tasks";
  return target === ALL ? `all ${count} imported ${noun}` : `${count} ${noun} from "${target}"`;
}

/**
 * Syllabus card. A syllabus is a PDF the user uploaded, not an account, so
 * the card carries no connection status or disconnect: it offers Upload and an
 * always-visible "Remove tasks" action per upload (grouped by course name).
 */
export default function SyllabusSettings() {
  const router = useRouter();
  const { showToast } = useToast();
  const { tasks, deleteTasksBySource, deleteSyllabusTasksByCourse } = useTaskContext();
  const [removing, setRemoving] = useState(false);
  /** Which course, or ALL, the confirm dialog is about. */
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const syllabusTasks = useMemo(() => tasks.filter((t) => t.source === "syllabus"), [tasks]);

  /** Groups syllabus tasks by course_name, sorted alphabetically. */
  const courseGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of syllabusTasks) {
      const name = t.course_name || UNTITLED;
      map.set(name, (map.get(name) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count }));
  }, [syllabusTasks]);

  const totalCount = syllabusTasks.length;

  /**
   * Deletes tasks for a specific course or every syllabus task.
   *
   * @param target - course_name to delete, or ALL
   */
  async function handleDelete(target: string) {
    setRemoving(true);
    try {
      if (target === ALL) {
        await deleteTasksBySource("syllabus");
        showToast("All syllabus tasks removed.");
      } else {
        await deleteSyllabusTasksByCourse(target);
        showToast(`Removed tasks from "${target}".`);
      }
    } catch (err) {
      console.error("SyllabusSettings: remove failed", {
        target,
        error: err instanceof Error ? err.message : String(err),
        impact: "the imported tasks are still present",
      });
      showToast(err instanceof Error ? err.message : "Failed to remove tasks", { variant: "error" });
    } finally {
      setRemoving(false);
      setConfirmTarget(null);
    }
  }

  const confirmCount =
    confirmTarget === ALL ? totalCount : courseGroups.find((g) => g.name === confirmTarget)?.count ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <FileText size={20} className="text-secondary-foreground" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{PROVIDER_LABELS.syllabus}</p>
          <p className="text-xs text-muted-foreground truncate">
            {totalCount === 0
              ? "Assignments from a PDF"
              : totalCount === 1
                ? "1 assignment imported"
                : `${totalCount} assignments imported`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={() => router.push("/app/onboarding?setup=syllabus")}>
            {totalCount > 0 ? "Upload another" : "Upload"}
          </Button>
          {totalCount > 0 && courseGroups.length <= 1 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmTarget(ALL)}
              disabled={removing}
              className="text-muted-foreground"
            >
              Remove tasks
            </Button>
          )}
        </div>
      </div>

      {courseGroups.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {courseGroups.map((group) => (
            <div key={group.name} className="flex items-center justify-between gap-2 px-1">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{group.name}</p>
                <p className="text-2xs text-muted-foreground">
                  {group.count} task{group.count === 1 ? "" : "s"}
                </p>
              </div>
              <IconButton
                size="sm"
                aria-label={`Remove tasks from ${group.name}`}
                onClick={() => setConfirmTarget(group.name)}
                disabled={removing}
                className="hover:text-red-500"
              >
                <Trash2 size={14} />
              </IconButton>
            </div>
          ))}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmTarget(ALL)}
            disabled={removing}
            className="w-full"
          >
            Remove all syllabus tasks
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Remove syllabus tasks?"
        body={`This removes ${removalPhrase(confirmTarget ?? ALL, confirmCount)}. You can upload again later.`}
        confirmLabel="Remove"
        destructive
        loading={removing}
        onConfirm={() => confirmTarget && handleDelete(confirmTarget)}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
