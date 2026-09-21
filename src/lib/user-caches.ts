/**
 * Clears every per-user cache the app keeps in web storage.
 *
 * Several screens hydrate from localStorage before their fetch lands (tasks,
 * profile, friends, calendar status). On a shared machine that means the
 * previous account's data paints for the next person unless sign-out drops
 * it. Device preferences (theme, view modes, filters, dismissed hints) are
 * not caches of user data and are left alone.
 *
 * @module user-caches
 */

import { clearLayoutCache } from "@/lib/board-layout-cache";
import { clearSWRCache } from "@/components/SWRProvider";

/** Exact localStorage keys holding one user's data. */
export const USER_CACHE_KEYS: readonly string[] = [
  "caltodo_tasks_cache",
  // Sync clock. Left behind, the next account's first auto-sync is skipped
  // for the cooldown window because the previous account synced recently.
  "caltodo_last_auto_sync_at",
  "caltodo_user_profile",
  "caltodo_friends_cache",
  "caltodo_suggestions_cache",
  "caltodo_credentials_cache",
  "caltodo_calendar_token_cache",
  "caltodo_course_totals",
  "caltodo_sync_course_selections",
  "caltodo_hidden_nav_items",
  "gcal_status",
];

/** localStorage key prefixes for per-user widget and board state. */
export const USER_CACHE_KEY_PREFIXES: readonly string[] = [
  "gcal-widget-cache:",
  "caltodo_board_completed_",
];

/** sessionStorage key prefixes holding one user's data. None at present. */
export const USER_SESSION_KEY_PREFIXES: readonly string[] = [];

/**
 * Removes every key in `storage` that matches the given names or prefixes.
 *
 * @param storage - localStorage or sessionStorage
 * @param keys - Exact keys to remove
 * @param prefixes - Remove every key starting with one of these
 * @returns The keys removed, for the log line
 */
function removeMatching(storage: Storage, keys: readonly string[], prefixes: readonly string[]): string[] {
  const removed: string[] = [];
  const exact = new Set(keys);
  // Collect first: removing while iterating by index skips entries.
  const present: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key !== null) present.push(key);
  }
  for (const key of present) {
    if (exact.has(key) || prefixes.some((p) => key.startsWith(p))) {
      storage.removeItem(key);
      removed.push(key);
    }
  }
  return removed;
}

/**
 * Drops all per-user caches. Call on sign-out, before navigating away.
 *
 * @returns Nothing. Safe to call on the server (no-op) and when storage is
 *          unavailable or throws (logged, never rethrown, so sign-out still
 *          completes).
 */
export function clearUserCaches(): void {
  if (typeof window === "undefined") return;
  clearLayoutCache();
  clearSWRCache();
  try {
    const local = removeMatching(window.localStorage, USER_CACHE_KEYS, USER_CACHE_KEY_PREFIXES);
    const session = removeMatching(window.sessionStorage, [], USER_SESSION_KEY_PREFIXES);
    console.info("[user-caches] cleared on sign-out", { local: local.length, session: session.length });
  } catch (err) {
    console.error("[user-caches] could not clear storage", {
      error: err instanceof Error ? err.message : String(err),
      impact: "previous account's cached data may paint for the next sign-in on this device",
    });
  }
}
