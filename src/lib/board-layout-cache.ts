/**
 * Board layout cache — stale-while-revalidate localStorage cache for
 * the Home dashboard. Enables instant first paint on repeat visits
 * while the server fetch reconciles in the background.
 *
 * Safety rails:
 *   - Versioned envelope (SCHEMA_VERSION bump invalidates all caches).
 *   - Reads reject malformed JSON and version mismatches.
 *   - Writes swallow quota/availability errors.
 *   - clearLayoutCache() called on sign-out to prevent cross-user leakage.
 *
 * The server remains the source of truth: see useWidgetLayout.ts, the
 * post-cache server fetch unconditionally overwrites cached state.
 *
 * @module board-layout-cache
 */

import { STORAGE_KEY, SCHEMA_VERSION, type PersistedLayout } from "@/lib/board-layout-types";

/**
 * Envelope stored in localStorage. Wraps the layout with a version tag
 * (for schema invalidation) and optional userId (informational — actual
 * cross-user isolation is handled by clearLayoutCache on sign-out).
 */
interface CachedEnvelope {
  version: number;
  userId?: string;
  data: PersistedLayout;
}

/**
 * Reads the cached layout for instant first paint.
 *
 * Returns null on: SSR, missing key, corrupt JSON, version mismatch,
 * or missing required fields. A null return causes the hook to show
 * the skeleton until the server fetch resolves.
 *
 * @returns The cached layout, or null if unavailable/stale.
 */
export function readPersistedLayout(): PersistedLayout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedEnvelope;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== SCHEMA_VERSION) return null;
    if (!parsed.data || !Array.isArray(parsed.data.widgets) || !parsed.data.layouts) return null;

    return parsed.data;
  } catch (err) {
    console.warn("[board-layout-cache] readPersistedLayout failed:", err);
    return null;
  }
}

/**
 * Writes the layout to localStorage. Silent no-op on SSR, quota errors,
 * or any other storage failure — next successful write will recover.
 *
 * @param data - The full PersistedLayout to cache.
 * @param userId - Optional Supabase user id stored for debuggability.
 */
export function writeLayoutCache(data: PersistedLayout, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: CachedEnvelope = { version: SCHEMA_VERSION, userId, data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (err) {
    console.warn("[board-layout-cache] writeLayoutCache failed:", err);
  }
}

/**
 * Removes the cached layout. Called on sign-out to prevent the next
 * user on this device from briefly seeing the previous user's board.
 */
export function clearLayoutCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[board-layout-cache] clearLayoutCache failed:", err);
  }
}
