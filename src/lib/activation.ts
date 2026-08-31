/**
 * First-meaningful-action ("activation") tracking.
 *
 * Onboarding completion was the only success signal the product measured, and
 * it hid a second drop of the same size: of 60 people who finished setup in a
 * 30-day window, only 30 ever created, completed or edited a task. Reaching
 * the end of setup is not the same as using the product, and nothing
 * distinguished the two.
 *
 * `user_activated` fires once, on the first task action a person takes. It is
 * deliberately separate from `task_created` and friends, which fire every
 * time and so cannot anchor a funnel step without a window function.
 *
 * Deduplication is per-device, because it is keyed on localStorage. Somebody
 * using the app on a phone and a laptop can therefore emit the event twice.
 * That is acceptable: PostHog can restrict to each person's first occurrence,
 * and the alternative, a server round-trip on every task write, costs far more
 * than the small amount of noise it removes.
 */

import { trackEvent } from "@/lib/analytics";

/** The action that activated the user. */
export type ActivationSource = "task_created" | "task_completed" | "task_updated";

/** Storage key. Versioned so the shape can change without a migration. */
const STORAGE_KEY = "caltodo_activated_v1";

/**
 * Backstop for when localStorage is unavailable (private windows, disabled
 * cookies). Without it, a user in that state would emit `user_activated` on
 * every single task action. Module scope means it lasts for the page session.
 */
let firedThisSession = false;

/**
 * Reads the persisted activation flag.
 *
 * @returns True when this browser has already recorded an activation. False
 *          when it has not, or when storage cannot be read.
 */
export function isActivated(): boolean {
  if (firedThisSession) return true;
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Records the user's first meaningful action, at most once per device.
 *
 * Safe to call on every task write; calls after the first are no-ops. Never
 * throws, so it can sit inline in a mutation path without a guard.
 *
 * @param source - Which action triggered activation, attached to the event so
 *                 the entry point into real usage can be compared.
 * @returns True if this call emitted the event, false if it was already
 *          recorded. Returned mainly so tests can assert the once-only rule.
 */
export function markActivated(source: ActivationSource): boolean {
  if (isActivated()) return false;

  // Set the guard before emitting. If trackEvent throws, the event is lost,
  // which is strictly better than a loop that retries it on every keystroke.
  firedThisSession = true;
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* Session-scoped backstop above still bounds this to one event. */
  }

  trackEvent("user_activated", { source });
  return true;
}

/**
 * Clears the activation flag.
 *
 * Exists for tests and for sign-out, so a shared browser does not carry one
 * person's activation state into another person's session.
 */
export function resetActivation(): void {
  firedThisSession = false;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Nothing to do. */
  }
}
