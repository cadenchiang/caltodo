/**
 * Shared helpers for the global Pomodoro tab-title countdown.
 *
 * Two independent timers may persist to localStorage:
 *  - a legacy focus-session (`caltodo_focus_session`) stored a wall-clock
 *    `endTime`, so remaining time is `endTime - now` (no longer written since
 *    the standalone Focus page was removed, but still read for back-compat)
 *  - the home-screen widget (`caltodo_pomodoro_state`) stores `secondsLeft`
 *    plus the `savedAt` timestamp of the last write, so remaining time is
 *    `secondsLeft - elapsedSince(savedAt)`
 *
 * Pure functions here take raw JSON strings + `now` so they are unit-testable
 * without a DOM; `activePomodoroRemaining` plugs in any reader (localStorage
 * in the app, a stub in tests).
 */

/** Legacy localStorage key from the removed standalone Focus page; still read for back-compat. */
export const FOCUS_SESSION_KEY = "caltodo_focus_session";
/** localStorage key used by the home Pomodoro widget (see PomodoroWidget.tsx). */
export const WIDGET_POMO_KEY = "caltodo_pomodoro_state";

/**
 * Formats seconds as MM:SS (e.g. 1500 -> "25:00").
 *
 * @param totalSeconds - Seconds remaining; negative values clamp to 0.
 */
export function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Remaining seconds for the Pomodoro page's persisted session.
 *
 * @param raw - Raw localStorage JSON (or null when absent).
 * @param now - Current wall-clock time in ms.
 * @returns Remaining seconds while running, otherwise null (paused, expired,
 *   missing, or malformed state).
 */
export function remainingFromFocusSession(raw: string | null, now: number): number | null {
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as { running?: boolean; endTime?: number | null };
    if (!state?.running || typeof state.endTime !== "number") return null;
    const remaining = Math.round((state.endTime - now) / 1000);
    return remaining > 0 ? remaining : null;
  } catch {
    return null;
  }
}

/**
 * Remaining seconds for the home widget's persisted timer.
 *
 * @param raw - Raw localStorage JSON (or null when absent).
 * @param now - Current wall-clock time in ms.
 * @returns Remaining seconds while running, otherwise null (paused, expired,
 *   missing, or malformed state).
 */
export function remainingFromWidgetState(raw: string | null, now: number): number | null {
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as {
      running?: boolean;
      secondsLeft?: number;
      savedAt?: number;
    };
    if (!state?.running || typeof state.secondsLeft !== "number" || typeof state.savedAt !== "number") {
      return null;
    }
    const elapsed = Math.floor((now - state.savedAt) / 1000);
    const remaining = state.secondsLeft - elapsed;
    return remaining > 0 ? remaining : null;
  } catch {
    return null;
  }
}

/**
 * Remaining seconds of whichever Pomodoro timer is running, preferring the
 * one closest to finishing when both are.
 *
 * @param read - Storage reader (localStorage.getItem in the app, stub in tests).
 * @param now - Current wall-clock time in ms.
 * @returns Remaining seconds, or null when no timer is running.
 */
export function activePomodoroRemaining(
  read: (key: string) => string | null,
  now: number,
): number | null {
  const candidates = [
    remainingFromFocusSession(read(FOCUS_SESSION_KEY), now),
    remainingFromWidgetState(read(WIDGET_POMO_KEY), now),
  ].filter((value): value is number => value !== null);
  if (candidates.length === 0) return null;
  return Math.min(...candidates);
}
