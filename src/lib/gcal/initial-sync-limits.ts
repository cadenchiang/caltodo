/**
 * Limits for /api/gcal/initial-sync: which tasks are worth an event and how
 * long one run may keep creating them.
 *
 * Kept out of the route file so they can be unit tested (Next.js route
 * modules may only export handlers).
 *
 * @module gcal/initial-sync-limits
 */

/** Tasks due more than this many days ago are not worth a calendar event. */
export const SYNC_FLOOR_DAYS = 30;

/**
 * Stop starting new creates after this long. vercel.json gives the route
 * 60s; the margin covers the in-flight creates and the done event.
 */
export const TIME_BUDGET_MS = 50_000;

/**
 * Earliest due_date (YYYY-MM-DD, local) that initial-sync still syncs.
 *
 * @param now - Reference time (injectable for tests)
 * @returns The floor date string, SYNC_FLOOR_DAYS before `now`
 */
export function syncFloorDate(now: Date = new Date()): string {
  const floor = new Date(now);
  floor.setDate(floor.getDate() - SYNC_FLOOR_DAYS);
  const y = floor.getFullYear();
  const m = String(floor.getMonth() + 1).padStart(2, "0");
  const d = String(floor.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Whether a run that started at `startedAt` may still start another create.
 *
 * @param startedAt - Epoch ms when the request began
 * @param now - Epoch ms now (injectable for tests)
 * @returns true while less than TIME_BUDGET_MS has elapsed
 */
export function withinTimeBudget(startedAt: number, now: number = Date.now()): boolean {
  return now - startedAt < TIME_BUDGET_MS;
}
