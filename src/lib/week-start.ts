/**
 * User preference for which day the week starts on.
 *
 * Calendar views were hardcoded to Monday. Students who plan their week from
 * Sunday read the grid off by a day, so this makes it a choice.
 *
 * Persisted the same way as the theme preference: localStorage as the fast
 * path, mirrored into auth.user_metadata so it survives iOS Safari's 7-day
 * storage eviction and follows the user across devices.
 *
 * Exposed through useSyncExternalStore rather than a context provider, so any
 * calendar component can read it without threading a provider through the tree
 * and every subscriber re-renders the moment it changes.
 *
 * @module week-start
 */

/** Sunday or Monday, matching date-fns' `weekStartsOn` values. */
export type WeekStart = 0 | 1;

/** localStorage key holding the preference. */
const STORAGE_KEY = "caltodo_week_start";

/** auth.user_metadata key mirroring {@link STORAGE_KEY}. */
const META_KEY = "week_start";

/** Monday, preserving the behavior every existing user already sees. */
export const DEFAULT_WEEK_START: WeekStart = 1;

/** Weekday labels in calendar order, starting Monday. */
const LABELS_MONDAY_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Subscribers to notify when the preference changes. */
const listeners = new Set<() => void>();

/** Cached snapshot; useSyncExternalStore requires a stable reference. */
let snapshot: WeekStart = DEFAULT_WEEK_START;

/** Whether {@link snapshot} has been primed from storage yet. */
let hydrated = false;

/**
 * Narrows an unknown stored value to a valid WeekStart.
 *
 * @param value - Raw value from storage or user metadata
 * @returns The valid preference, or null when unrecognized
 */
export function parseWeekStart(value: unknown): WeekStart | null {
  if (value === 0 || value === 1) return value;
  if (value === "0") return 0;
  if (value === "1") return 1;
  return null;
}

/**
 * Rotates the weekday labels to match the preference.
 *
 * @param weekStart - 0 for Sunday, 1 for Monday
 * @returns Seven short labels in display order
 * @remarks Returned fresh each call; callers memoize if they care.
 */
export function weekdayLabels(weekStart: WeekStart): string[] {
  if (weekStart === 1) return [...LABELS_MONDAY_FIRST];
  // Sunday first: move the trailing "Sun" to the front.
  return ["Sun", ...LABELS_MONDAY_FIRST.slice(0, 6)];
}

/**
 * Reads the stored preference, falling back to the default.
 *
 * @returns The persisted preference, or {@link DEFAULT_WEEK_START}
 * @remarks Safe on the server and when storage is unavailable (private mode).
 */
function readStored(): WeekStart {
  if (typeof window === "undefined") return DEFAULT_WEEK_START;
  try {
    return parseWeekStart(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_WEEK_START;
  } catch {
    return DEFAULT_WEEK_START;
  }
}

/** Notifies every subscriber that the snapshot changed. */
function emit(): void {
  for (const listener of listeners) listener();
}

/**
 * Subscribes to preference changes.
 *
 * @param listener - Called after every change
 * @returns Unsubscribe function
 * @remarks Also listens for `storage` events so a change made in one tab
 *          reaches the others.
 */
export function subscribeWeekStart(listener: () => void): () => void {
  if (!hydrated) {
    snapshot = readStored();
    hydrated = true;
  }
  listeners.add(listener);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    const next = parseWeekStart(e.newValue) ?? DEFAULT_WEEK_START;
    if (next !== snapshot) {
      snapshot = next;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Returns the current preference.
 *
 * @returns 0 for Sunday, 1 for Monday
 * @remarks Reads storage once, then serves a cached value so the reference
 *          stays stable between renders.
 */
export function getWeekStartSnapshot(): WeekStart {
  if (!hydrated && typeof window !== "undefined") {
    snapshot = readStored();
    hydrated = true;
  }
  return snapshot;
}

/**
 * Server snapshot for useSyncExternalStore.
 *
 * @returns The default, so server and first client render agree
 */
export function getWeekStartServerSnapshot(): WeekStart {
  return DEFAULT_WEEK_START;
}

/**
 * Stores a new preference and notifies subscribers.
 *
 * @param value - 0 for Sunday, 1 for Monday
 * @returns Nothing
 * @remarks The user_metadata mirror is fire-and-forget: a failed sync must
 *          never block the UI, and localStorage already holds the choice.
 */
export function setWeekStart(value: WeekStart): void {
  snapshot = value;
  hydrated = true;

  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Private mode or quota — the in-memory snapshot still applies this session.
  }

  emit();
  void mirrorToMetadata(value);
}

/**
 * Mirrors the preference into auth.user_metadata.
 *
 * @param value - Preference to store remotely
 * @returns Nothing; failures are swallowed
 */
async function mirrorToMetadata(value: WeekStart): Promise<void> {
  if (typeof document === "undefined") return;
  // Skip the supabase-js import entirely for signed-out visitors.
  if (!/(^|;\s*)sb-[^=]*auth-token/.test(document.cookie)) return;

  try {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.updateUser({ data: { [META_KEY]: value } });
  } catch {
    // Offline or signed out — localStorage remains the source of truth.
  }
}

/**
 * Adopts a preference previously mirrored into user_metadata.
 *
 * @param metadata - The signed-in user's `user_metadata`
 * @returns Nothing
 * @remarks Only applies when localStorage has no value, so a deliberate choice
 *          on this device always wins over the remote copy.
 */
export function hydrateWeekStartFromMetadata(metadata: Record<string, unknown>): void {
  const remote = parseWeekStart(metadata?.[META_KEY]);
  if (remote === null) return;

  try {
    if (localStorage.getItem(STORAGE_KEY) !== null) return;
    localStorage.setItem(STORAGE_KEY, String(remote));
  } catch {
    // Storage unavailable — still apply it in memory for this session.
  }

  if (remote !== snapshot) {
    snapshot = remote;
    hydrated = true;
    emit();
  }
}
