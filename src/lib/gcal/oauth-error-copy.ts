/**
 * User-facing messages for the `?gcal=error&reason=` outcomes of the Google
 * Calendar OAuth callback. One table, used by both the redirect path and the
 * popup path.
 *
 * @module gcal/oauth-error-copy
 */

/** Reason codes the OAuth callback can append to the redirect. */
export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  denied: "Google Calendar access was denied.",
  csrf: "Security check failed. Please try again.",
  token_exchange: "Failed to connect. Please try again.",
  missing_tokens: "Failed to get tokens from Google. Please try again.",
  config: "Google Calendar is not configured on this server.",
  storage: "Failed to save connection. Please try again.",
};

/** Message for an unknown or missing reason. */
export const OAUTH_ERROR_FALLBACK = "Failed to connect Google Calendar.";

/**
 * Maps a callback reason code to its message.
 *
 * @param reason - The `reason` query value, or null when absent
 * @returns The matching message, or the fallback for unknown codes
 */
export function oauthErrorMessage(reason: string | null | undefined): string {
  return OAUTH_ERROR_MESSAGES[reason ?? ""] ?? OAUTH_ERROR_FALLBACK;
}
