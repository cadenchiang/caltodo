/**
 * Wall-clock budget for one run of the assignment sync.
 *
 * /api/assignments/sync runs Canvas (paginated), Gradescope (a login and a
 * scrape), every calendar feed, extra Canvas accounts, course enrollment and
 * a second course listing inside a single serverless function. When the
 * function's limit was 10s and each upstream request could take 30s, one
 * slow page killed the function mid-write with no log line (audit M7). The
 * limit is now 60s (vercel.json), each upstream request is capped well below
 * that, and this budget lets runSync skip the later, sequential stages with
 * a logged reason instead of being cut off.
 */

/** maxDuration declared for the sync route, in ms. Must match vercel.json. */
export const SYNC_FUNCTION_MAX_DURATION_MS = 60_000;

/**
 * How long runSync may spend before it stops starting new stages. The gap to
 * the function limit is headroom for the writes already in flight and for
 * building the response.
 */
export const SYNC_BUDGET_MS = 45_000;

/** Tracks elapsed time against the budget. */
export interface SyncBudget {
  /** Milliseconds since the run started. */
  elapsedMs(): number;
  /** True once the budget is spent; new stages should be skipped. */
  exhausted(): boolean;
}

/**
 * Starts a budget clock.
 *
 * @param budgetMs - Budget length; defaults to SYNC_BUDGET_MS.
 * @param now - Clock, injectable for tests.
 * @returns A budget whose `exhausted()` flips once `budgetMs` has elapsed.
 */
export function startSyncBudget(budgetMs: number = SYNC_BUDGET_MS, now: () => number = Date.now): SyncBudget {
  const startedAt = now();
  return {
    elapsedMs: () => now() - startedAt,
    exhausted: () => now() - startedAt >= budgetMs,
  };
}
