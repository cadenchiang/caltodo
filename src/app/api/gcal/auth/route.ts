/**
 * GET /api/gcal/auth
 *
 * Initiates the Google OAuth2 flow for Google Calendar access.
 * Generates a CSRF state token, stores it in a secure cookie,
 * and redirects to Google's consent screen.
 */

import { NextResponse, type NextRequest } from "next/server";
import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/** Google OAuth2 authorization endpoint. */
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

/** Scopes required for calendar access and profile info display. */
const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  // Derive redirect URI from env var or dynamically from the request origin
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${new URL(request.url).origin}/api/gcal/callback`;

  if (!clientId) {
    logger.error("GET /api/gcal/auth: missing GOOGLE_CLIENT_ID");
    return NextResponse.json(
      { error: "Google Calendar integration not configured" },
      { status: 500 }
    );
  }

  // Generate CSRF state token and store in cookie
  const state = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("gcal_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  logger.info("GET /api/gcal/auth: redirecting to Google consent", { userId: user.id });

  return NextResponse.redirect(authUrl);
}
