/**
 * Remembers default tags the user has deleted.
 *
 * The tag list is derived from tasks, but three defaults ("Canvas",
 * "Gradescope", "Pensive") are always seeded so a new account has something
 * to pick. Without this store, deleting one of those would strip it from
 * every task and then immediately seed it back, so the delete would look
 * broken. Stored per device, like the week-start preference.
 *
 * @module hidden-tags
 */

/** localStorage key holding the JSON array of hidden default tags. */
const STORAGE_KEY = "caltodo_hidden_tags";

/**
 * Reads the hidden set.
 *
 * @returns Lowercased tag names the user has deleted; empty when unavailable
 * @remarks Never throws. Server rendering, private mode, and corrupt values
 *          all yield an empty set so the full default list is shown.
 */
export function readHiddenTags(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string").map((v) => v.toLowerCase()));
  } catch {
    return new Set();
  }
}

/**
 * Adds a tag to the hidden set.
 *
 * @param tag - Tag name as displayed; matching is case-insensitive
 * @returns The updated hidden set, even if persisting failed
 */
export function hideTag(tag: string): Set<string> {
  const next = readHiddenTags();
  next.add(tag.toLowerCase());
  write(next);
  return next;
}

/**
 * Removes a tag from the hidden set, so it can be suggested again.
 *
 * @param tag - Tag name as displayed; matching is case-insensitive
 * @returns The updated hidden set, even if persisting failed
 */
export function unhideTag(tag: string): Set<string> {
  const next = readHiddenTags();
  next.delete(tag.toLowerCase());
  write(next);
  return next;
}

/**
 * Persists the hidden set.
 *
 * @param set - Lowercased tag names to store
 * @remarks Storage failures are swallowed: a full quota must not break the
 *          delete the user just performed, which has already hit the database.
 */
function write(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // Quota or private mode. The tag is still removed from every task.
  }
}
