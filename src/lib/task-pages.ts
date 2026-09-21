/**
 * Pages a task list query past PostgREST's silent row cap.
 *
 * Supabase returns at most 1000 rows per request and says nothing when it
 * truncates, so an unbounded `select` quietly dropped the oldest open tasks
 * for heavy users. Every full task list read goes through here: the query
 * is run in ordered pages until a short page arrives, up to a documented
 * ceiling that is logged when reached.
 *
 * @module task-pages
 */

import { logger } from "@/lib/logger";

/** Rows per request. Matches PostgREST's default max-rows, so one page is one request. */
export const TASK_PAGE_SIZE = 1000;

/**
 * Most rows any single list read returns. Beyond this the read stops and
 * logs, rather than paging forever for a runaway account. Five pages is
 * well past the largest real task list seen.
 */
export const TASK_ROW_CAP = 5000;

/** What one page of the query resolves to (the shape supabase-js returns). */
export interface TaskPage<T> {
  data: T[] | null;
  error: { message: string } | null;
}

/** Runs the query for rows `from` through `to` inclusive (zero-based). */
export type TaskPageRunner<T> = (from: number, to: number) => PromiseLike<TaskPage<T>>;

/**
 * Reads every row of an ordered task query, one page at a time.
 *
 * @param runPage - Runs the query with `.range(from, to)` applied. The query
 *                  must carry a total order (add `id` as a tiebreaker), or
 *                  rows can repeat or go missing across pages.
 * @param context - Caller name for the log line, e.g. "loadInitialTasks"
 * @param userId - Whose rows, for the log line only
 * @returns All rows in order, or the first page error so the caller can
 *          fail the way it did before
 * @remarks Stops at the first page shorter than TASK_PAGE_SIZE. When the
 *          cap is reached the rows read so far are returned and a warning
 *          names the user, so the truncation is visible instead of silent.
 */
export async function fetchAllTaskPages<T>(
  runPage: TaskPageRunner<T>,
  context: string,
  userId?: string,
): Promise<{ data: T[]; error: null } | { data: null; error: { message: string } }> {
  const rows: T[] = [];
  let from = 0;

  while (from < TASK_ROW_CAP) {
    const to = Math.min(from + TASK_PAGE_SIZE, TASK_ROW_CAP) - 1;
    const { data, error } = await runPage(from, to);
    if (error) return { data: null, error };

    const page = data ?? [];
    rows.push(...page);
    if (page.length < to - from + 1) return { data: rows, error: null };
    from = to + 1;
  }

  logger.warn(`${context}: task list hit the row cap`, {
    userId,
    cap: TASK_ROW_CAP,
    impact: "rows past the cap are not returned; oldest open tasks may be missing",
  });
  return { data: rows, error: null };
}
