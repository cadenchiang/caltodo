"use client";

import { useMemo, useState } from "react";
import { GitMerge } from "lucide-react";
import type { Task } from "@/lib/types";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import { findDuplicatesFor } from "@/lib/duplicate-finder";

interface TaskDuplicatesBannerProps {
  /** The task being viewed in the detail panel. */
  task: Task;
}

/**
 * Detects likely duplicates of `task` from other integrations
 * (Canvas vs Gradescope, etc.) and offers a one-click merge action.
 *
 * Renders nothing when no duplicates are found.
 *
 * @param task - The task currently being viewed
 */
export default function TaskDuplicatesBanner({ task }: TaskDuplicatesBannerProps) {
  const { tasks, mergeDuplicates } = useTaskContext();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const duplicates = useMemo(() => findDuplicatesFor(task, tasks), [task, tasks]);

  if (duplicates.length === 0) return null;

  const sourceLabels = duplicates
    .map((d) => (d.source ? d.source.charAt(0).toUpperCase() + d.source.slice(1) : "Other"))
    .join(", ");

  async function handleMerge() {
    if (busy) return;
    setBusy(true);
    try {
      await mergeDuplicates(task.id, duplicates.map((d) => d.id));
      showToast(
        duplicates.length === 1
          ? "Merged 1 duplicate"
          : `Merged ${duplicates.length} duplicates`,
      );
    } catch (err) {
      console.warn("mergeDuplicates failed", err);
      showToast("Could not merge duplicates");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 flex items-start gap-3">
      <GitMerge size={18} className="mt-0.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          {duplicates.length === 1 ? "Found a duplicate" : `Found ${duplicates.length} duplicates`}
          <span className="text-muted-foreground"> on {sourceLabels}.</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Merge to keep this task and append the other submission link to the description.
        </p>
      </div>
      <button
        type="button"
        onClick={handleMerge}
        disabled={busy}
        className="text-sm font-medium text-foreground bg-background border border-border rounded-md px-3 py-1.5 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "Merging..." : "Merge"}
      </button>
    </div>
  );
}
