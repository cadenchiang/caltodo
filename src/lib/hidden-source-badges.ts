/**
 * Remembers source badges the user has dismissed.
 *
 * A source badge ("bCourses", "Gradescope", "Pensive") is not a tag: it is
 * derived from the task's `source` column and says where the assignment came
 * from. It sits in the tag row all the same, and a user who does not want it
 * there had no way to remove it - the pill was not in the tag list, so
 * deleting it was impossible and it read as broken.
 *
 * Dismissing one hides that badge on every task, per device, exactly as
 * {@link module:hidden-tags} does for a seeded default tag. Nothing about the
 * task changes: the assignment still came from bCourses, and clearing the
 * store brings the badge back.
 *
 * @module hidden-source-badges
 */

/** localStorage key holding the JSON array of dismissed badge labels. */
const STORAGE_KEY = "caltodo_hidden_source_badges";

/**
 * The set as React last saw it.
 *
 * `useSyncExternalStore` compares snapshots by identity and re-renders in a
 * loop if a new object comes back every time, so the set is built once and
 * replaced only by a write.
 */
let snapshot: Set<string> | null = null;

/** Components to notify when a badge is dismissed or restored. */
const listeners = new Set<() => void>();

/** The snapshot handed to the server, where there is no localStorage. */
const SERVER_SNAPSHOT: Set<string> = new Set();

/** Rebuilds the cached snapshot and wakes every subscriber. */
function publish(): void {
  snapshot = readHiddenSourceBadges();
  for (const listener of listeners) listener();
}

/**
 * Subscribes to dismissals, for `useSyncExternalStore`.
 *
 * @param listener - Called after any change to the set
 * @returns Unsubscribe function
 */
export function subscribeHiddenSourceBadges(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

/**
 * The current set, stable between writes.
 *
 * @returns The dismissed set; the same object until something changes
 */
export function getHiddenSourceBadges(): Set<string> {
  if (snapshot === null) snapshot = readHiddenSourceBadges();
  return snapshot;
}

/**
 * The set as the server sees it: empty, because there is no device there.
 *
 * @returns A shared empty set, so the identity is stable across renders
 * @remarks Server and first client render therefore agree, and the real set
 *          arrives on the pass straight after hydration.
 */
export function getServerHiddenSourceBadges(): Set<string> {
  return SERVER_SNAPSHOT;
}

/**
 * Reads the dismissed set.
 *
 * @returns Lowercased badge labels the user has dismissed; empty when
 *          unavailable
 * @remarks Never throws. Server rendering, private mode, and corrupt values
 *          all yield an empty set, which shows every badge - the safe default,
 *          since a badge is information about where the task came from.
 */
export function readHiddenSourceBadges(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((v): v is string => typeof v === "string").map((v) => v.toLowerCase())
    );
  } catch {
    return new Set();
  }
}

/**
 * Dismisses a badge so it stops appearing.
 *
 * @param label - Badge label as displayed; matching is case-insensitive
 * @returns The updated dismissed set, even if persisting failed
 */
export function hideSourceBadge(label: string): Set<string> {
  const next = readHiddenSourceBadges();
  next.add(label.toLowerCase());
  write(next);
  publish();
  return next;
}

/**
 * Brings a dismissed badge back.
 *
 * @param label - Badge label as displayed; matching is case-insensitive
 * @returns The updated dismissed set, even if persisting failed
 */
export function showSourceBadge(label: string): Set<string> {
  const next = readHiddenSourceBadges();
  next.delete(label.toLowerCase());
  write(next);
  publish();
  return next;
}

/**
 * Drops the badges the user has dismissed from a list.
 *
 * @param badges - Badges as derived from the task
 * @param hidden - The dismissed set, from {@link readHiddenSourceBadges}
 * @returns Only the badges still wanted
 * @remarks Takes the set rather than reading it, so a caller rendering many
 *          tasks reads localStorage once instead of once per badge.
 */
export function visibleSourceBadges<T extends { label: string }>(
  badges: T[],
  hidden: Set<string>,
): T[] {
  return badges.filter((b) => !hidden.has(b.label.toLowerCase()));
}

/**
 * Persists the dismissed set.
 *
 * @param set - Lowercased badge labels to store
 * @remarks Storage failures are swallowed: a full quota must not break the
 *          dismissal the user just performed. The badge reappears on reload,
 *          which is the correct failure for a purely cosmetic preference.
 */
function write(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // Quota or private mode. Nothing else depends on this store.
  }
}
