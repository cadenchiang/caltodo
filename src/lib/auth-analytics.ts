/**
 * Sign-in and sign-up funnel tracking.
 *
 * The top of the funnel was invisible. `sign_in_submitted`, `sign_up_submitted`
 * and `auth_error` were all declared in the analytics event union but fired
 * from nowhere, so the only signal an account creation produced was
 * `$identify` — which lands *after* Google hands a session back. Every
 * abandoned consent screen and every OAuth failure was unmeasurable, and the
 * landing-to-signup drop could only be inferred from the gap between marketing
 * pageviews and identified people.
 *
 * caltodo is Google-OAuth-only, so "submitted" means the moment the user
 * commits to the provider handoff, not a form POST. Sign-up and sign-in share
 * a single button and are told apart by the `?signup=true` query parameter
 * that /login already uses to pick its own copy.
 */

import { trackEvent } from "@/lib/analytics";

/** Which side of the auth funnel a visit to /login belongs to. */
export type AuthMode = "sign_up" | "sign_in";

/** Where in the auth flow a failure surfaced. */
export type AuthErrorStage = "oauth_start" | "callback";

/** Query parameter /login uses to render its sign-up copy. */
const SIGNUP_PARAM = "signup";

/**
 * Upper bound on a recorded error message. Supabase occasionally returns a
 * whole error body rather than a sentence, and an unbounded string would both
 * bloat the event and fragment the property into unusable cardinality.
 */
const MAX_MESSAGE_LENGTH = 200;

/**
 * Classifies a /login visit as sign-up or sign-in.
 *
 * Mirrors the exact comparison LoginForm uses to choose its heading, so the
 * event can never disagree with the screen the user was actually looking at.
 *
 * @param params - Current query string. Accepts null because useSearchParams()
 *                 can return null during static rendering.
 * @returns "sign_up" only for an exact `signup=true`. Everything else is
 *          "sign_in", including a missing parameter, an empty value, and
 *          differently-cased values such as `signup=TRUE`.
 */
export function authModeForParams(params: URLSearchParams | null): AuthMode {
  return params?.get(SIGNUP_PARAM) === "true" ? "sign_up" : "sign_in";
}

/**
 * Records that the user committed to the OAuth handoff.
 *
 * Pairs with `$identify`: the gap between this event and an identified person
 * is the share of people who press the button and never return with a session.
 * Fires before the provider call, so a handoff that throws is still counted as
 * an attempt rather than vanishing.
 *
 * @param mode - Which side of the funnel, from authModeForParams.
 * @param provider - Identity provider being handed off to (e.g. "google").
 *                   Carried as a property so a second provider can be added
 *                   later without splitting the funnel step in two.
 */
export function trackAuthSubmitted(mode: AuthMode, provider: string): void {
  trackEvent(mode === "sign_up" ? "sign_up_submitted" : "sign_in_submitted", {
    provider,
  });
}

/**
 * Records an authentication failure.
 *
 * One event name rather than one per stage, so the total failure rate is a
 * single number and the breakdown stays a property drill-down.
 *
 * @param stage - "oauth_start" when the provider handoff failed before the
 *                user ever reached Google; "callback" when the user returned
 *                from Google to /login carrying an `?error=` parameter.
 * @param mode - Which side of the funnel the user was on.
 * @param message - Provider error text. Empty and over-long values are both
 *                  tolerated: the property is truncated to
 *                  MAX_MESSAGE_LENGTH and never omitted, so the event shape
 *                  stays constant across every failure.
 */
export function trackAuthError(
  stage: AuthErrorStage,
  mode: AuthMode,
  message: string,
): void {
  trackEvent("auth_error", {
    stage,
    mode,
    message: message.slice(0, MAX_MESSAGE_LENGTH),
  });
}
