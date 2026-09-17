/**
 * Where the Google OAuth flow sends the user once it finishes.
 *
 * The callback used to redirect to settings unconditionally, so connecting
 * from onboarding dropped a new user into settings mid-setup. The destination
 * is carried in a cookie across the round trip to Google and resolved against
 * a fixed allowlist, so a crafted `?return=` can never become an open redirect.
 *
 * @module gcal/oauth-return
 */

/** Cookie that carries the return target across the OAuth round trip. */
export const OAUTH_RETURN_COOKIE = "gcal_oauth_return";

/** Allowlisted return targets, keyed by the value accepted in `?return=`. */
const RETURN_PATHS = {
  settings: "/app/settings",
  onboarding: "/app/onboarding",
} as const;

/** A return target the OAuth flow accepts. */
export type OAuthReturnTarget = keyof typeof RETURN_PATHS;

/**
 * Narrows an untrusted value to a known return target.
 *
 * @param value - Raw `?return=` query value or cookie value; may be anything.
 * @returns The target when it is allowlisted, otherwise "settings". Null,
 *          undefined, unknown names, and full URLs all resolve to "settings".
 */
export function parseReturnTarget(value: string | null | undefined): OAuthReturnTarget {
  return value === "onboarding" ? "onboarding" : "settings";
}

/**
 * Builds the path the callback redirects to.
 *
 * @param target - Raw target value (query or cookie); validated here.
 * @param result - "connected" on success, "error" on failure.
 * @param reason - Failure reason code, appended only for errors.
 * @returns A same-origin path such as "/app/onboarding?gcal=connected".
 */
export function buildReturnPath(
  target: string | null | undefined,
  result: "connected" | "error",
  reason?: string,
): string {
  const base = RETURN_PATHS[parseReturnTarget(target)];
  const params = new URLSearchParams({ gcal: result });
  if (result === "error" && reason) params.set("reason", reason);
  return `${base}?${params.toString()}`;
}
