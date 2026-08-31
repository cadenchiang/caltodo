import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task } from "@/lib/types";
import { logger } from "@/lib/logger";

/**
 * Server-side fetch of the task list that TaskProvider seeds its state from.
 *
 * Why this exists: TaskProvider used to fetch tasks from the browser in a
 * mount effect, so nothing could start loading until the ~1.5MB of app JS
 * had downloaded, parsed and hydrated. A DevTools trace of /app/inbox put
 * the query start at 871ms and the rows on screen at 1216ms, on a main
 * thread that was idle for most of that window. Running the same query in
 * the server layout puts the rows in the first HTML instead.
 *
 * The query is deliberately identical to TaskContext's `fetchTasks` — same
 * filter, same ordering — so the server-rendered list and any later client
 * refetch cannot disagree about content or order.
 *
 * @module lib/tasks/fetch-initial-tasks
 */

/** Columns selected for the initial list. `*` matches TaskContext.fetchTasks. */
const TASK_COLUMNS = "*";

/**
 * Fetch every non-dismissed task for the session behind `supabase`.
 *
 * Row-level security scopes the result to the session's user, so no user id
 * is passed or needed.
 *
 * @param supabase - A request-scoped Supabase server client.
 * @returns The task rows, newest first. Returns `undefined` — never throws
 *   and never returns `[]` — when the query fails, which tells TaskProvider
 *   to fall back to its original client-side fetch. `[]` is reserved for the
 *   real "this user has no tasks" case, which must not trigger a refetch.
 *
 * Edge cases: a failure here is non-fatal by design. The page still renders
 * and the client recovers on its own; the failure is logged with its cause
 * so a systematic breakage is visible rather than silently costing every
 * user the slow path.
 */
export async function fetchInitialTasks(
  supabase: Pick<SupabaseClient, "from">,
): Promise<Task[] | undefined> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_COLUMNS)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("AppLayout: initial task fetch failed", {
        cause: error.message,
        code: error.code,
        impact: "falling back to client-side fetch; first paint will be slower",
      });
      return undefined;
    }

    return (data ?? []) as Task[];
  } catch (err) {
    logger.error("AppLayout: initial task fetch threw", {
      cause: err instanceof Error ? err.message : String(err),
      impact: "falling back to client-side fetch; first paint will be slower",
    });
    return undefined;
  }
}
