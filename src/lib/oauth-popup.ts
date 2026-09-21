/**
 * Pure helpers for the desktop Google sign-in popup poll.
 *
 * The poll reads the popup's URL once it is back on our origin and has to
 * tell three things apart: still in flight, landed in the app (success), or
 * bounced to /login by the callback (failure). Keeping the decision here
 * lets it be unit-tested without a window.
 *
 * @module oauth-popup
 */

/** What the popup's current URL says about the sign-in. */
export type PopupOutcome =
  | { kind: "pending" }
  | { kind: "success"; destination: "/app/onboarding" | "/" }
  | { kind: "error"; reason: string };

/** Reason recorded when the callback sent the popup to /login without saying why. */
export const UNKNOWN_CALLBACK_ERROR = "callback_redirected_to_login";

/**
 * Classifies the popup's URL.
 *
 * @param href - The popup's `location.href` (same-origin, or the call throws upstream)
 * @param origin - This window's origin
 * @returns pending while the popup is elsewhere; success with the landing
 *          destination once it reaches /app; error once it reaches /login
 * @remarks `/login` is only ever reached from the callback's failure branch,
 *          so it is an error even without an `error` query param. The
 *          destination is "/" for every app route but onboarding, because
 *          the proxy picks the landing page per entitlement and preferences.
 */
export function classifyPopupUrl(href: string, origin: string): PopupOutcome {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { kind: "pending" };
  }
  if (url.origin !== origin) return { kind: "pending" };

  if (url.pathname === "/login" || url.pathname.startsWith("/login/")) {
    const reason = url.searchParams.get("error_description") || url.searchParams.get("error") || UNKNOWN_CALLBACK_ERROR;
    return { kind: "error", reason };
  }
  if (url.pathname.startsWith("/app/")) {
    return {
      kind: "success",
      destination: url.pathname.startsWith("/app/onboarding") ? "/app/onboarding" : "/",
    };
  }
  return { kind: "pending" };
}
