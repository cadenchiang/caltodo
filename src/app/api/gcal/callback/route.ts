/**
 * GET /api/gcal/callback?code=...&state=...
 *
 * Handles the OAuth2 callback from Google after user consent.
 * Validates the CSRF state, exchanges the authorization code for tokens,
 * encrypts and stores them, then redirects to settings.
 */

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";

/** Google OAuth2 token endpoint. */
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

/** Google userinfo endpoint for fetching email and profile photo. */
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

/**
 * Response shape from Google's userinfo API.
 */
interface GoogleUserInfo {
  email?: string;
  picture?: string;
}

/**
 * Response shape from Google's OAuth2 token exchange.
 */
interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // User denied consent or other Google error
  if (errorParam) {
    logger.warn("GET /api/gcal/callback: Google returned error", {
      userId: user.id,
      error: errorParam,
    });
    return NextResponse.redirect(
      new URL("/app/settings?gcal=error&reason=denied", request.url)
    );
  }

  if (!code || !state) {
    logger.warn("GET /api/gcal/callback: missing code or state", { userId: user.id });
    return NextResponse.redirect(
      new URL("/app/settings?gcal=error&reason=invalid", request.url)
    );
  }

  // Validate CSRF state
  const cookieStore = await cookies();
  const storedState = cookieStore.get("gcal_oauth_state")?.value;
  cookieStore.delete("gcal_oauth_state");

  if (!storedState || storedState !== state) {
    logger.warn("GET /api/gcal/callback: CSRF state mismatch", { userId: user.id });
    return NextResponse.redirect(
      new URL("/app/settings?gcal=error&reason=csrf", request.url)
    );
  }

  // Exchange authorization code for tokens
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  // Derive redirect URI from env var or dynamically from the request origin
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${new URL(request.url).origin}/api/gcal/callback`;

  if (!clientId || !clientSecret) {
    logger.error("GET /api/gcal/callback: missing Google OAuth env vars");
    return NextResponse.redirect(
      new URL("/app/settings?gcal=error&reason=config", request.url)
    );
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    logger.error("GET /api/gcal/callback: token exchange failed", {
      userId: user.id,
      status: tokenRes.status,
      body,
    });
    return NextResponse.redirect(
      new URL("/app/settings?gcal=error&reason=token_exchange", request.url)
    );
  }

  const tokens: GoogleTokenResponse = await tokenRes.json();

  if (!tokens.access_token || !tokens.refresh_token) {
    logger.error("GET /api/gcal/callback: missing tokens in response", {
      userId: user.id,
      hasAccess: !!tokens.access_token,
      hasRefresh: !!tokens.refresh_token,
    });
    return NextResponse.redirect(
      new URL("/app/settings?gcal=error&reason=missing_tokens", request.url)
    );
  }

  // Fetch Google profile info (email + photo) for display in settings
  let googleEmail: string | null = null;
  let googlePhotoUrl: string | null = null;
  try {
    const userinfoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (userinfoRes.ok) {
      const userinfo: GoogleUserInfo = await userinfoRes.json();
      googleEmail = userinfo.email ?? null;
      googlePhotoUrl = userinfo.picture ?? null;
    } else {
      logger.warn("GET /api/gcal/callback: failed to fetch userinfo", {
        userId: user.id,
        status: userinfoRes.status,
      });
    }
  } catch (err) {
    logger.warn("GET /api/gcal/callback: userinfo fetch error", {
      userId: user.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Encrypt and store tokens + profile info
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { error: upsertError } = await supabase
    .from("integration_credentials")
    .upsert(
      {
        user_id: user.id,
        google_access_token_encrypted: encrypt(tokens.access_token),
        google_refresh_token_encrypted: encrypt(tokens.refresh_token),
        google_token_expires_at: expiresAt,
        google_email: googleEmail,
        google_photo_url: googlePhotoUrl,
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    logger.error("GET /api/gcal/callback: failed to store tokens", {
      userId: user.id,
      error: upsertError.message,
    });
    return NextResponse.redirect(
      new URL("/app/settings?gcal=error&reason=storage", request.url)
    );
  }

  logger.info("GET /api/gcal/callback: Google Calendar connected", { userId: user.id });
  return NextResponse.redirect(new URL("/app/settings?gcal=connected", request.url));
}
