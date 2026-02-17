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

/** Google OAuth2 token endpoint. */
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

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
 * @param refreshToken - The decrypted refresh token
 * @returns New access token and expiry, or null on failure
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    logger.error("refreshAccessToken: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    return null;
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error("refreshAccessToken: Google token refresh failed", {
      status: res.status,
      body,
    });
    return null;
  }

  const data: GoogleTokenResponse = await res.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
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

  // Token is still valid (with buffer)
  if (expiresAt - now > EXPIRY_BUFFER_MS) {
    return decrypt(data.google_access_token_encrypted);
  }

  // Token expired or near expiry — refresh it
  logger.info("getValidAccessToken: refreshing expired token", { userId });
  const refreshToken = decrypt(data.google_refresh_token_encrypted);
  const refreshed = await refreshAccessToken(refreshToken);

  if (!refreshed) {
    // Refresh failed — user likely revoked access. Clear tokens.
    logger.warn("getValidAccessToken: refresh failed, clearing tokens", { userId });
    await supabase
      .from("integration_credentials")
      .update({
        google_access_token_encrypted: null,
        google_refresh_token_encrypted: null,
        google_token_expires_at: null,
      })
      .eq("user_id", userId);
    return null;
  }

  // Save refreshed token
  const newExpiresAt = new Date(now + refreshed.expiresIn * 1000).toISOString();
  await supabase
    .from("integration_credentials")
    .update({
      google_access_token_encrypted: encrypt(refreshed.accessToken),
      google_token_expires_at: newExpiresAt,
    })
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
 * Fetches the stored Google Calendar ID for the user's dedicated "caltodo" calendar.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's UUID
 * @returns The stored calendar ID, or null if not set
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

  return data.google_calendar_id as string;
}
