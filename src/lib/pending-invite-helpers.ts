import type { Task, PendingInvite } from "@/lib/types";

/**
 * Converts a PendingInvite to a pseudo-Task object for rendering.
 * Used by calendar views (month, week, day) to display pending invites
 * with the same task card components.
 *
 * @param invite - The pending invite to convert
 * @returns A Task-shaped object suitable for display components
 */
export function pendingInviteToPseudoTask(invite: PendingInvite): Task {
  return {
    id: invite.shareId,
    user_id: "",
    title: invite.taskTitle,
    description: "",
    due_date: invite.taskDueDate,
    due_time: invite.taskDueTime,
    is_completed: false,
    color: invite.taskColor,
    created_at: invite.createdAt,
    updated_at: invite.createdAt,
    source: null,
    external_id: null,
    course_name: null,
    source_url: null,
    points_possible: null,
    is_submitted: false,
    google_event_id: null,
    dismissed_at: null,
    repeat_interval: null,
    repeat_unit: null,
    repeat_end_date: null,
    repeat_end_count: null,
    late_due_date: null,
    completed_at: null,
    tags: [],
    snoozed_until: null,
    sort_order: null,
    due_date_manually_edited_at: null,
    due_time_manually_edited_at: null,
  };
}
