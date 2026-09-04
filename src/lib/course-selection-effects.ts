/**
 * What has to happen to a student's tasks when their class selection changes.
 *
 * Writing the selection column is only half of a class edit. The other half is
 * the tasks that selection already produced: a class the student removed has
 * assignments sitting in their inbox, and a class they put back has
 * assignments hidden from an earlier removal. Settings used to do only the
 * write, which is why removing a class appeared to do nothing and editing
 * classes could only ever add.
 *
 * The effects are injected rather than imported so this stays a plain async
 * function over the task store, testable without React or Supabase.
 */

import { describeClasses } from "@/lib/class-sync-summary";
import type { CourseSelectionDiff } from "@/lib/course-selection-diff";

/** The task-store operations a class change needs. */
export interface CourseSelectionEffects {
  /** Hides every task belonging to these classes. Returns how many. */
  dismissTasksByCourseNames: (names: string[]) => Promise<number>;
  /** Un-hides tasks hidden by an earlier removal. Returns how many. */
  undismissTasksByCourseNames: (names: string[]) => Promise<number>;
  /** Pulls assignments for classes that were just added. */
  syncAddedClasses: () => Promise<void>;
}

/**
 * Applies a saved class selection to the tasks it governs.
 *
 * Removals are hidden rather than deleted, matching the rest of the app: a
 * student who removes a class by mistake gets those tasks back by re-adding
 * it, which is what the un-hide step is for.
 *
 * @param diff - Names that entered and left the selection.
 * @param effects - Task-store operations to run.
 * @returns A one-line summary for a toast, or "" when nothing changed.
 * @throws Whatever an effect throws. The selection is already saved by the
 *         time this runs, so callers should report the failure without
 *         rolling back their view of the selection.
 * @remarks Order is removals, then restorations, then the sync. Restoring
 *          before syncing means a re-added class shows its old tasks
 *          immediately instead of waiting on a network round trip, and the
 *          sync then fills in anything that changed while it was gone.
 */
export async function applyCourseSelectionChange(
  diff: CourseSelectionDiff,
  effects: CourseSelectionEffects
): Promise<string> {
  const { addedNames, removedNames } = diff;
  if (addedNames.length === 0 && removedNames.length === 0) return "";

  const hiddenCount =
    removedNames.length > 0 ? await effects.dismissTasksByCourseNames(removedNames) : 0;
  const restoredCount =
    addedNames.length > 0 ? await effects.undismissTasksByCourseNames(addedNames) : 0;
  if (addedNames.length > 0) await effects.syncAddedClasses();

  const parts: string[] = [];

  if (removedNames.length > 0) {
    const removed = describeClasses(removedNames);
    parts.push(
      hiddenCount > 0
        ? `Hid ${hiddenCount} ${plural(hiddenCount, "task")} from ${removed}`
        : `Removed ${removed}`
    );
  }

  if (addedNames.length > 0) {
    const added = describeClasses(addedNames);
    // "Syncing" rather than a count: the sync above runs in the background and
    // has not reported back yet, so any number here would be invented.
    parts.push(
      restoredCount > 0
        ? `Restored ${restoredCount} ${plural(restoredCount, "task")} from ${added}`
        : `Syncing ${added}`
    );
  }

  return parts.length > 0 ? parts.join(". ") + "." : "";
}

/**
 * Pluralises a bare noun by count.
 *
 * @param n - The count.
 * @param noun - Singular noun; pluralised by appending "s".
 * @returns The correctly numbered noun.
 */
function plural(n: number, noun: string): string {
  return n === 1 ? noun : `${noun}s`;
}
