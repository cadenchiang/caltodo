/**
 * Tracks the last "real" app route the user was on before entering Settings,
 * so the Settings back button returns them there (calendar, home, today, …)
 * instead of always dumping them at the inbox.
 *
 * Stored in sessionStorage (per-tab, cleared when the tab closes) as a full
 * path + query string so filters/view state on the origin page are preserved.
 */

const RETURN_KEY = "caltodo_settings_return";
const FALLBACK = "/app/inbox";

/** Routes we never want to "return" to (you don't come back to Settings from Settings). */
function isReturnable(path: string): boolean {
  return (
    path.startsWith("/app/") &&
    !path.startsWith("/app/settings") &&
    !path.startsWith("/app/onboarding")
  );
}

/**
 * Records the current app route as the place to return to from Settings.
 * No-ops for settings/onboarding routes so they never overwrite a real origin.
 *
 * @param pathWithQuery - Full path incl. search (e.g. "/app/calendar?view=week")
 */
export function recordAppRoute(pathWithQuery: string): void {
  try {
    if (!isReturnable(pathWithQuery)) return;
    sessionStorage.setItem(RETURN_KEY, pathWithQuery);
  } catch {
    /* sessionStorage unavailable; fall back silently */
  }
}

/**
 * Returns the route the Settings back button should navigate to.
 * Falls back to the inbox when nothing valid was recorded.
 */
export function getSettingsReturnPath(): string {
  try {
    const stored = sessionStorage.getItem(RETURN_KEY);
    if (stored && isReturnable(stored)) return stored;
  } catch {
    /* ignore */
  }
  return FALLBACK;
}
