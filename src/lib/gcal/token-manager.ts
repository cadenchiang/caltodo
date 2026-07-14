/**
 * Manages Google Calendar OAuth tokens: retrieval, refresh, and validation.
 * Tokens are stored encrypted in the integration_credentials table.
 * Auto-refreshes expired tokens with a 5-minute buffer.
 *
 * @module gcal/token-manager
 */

import { encrypt, decrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Buffer before token expiry to trigger preemptive refresh (5 minutes). */
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/**
 * Outcome of a token refresh.
 *  - `ok`        — got a fresh access token.
 *  - `revoked`   — Google returned `invalid_grant`: the refresh token is dead
 *                  (user revoked access, token expired, or password changed).
 *                  The stored tokens should be cleared and the user prompted
 *                  to reconnect.
 *  - `transient` — a 5xx / network / config error. The refresh token is
 *                  probably still fine; keep it and retry on the next sync.
 *                  NEVER wipe the user's tokens on this outcome.
 */
type RefreshOutcome =
  | { status: "ok"; accessToken: string; expiresIn: number; refreshToken?: string }
  | { status: "revoked" }
  | { status: "transient" };

/** Per-user mutex map to prevent concurrent token refreshes for the same user. */
const refreshPromises = new Map<string, Promise<RefreshOutcome>>();

/** Google OAuth2 token endpoint. */
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

/** How many times to retry a transient (5xx / network) refresh failure. */
const REFRESH_MAX_ATTEMPTS = 3;

/**
 * Response shape from Google's OAuth2 token endpoint.
 */
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

/**
 * Refreshes an access token using a refresh token via Google's OAuth2 endpoint.
 *
 * Distinguishes a genuine revocation (`invalid_grant`) from a transient Google
 * outage. Transient failures (5xx, network errors) are retried a few times with
 * a short backoff before giving up as `transient` — the caller must NOT clear
 * the user's stored tokens in that case, or a momentary Google blip would
 * permanently disconnect the user.
 *
 * @param refreshToken - The decrypted refresh token
 * @returns A {@link RefreshOutcome} describing success, revocation, or a
 *          transient failure.
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshOutcome> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // A server misconfiguration is not the user's fault — treat as transient so
    // we don't wipe every user's tokens if an env var goes missing.
    logger.error("refreshAccessToken: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    return { status: "transient" };
  }

  for (let attempt = 1; attempt <= REFRESH_MAX_ATTEMPTS; attempt++) {
    let res: Response;
    try {
      res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });
    } catch (err) {
      // Network error — transient. Retry.
      logger.warn("refreshAccessToken: network error", {
        attempt,
        error: err instanceof Error ? err.message : String(err),
      });
      if (attempt < REFRESH_MAX_ATTEMPTS) continue;
      return { status: "transient" };
    }

    if (res.ok) {
      const data: GoogleTokenResponse = await res.json();
      return {
        status: "ok",
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      };
    }

    const body = await res.text();

    // A 4xx invalid_grant is a definitive revocation — do not retry.
    if (res.status >= 400 && res.status < 500 && body.includes("invalid_grant")) {
      logger.warn("refreshAccessToken: refresh token revoked (invalid_grant)", { status: res.status });
      return { status: "revoked" };
    }

    // Other 4xx (e.g. invalid_client) and all 5xx: log and retry as transient.
    logger.error("refreshAccessToken: Google token refresh failed", { status: res.status, body, attempt });
    if (attempt < REFRESH_MAX_ATTEMPTS) continue;
    return { status: "transient" };
  }

  return { status: "transient" };
}

/**
 * Returns a valid (non-expired) access token for the user.
 * Auto-refreshes if the token is expired or within the 5-minute buffer.
 * Clears stored tokens on refresh failure (e.g. user revoked access).
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's UUID
 * @returns Decrypted access token, or null if not connected or refresh failed
 */
export async function getValidAccessToken(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("integration_credentials")
    .select("google_access_token_encrypted, google_refresh_token_encrypted, google_token_expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !data?.google_access_token_encrypted || !data?.google_refresh_token_encrypted) {
    return null;
  }

  const expiresAt = data.google_token_expires_at
    ? new Date(data.google_token_expires_at).getTime()
    : 0;
  const now = Date.now();

  // Decrypt failures (e.g. the encryption key was rotated) must not wipe the
  // stored tokens — that would be unrecoverable. Treat as a transient miss.
  let decryptedAccess: string;
  let refreshToken: string;
  try {
    decryptedAccess = decrypt(data.google_access_token_encrypted);
    refreshToken = decrypt(data.google_refresh_token_encrypted);
  } catch (err) {
    logger.error("getValidAccessToken: failed to decrypt stored tokens", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }

  // Token is still valid (with buffer)
  if (expiresAt - now > EXPIRY_BUFFER_MS) {
    return decryptedAccess;
  }

  // Token expired or near expiry — refresh it (with mutex to prevent concurrent refreshes)
  logger.info("getValidAccessToken: refreshing expired token", { userId });
  if (!refreshPromises.has(userId)) {
    refreshPromises.set(
      userId,
      refreshAccessToken(refreshToken).finally(() => {
        refreshPromises.delete(userId);
      })
    );
  }
  const refreshed = await refreshPromises.get(userId)!;

  if (refreshed.status === "revoked") {
    // Genuine revocation — clear the dead tokens and flag it so Settings can
    // prompt the user to reconnect (instead of silently never syncing again).
    logger.warn("getValidAccessToken: access revoked, clearing tokens", { userId });
    await supabase
      .from("integration_credentials")
      .update({
        google_access_token_encrypted: null,
        google_refresh_token_encrypted: null,
        google_token_expires_at: null,
        google_auth_failed: true,
      })
      .eq("user_id", userId);
    return null;
  }

  if (refreshed.status === "transient") {
    // Google hiccup / network error — keep the tokens and try again next sync.
    logger.warn("getValidAccessToken: transient refresh failure, keeping tokens", { userId });
    return null;
  }

  // Save refreshed token (and new refresh token if Google rotated it). Clear
  // any stale auth-failed flag since the connection is demonstrably working.
  const newExpiresAt = new Date(now + refreshed.expiresIn * 1000).toISOString();
  const updatePayload: Record<string, string | boolean> = {
    google_access_token_encrypted: encrypt(refreshed.accessToken),
    google_token_expires_at: newExpiresAt,
    google_auth_failed: false,
  };
  if (refreshed.refreshToken) {
    updatePayload.google_refresh_token_encrypted = encrypt(refreshed.refreshToken);
  }
  await supabase
    .from("integration_credentials")
    .update(updatePayload)
    .eq("user_id", userId);

  return refreshed.accessToken;
}

/**
 * Checks whether the user has Google Calendar connected (tokens stored).
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's UUID
 * @returns true if Google Calendar tokens exist
 */
export async function isGoogleCalendarConnected(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("integration_credentials")
    .select("google_access_token_encrypted")
    .eq("user_id", userId)
    .single();

  if (error || !data) return false;
  return !!data.google_access_token_encrypted;
}

/**
 * Fetches the stored Google Calendar ID to write events to.
 *
 * The `google_calendar_id` column may hold either a single calendar ID
 * (legacy format) or a JSON-encoded array of selected calendar IDs (new
 * format from /api/gcal/select-calendar). For write operations we always
 * target the first selected calendar (primary, sorted first by listAllCalendars).
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's UUID
 * @returns The resolved calendar ID, or null if not set / unparseable empty array
 */
export async function getCalendarId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("integration_credentials")
    .select("google_calendar_id")
    .eq("user_id", userId)
    .single();

  if (error || !data?.google_calendar_id) {
    return null;
  }

  const stored = data.google_calendar_id as string;

  if (stored.startsWith("[")) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string" && parsed[0].trim()) {
        return parsed[0];
      }
      logger.warn("getCalendarId: stored JSON array is empty or invalid", { userId });
      return null;
    } catch (err) {
      logger.error("getCalendarId: failed to parse stored JSON", {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  return stored;
}
