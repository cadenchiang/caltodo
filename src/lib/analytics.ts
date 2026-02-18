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
  | "onboarding_completed"
  | "onboarding_exited"
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
  // Features
  | "view_mode_changed"
  | "filter_changed"
  | "sort_mode_changed"
  | "theme_changed";

/**
 * Tracks a user analytics event via Vercel Analytics and PostHog.
 * Sends the same event to both platforms for redundancy and richer analysis.
 *
 * @param name - The event name (must be a valid AnalyticsEvent)
 * @param properties - Optional key-value properties to attach to the event
 */
export function trackEvent(
  name: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null>,
): void {
  track(name, properties ?? {});
  posthog.capture(name, properties ?? {});
}
