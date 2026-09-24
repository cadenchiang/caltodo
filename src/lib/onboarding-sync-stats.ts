/**
 * Turns a sync result into the numbers the onboarding recap shows, including
 * the failures. The recap used to read only the synced counts, so a source
 * whose credentials were rejected still produced "You're all set" with a
 * zero next to it.
 */

import type { SyncResult, SyncSourceResult } from "@/lib/types";
import { PROVIDER_LABELS, type ProviderKey } from "@/lib/copy";

/** One synced source and how many assignments it contributed. */
export interface SyncSourceCount {
  provider: ProviderKey;
  label: string;
  count: number;
}

/** One source that reported at least one error. */
export interface SyncSourceError {
  provider: ProviderKey;
  label: string;
  message: string;
}

/** Everything the recap renders. */
export interface SyncStats {
  /** Assignments across every source plus syllabus imports. */
  total: number;
  /** Sources that synced at least one assignment, in display order. */
  perSource: SyncSourceCount[];
  /** Distinct class names the user selected or imported. */
  courses: string[];
  /** Sources whose sync reported errors, in display order. */
  sourceErrors: SyncSourceError[];
  /**
   * Message when the sync request itself failed (network, 500). Null when
   * the request completed, even if individual sources reported errors.
   */
  syncError: string | null;
}

/** Sources a result reports on, in display order, keyed by result field. */
const SOURCES: ReadonlyArray<{ key: keyof SyncResult & ProviderKey }> = [
  { key: "canvas" },
  { key: "gradescope" },
  { key: "pensieve" },
  { key: "brightspace" },
  { key: "blackboard" },
  { key: "classroom" },
];

/**
 * Reads one source's entry, tolerating a server that omits newer sources.
 *
 * @param result - The sync result
 * @param key - Which source to read
 * @returns The entry, or null when the result has no such key
 */
function sourceResult(result: SyncResult, key: keyof SyncResult): SyncSourceResult | null {
  const value = result[key];
  if (!value || typeof value !== "object" || !("synced" in value)) return null;
  return value as SyncSourceResult;
}

export interface BuildSyncStatsInput {
  /** Latest result from the sync endpoint, or null when none arrived. */
  syncResult: SyncResult | null;
  /** Error from the sync request itself, or null. */
  syncError: string | null;
  /** Assignments imported from syllabus PDFs, which bypass the sync engine. */
  syllabus: { count: number; courses: string[] };
  /** Names of the classes the user selected during the flow. */
  selectedCourseNames: string[];
}

/**
 * Builds recap stats from a sync result and the flow's own imports.
 *
 * @param input - See BuildSyncStatsInput
 * @returns Stats, or null when there is nothing at all to report (no
 *          result, no error, no syllabus import)
 * @remarks A syllabus-only setup still returns stats, and a failed request
 *          returns stats with syncError set so the recap can say so.
 */
export function buildSyncStats(input: BuildSyncStatsInput): SyncStats | null {
  const { syncResult, syncError, syllabus, selectedCourseNames } = input;
  if (!syncResult && syllabus.count === 0 && !syncError) return null;

  let total = syllabus.count;
  const perSource: SyncSourceCount[] = [];
  const sourceErrors: SyncSourceError[] = [];

  if (syncResult) {
    for (const { key } of SOURCES) {
      const entry = sourceResult(syncResult, key);
      if (!entry) continue;
      const label = PROVIDER_LABELS[key];
      total += entry.synced;
      if (entry.synced > 0) perSource.push({ provider: key, label, count: entry.synced });
      if (entry.errors.length > 0) {
        sourceErrors.push({ provider: key, label, message: entry.errors.join(" ") });
      }
    }
  }
  if (syllabus.count > 0) {
    perSource.push({ provider: "syllabus", label: PROVIDER_LABELS.syllabus, count: syllabus.count });
  }

  const courses = Array.from(new Set([...selectedCourseNames, ...syllabus.courses]));
  return { total, perSource, courses, sourceErrors, syncError };
}

/**
 * Whether the recap may call the setup a success.
 *
 * @param stats - Built stats, or null when nothing was synced
 * @returns True only when the request completed and no source errored
 */
export function isCleanSync(stats: SyncStats | null): boolean {
  if (!stats) return true;
  return stats.syncError === null && stats.sourceErrors.length === 0;
}
