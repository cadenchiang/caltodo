/**
 * Loads a user's live tasks on the server, for the /app layout's preload.
 *
 * The same query TaskContext runs on the client, so the list the server
 * renders with is the list the client would have fetched a moment later.
 *
 * @module tasks-loader
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { TASK_COLUMNS } from "@/lib/task-columns";
import type { Task } from "@/lib/types";

/**
 * Reads every task that is not dismissed, newest first.
 *
 * @param supabase - A client acting as the user (RLS applies)
 * @param userId - Whose tasks; used for the log line, the client scopes rows
 * @returns The tasks, or null when the read failed so the client fetches
 *          itself rather than starting from an empty list it believes
 */
export async function loadInitialTasks(supabase: SupabaseClient, userId: string): Promise<Task[] | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    logger.warn("loadInitialTasks: preload failed, client will fetch", { userId, error: error.message });
    return null;
  }
  return (data ?? []) as unknown as Task[];
}
