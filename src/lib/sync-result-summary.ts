/**
 * Reading a sync result for the toasts that report it.
 *
 * The result toast and the background error toast each kept their own list
 * of sources, and each list lagged the engine: Blackboard was missing from
 * both and Classroom from one, so those integrations could fail on every sync
 * and the user only ever saw "All tasks are up to date" (audit H10). Both
 * toasts now read the sources from here.
 */

import type { SyncResult, SyncSourceResult } from "@/lib/types";

/** The sources a sync result reports on, in display order. */
const SOURCES: ReadonlyArray<{ key: keyof SyncResult; label: string }> = [
  { key: "canvas", label: "Canvas" },
  { key: "gradescope", label: "Gradescope" },
  { key: "pensieve", label: "Pensieve" },
  { key: "brightspace", label: "Brightspace" },
  { key: "blackboard", label: "Blackboard" },
  { key: "classroom", label: "Classroom" },
];

/**
 * Reads one source's entry off a result, tolerating a server that predates
 * the source and omits its key.
 *
 * @param result - A sync result as returned by the API.
 * @param key - Which source to read.
 * @returns The entry, or null when the result has no such key.
 */
function sourceResult(result: SyncResult, key: keyof SyncResult): SyncSourceResult | null {
  const value = result[key];
  if (!value || typeof value !== "object" || !("errors" in value)) return null;
  return value as SyncSourceResult;
}

/**
 * Every error message from every source, in display order.
 *
 * @param result - A sync result as returned by the API.
 * @returns Error strings; empty when every source succeeded.
 */
export function collectSyncErrors(result: SyncResult): string[] {
  const errors: string[] = [];
  for (const { key } of SOURCES) {
    const entry = sourceResult(result, key);
    if (entry) errors.push(...entry.errors);
  }
  return errors;
}

/**
 * "N from Platform" fragments for every source that synced something.
 *
 * @param result - A sync result as returned by the API.
 * @returns Fragments in display order; empty when nothing was synced.
 */
export function describeSyncedCounts(result: SyncResult): string[] {
  const parts: string[] = [];
  for (const { key, label } of SOURCES) {
    const entry = sourceResult(result, key);
    if (entry && entry.synced > 0) parts.push(`${entry.synced} from ${label}`);
  }
  return parts;
}
