/**
 * Board layout cache — intentionally disabled.
 *
 * Previously used localStorage to cache layouts for instant first-paint,
 * but this caused divergence across dev server ports (each port is a
 * separate origin with its own storage) and left stale widget IDs that
 * no longer matched the user's current widget set.
 *
 * Now the server is the *only* source of truth: reads and writes here
 * are no-ops. First paint waits for the server fetch; saves go only
 * to the server via `debouncedServerSave`.
 *
 * @module board-layout-cache
 */

import { STORAGE_KEY, type PersistedLayout } from "@/lib/board-layout-types";

/**
 * No-op: returns null so the hook always waits for the server.
 * Also proactively deletes any stale legacy entry from a prior session.
 */
export function readPersistedLayout(): PersistedLayout | null {
  if (typeof window === "undefined") return null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-critical
  }
  return null;
}

/**
 * No-op: layouts persist to the server only.
 * Parameter kept for call-site compatibility.
 */
export function writeLayoutCache(_data: PersistedLayout): void {
  // Intentionally empty — server is the single source of truth.
}
