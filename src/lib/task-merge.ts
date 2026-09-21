/**
 * Pure list operations behind TaskContext's optimistic writes.
 *
 * Every rule about how a fresh server list is reconciled with local state,
 * how a temp row becomes a real one, and how a failed edit is rolled back
 * lives here so it can be tested without React.
 *
 * @module task-merge
 */

import type { Task } from "@/lib/types";

/** Prefix on the id of a row that exists only locally, pending insert. */
const TEMP_ID_PREFIX = "temp-";

/**
 * Reads an ISO timestamp as epoch milliseconds.
 *
 * @param iso - The timestamp, or nothing
 * @returns Milliseconds, or 0 when there is no usable timestamp
 */
function ts(iso: string | null | undefined): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Reconciles a freshly fetched list with the local one.
 *
 * A local row wins over the server's copy in exactly two cases: an edit to
 * it is still in flight (its id is in `pendingIds`), or its `updated_at`,
 * which is always the server's own stamp from the last successful write, is
 * newer than the fetched row's (the fetch's snapshot predates that write).
 * Temp rows that the server does not know about yet are kept at the front.
 *
 * @param prev - The local list, normally the baseline ref
 * @param fresh - The rows the server just returned
 * @param pendingIds - Ids with an update still in flight
 * @returns The merged list, in the server's order with temp rows first
 * @remarks An empty `prev` returns `fresh` as-is, so the first fetch after a
 *          cold start never has to reconcile anything.
 */
export function mergeFetchedTasks(
  prev: Task[],
  fresh: Task[],
  pendingIds: ReadonlySet<string>,
): Task[] {
  if (prev.length === 0) return fresh;
  const freshIds = new Set(fresh.map((t) => t.id));
  const localById = new Map(prev.map((t) => [t.id, t]));
  const reconciled = fresh.map((row) => {
    const local = localById.get(row.id);
    if (!local) return row;
    if (pendingIds.has(row.id)) return local;
    return ts(local.updated_at) > ts(row.updated_at) ? local : row;
  });
  const tempLocals = prev.filter((t) => t.id.startsWith(TEMP_ID_PREFIX) && !freshIds.has(t.id));
  return [...tempLocals, ...reconciled];
}

/**
 * Swaps an optimistic temp row for the row the insert returned.
 *
 * @param prev - The current list
 * @param tempId - The id the temp row was added under
 * @param real - The inserted row from the server
 * @returns The list with the temp row replaced, or with the temp row simply
 *          dropped when a concurrent fetch already brought the real row in
 *          (so the task is never shown twice)
 */
export function replaceTempTask(prev: Task[], tempId: string, real: Task): Task[] {
  if (prev.some((t) => t.id === real.id)) {
    return prev.filter((t) => t.id !== tempId);
  }
  return prev.map((t) => (t.id === tempId ? real : t));
}

/**
 * Applies an optimistic edit to one row without touching `updated_at`.
 *
 * The stamp is left as the server last set it so the merge above cannot be
 * fooled by a client clock; the real stamp arrives with the write's response.
 *
 * @param prev - The current list
 * @param id - The row to edit
 * @param updates - The fields being written
 * @returns The list with the edit applied
 */
export function applyOptimisticEdit(prev: Task[], id: string, updates: Partial<Task>): Task[] {
  return prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
}

/**
 * Puts a row back the way it was before a failed edit.
 *
 * @param prev - The current list
 * @param snapshot - The row as captured before the edit
 * @returns The list with the snapshot in the row's place; unchanged when the
 *          row is no longer in the list (deleted meanwhile)
 */
export function restoreTaskSnapshot(prev: Task[], snapshot: Task): Task[] {
  if (!prev.some((t) => t.id === snapshot.id)) return prev;
  return prev.map((t) => (t.id === snapshot.id ? snapshot : t));
}

/**
 * Records the server's `updated_at` on a row after its write succeeded.
 *
 * @param prev - The current list
 * @param id - The row that was written
 * @param updatedAt - The stamp the server returned
 * @returns The list with the stamp applied
 */
export function applyServerStamp(prev: Task[], id: string, updatedAt: string): Task[] {
  return prev.map((t) => (t.id === id ? { ...t, updated_at: updatedAt } : t));
}
