import { track } from "@vercel/analytics";
import posthog from "posthog-js";

/**
 * All tracked event names in the application.
 * Centralizes event naming to prevent typos and enable type-safe tracking.
 */
type AnalyticsEvent =
  // Auth
  | "sign_in_submitted"
  | "sign_up_submitted"
  | "google_oauth_clicked"
  | "auth_error"
  // Onboarding
  | "onboarding_step_viewed"
  | "onboarding_step_completed"
  | "onboarding_step_skipped"
  | "onboarding_platforms_selected"
  | "onboarding_completed"
  | "onboarding_exited"
  | "standalone_setup_completed"
  | "standalone_setup_skipped"
  // Tasks
  | "task_created"
  | "task_completed"
  | "task_uncompleted"
  | "task_updated"
  | "task_deleted"
  | "all_tasks_deleted"
  // Sync
  | "sync_started"
  | "sync_completed"
  | "sync_failed"
  // Repeat
  | "repeat_task_spawned"
  // Snooze
  | "task_snoozed"
  // Features
  | "view_mode_changed"
  | "filter_changed"
  | "sort_mode_changed"
  | "theme_changed"
  | "color_theme_changed"
  // Notifications
  | "notification_center_opened"
  | "notification_clicked"
  | "notifications_marked_read"
  | "notifications_cleared"
  | "notification_created";

/**
 * Tracks a user analytics event via Vercel Analytics and PostHog.
 * Sends the same event to both platforms for redundancy and richer analysis.
 *
 * @param name - The event name (must be a valid AnalyticsEvent)
 * @param properties - Optional key-value properties to attach to the event
 */
/**
 * Tracks a user analytics event via Vercel Analytics and PostHog.
 * PostHog capture is skipped in development since it's not initialized.
 *
 * @param name - The event name (must be a valid AnalyticsEvent)
 * @param properties - Optional key-value properties to attach to the event
 */
export function trackEvent(
  name: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null>,
): void {
  track(name, properties ?? {});
  // PostHog is not initialized in development — guard to avoid errors
  if (process.env.NODE_ENV !== "development") {
    posthog.capture(name, properties ?? {});
  }
}
