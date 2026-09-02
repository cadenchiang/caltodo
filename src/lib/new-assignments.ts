/**
 * Which synced assignments a sync actually brought in.
 *
 * Lives outside TaskContext because the answer depends on a snapshot taken
 * *before* the refetch, and the caller there holds one ref that is both the
 * snapshot and the destination for the new list. Reading it after the refetch
 * compares the fresh tasks against themselves, which is always empty.
 *
 * @module new-assignments
 */

import type { Task } from "@/lib/types";

/**
 * Finds the synced tasks present after a sync that were not there before.
 *
 * @param before - The task list as it stood before the sync's refetch.
 * @param after - The task list after it.
 * @returns Tasks in `after` that carry a `source` and whose id is new. Order
 *          follows `after`.
 * @remarks Only sourced tasks count: a task the user typed themselves is not
 *          something a sync "found", and announcing it would be wrong. Ids
 *          are compared rather than contents, so an assignment whose title or
 *          due date merely changed is not reported as new.
 */
export function findNewAssignments(before: Task[], after: Task[]): Task[] {
  const beforeIds = new Set(before.map((t) => t.id));
  return after.filter((t) => t.source && !beforeIds.has(t.id));
}
