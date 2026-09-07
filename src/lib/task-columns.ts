/**
 * The columns a Task carries, as one select list.
 *
 * `select("*")` pulled every column of every row on every load. Naming them
 * keeps the fetch to what the app reads, and makes the client fetch and the
 * server preload ask for exactly the same shape, so a row looks identical
 * whichever path produced it.
 *
 * @module task-columns
 */

import type { Task } from "@/lib/types";

/**
 * Every key of {@link Task}, in a form the type checker verifies.
 *
 * A key missing from this object is a compile error, and a key that is not
 * on Task is one too, so the list cannot drift from the interface.
 */
const TASK_COLUMN_SET: Record<keyof Task, true> = {
  id: true,
  user_id: true,
  title: true,
  description: true,
  due_date: true,
  due_time: true,
  is_completed: true,
  color: true,
  created_at: true,
  updated_at: true,
  source: true,
  external_id: true,
  course_name: true,
  source_url: true,
  points_possible: true,
  is_submitted: true,
  google_event_id: true,
  dismissed_at: true,
  repeat_interval: true,
  repeat_unit: true,
  repeat_end_date: true,
  repeat_end_count: true,
  late_due_date: true,
  completed_at: true,
  tags: true,
  snoozed_until: true,
  sort_order: true,
  due_date_manually_edited_at: true,
  due_time_manually_edited_at: true,
};

/** Comma-separated column list for `.select()`. */
export const TASK_COLUMNS = Object.keys(TASK_COLUMN_SET).join(",");
