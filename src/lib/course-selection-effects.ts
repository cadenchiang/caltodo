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
 * Every task write here is scoped to the platform the edit happened on and
 * matched on the names sync actually stores (see course-selection-scope), so
 * removing a class from one platform cannot hide another platform's tasks or
 * a manual task.
 *
 * The effects are injected rather than imported so this stays a plain async
 * function over the task store, testable without React or Supabase.
 */

import { describeClasses } from "@/lib/class-sync-summary";
import type { CourseSelectionDiff } from "@/lib/course-selection-diff";
import {
  canonicalNameVariants,
  type CourseTaskSource,
  type SelectionSnapshot,
} from "@/lib/course-selection-scope";

/** The task-store operations a class change needs. */
export interface CourseSelectionEffects {
  /** Hides every task of one source belonging to these classes. Returns how many. */
  dismissTasksByCourseNames: (names: string[], source: CourseTaskSource) => Promise<number>;
  /** Un-hides one source's tasks hidden by an earlier removal. Returns how many. */
  undismissTasksByCourseNames: (names: string[], source: CourseTaskSource) => Promise<number>;
  /** Pulls assignments for classes that were just added. */
  syncAddedClasses: () => Promise<void>;
}

/** Which platform an edit happened on, and the selections around it. */
export interface CourseSelectionScope {
  /** The platform whose class list was edited. */
  source: CourseTaskSource;
  /** The full cross-platform selection before the edit was saved. */
  before: SelectionSnapshot;
  /** The full cross-platform selection after the edit was saved. */
  after: SelectionSnapshot;
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
 * @param scope - The platform edited and the selections before and after,
 *        used to derive the canonical names sync stored on the tasks.
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
  effects: CourseSelectionEffects,
  scope: CourseSelectionScope
): Promise<string> {
  const { addedNames, removedNames } = diff;
  if (addedNames.length === 0 && removedNames.length === 0) return "";

  const snapshots = [scope.before, scope.after];
  const hiddenCount =
    removedNames.length > 0
      ? await effects.dismissTasksByCourseNames(
          canonicalNameVariants(removedNames, snapshots),
          scope.source
        )
      : 0;
  const restoredCount =
    addedNames.length > 0
      ? await effects.undismissTasksByCourseNames(
          canonicalNameVariants(addedNames, snapshots),
          scope.source
        )
      : 0;
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
