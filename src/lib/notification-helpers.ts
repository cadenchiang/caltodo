import type { Task, AppNotification, NotificationType } from "@/lib/types";

/**
 * Snapshot of tasks before a sync operation.
 * Used to detect what changed after fetching fresh data.
 *
 * @param byId - Map of task ID to task object
 * @param knownExternalKeys - Set of "source:external_id" strings for dedup
 */
export interface TaskSnapshot {
  byId: Map<string, Task>;
  knownExternalKeys: Set<string>;
}

/**
 * Creates a snapshot of the current tasks for later diffing.
 *
 * @param tasks - Current task list
 * @returns TaskSnapshot with byId map and knownExternalKeys set
 */
export function createTaskSnapshot(tasks: Task[]): TaskSnapshot {
  const byId = new Map<string, Task>();
  const knownExternalKeys = new Set<string>();

  for (const task of tasks) {
    byId.set(task.id, task);
    if (task.source && task.external_id) {
      knownExternalKeys.add(`${task.source}:${task.external_id}`);
    }
  }

  return { byId, knownExternalKeys };
}

/**
 * A detected change from comparing pre-sync and post-sync task lists.
 */
export interface DetectedChange {
  type: NotificationType;
  title: string;
  description: string | null;
  taskId: string;
}

/**
 * Compares fresh tasks against a pre-sync snapshot to detect changes.
 * Detects new assignments, updated fields, and auto-completed tasks.
 *
 * @param snapshot - Snapshot taken before sync
 * @param freshTasks - Tasks returned from fetchTasks after sync
 * @returns Array of detected changes
 */
export function detectSyncChanges(
  snapshot: TaskSnapshot,
  freshTasks: Task[],
): DetectedChange[] {
  const changes: DetectedChange[] = [];

  for (const task of freshTasks) {
    const prev = snapshot.byId.get(task.id);

    if (!prev) {
      // New task — only notify for synced assignments (not manual)
      if (task.source && task.external_id) {
        const key = `${task.source}:${task.external_id}`;
        if (!snapshot.knownExternalKeys.has(key)) {
          changes.push({
            type: "new_assignment",
            title: `New: ${task.title}`,
            description: task.course_name
              ? `${task.course_name} via ${task.source}`
              : `via ${task.source}`,
            taskId: task.id,
          });
        }
      }
      continue;
    }

    // Check for auto-completion (was incomplete, now complete, has source)
    if (!prev.is_completed && task.is_completed && task.source) {
      changes.push({
        type: "auto_completed",
        title: `${task.title} auto-completed`,
        description: task.is_submitted
          ? `Submitted on ${task.source}`
          : `Marked complete via ${task.source}`,
        taskId: task.id,
      });
      continue;
    }

    // Check for field updates on synced tasks
    if (task.source) {
      const diffs: string[] = [];
      if (prev.due_date !== task.due_date) {
        diffs.push(`due date → ${task.due_date ?? "removed"}`);
      }
      if (prev.title !== task.title) {
        diffs.push(`title updated`);
      }
      if (prev.points_possible !== task.points_possible) {
        diffs.push(`points → ${task.points_possible ?? "removed"}`);
      }
      if (diffs.length > 0) {
        changes.push({
          type: "assignment_updated",
          title: task.title,
          description: diffs.join(", "),
          taskId: task.id,
        });
      }
    }
  }

  return changes;
}

/**
 * Generates a short unique ID for notifications.
 *
 * @returns A random 12-character alphanumeric string
 */
export function generateNotificationId(): string {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Checks if a notification is a duplicate of an existing notification.
 * Deduplicates by matching type + taskId within a configurable time window.
 * Default window is 10 minutes to cover the auto-sync interval (5 min).
 *
 * @param existing - Current notifications list
 * @param type - Notification type to check
 * @param taskId - Related task ID
 * @param windowMs - Dedup time window in ms (default 10 minutes)
 * @returns True if a duplicate exists within the dedup window
 */
export function isDuplicateNotification(
  existing: AppNotification[],
  type: NotificationType,
  taskId: string | null,
  windowMs: number = 10 * 60 * 1000,
): boolean {
  if (!taskId) return false;
  const cutoff = Date.now() - windowMs;

  return existing.some(
    (n) =>
      n.type === type &&
      n.taskId === taskId &&
      new Date(n.createdAt).getTime() > cutoff,
  );
}

/**
 * Formats a time from a Date object into 12-hour format (e.g. "2:30 PM").
 *
 * @param date - Date object to extract time from
 * @returns Formatted time string like "2:30 PM"
 */
function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/**
 * Formats an ISO date string into a short display format with time.
 * Today: "2:30 PM", Yesterday: "Yesterday, 2:30 PM",
 * This year: "Feb 14, 2:30 PM", Older: "Feb 14 2025, 2:30 PM".
 *
 * @param isoString - ISO date string
 * @returns Formatted date+time string
 */
export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const time = formatTime(date);

  if (diffDays === 0) return time;
  if (diffDays === 1) return `Yesterday, ${time}`;

  const sameYear = date.getFullYear() === now.getFullYear();
  const dateStr = sameYear
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return `${dateStr}, ${time}`;
}
