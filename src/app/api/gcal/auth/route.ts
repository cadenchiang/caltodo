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
import { rateLimit } from "@/lib/rate-limit";
import { isPro } from "@/lib/entitlements";

/** Google OAuth2 authorization endpoint. */
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

/** Scopes required for calendar read/write access and profile info display. */
const BASE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

/**
 * Read-only Classroom scopes, requested only when ?classroom=1 is passed.
 *
 * Deliberately not part of BASE_SCOPES: these are Google "restricted" scopes,
 * and until they are registered on the OAuth consent screen (and the app is
 * verified for them) Google rejects any authorization request that asks for
 * them. Folding them into the default flow would therefore break Calendar
 * connect for every user the moment this deploys. Opt-in keeps the existing
 * flow byte-for-byte unchanged.
 */
const CLASSROOM_SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
];

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Google Calendar sync is a Pro-gated feature. Block at the door — don't
  // let a free user start the OAuth flow only to be told later it doesn't work.
  if (!(await isPro(user.id))) {
    return NextResponse.json(
      { error: "Google Calendar sync is a Pro feature", code: "pro_required" },
      { status: 402 },
    );
  }

  const { allowed } = rateLimit(`gcal-auth:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    logger.error("GET /api/gcal/auth: missing GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI");
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
    maxAge: 1800, // 30 minutes — allows time for slow OAuth flows
    path: "/",
  });

  // Ask for Classroom access only when the caller explicitly requests it.
  const wantsClassroom = request.nextUrl.searchParams.get("classroom") === "1";
  const scopes = [...BASE_SCOPES, ...(wantsClassroom ? CLASSROOM_SCOPES : [])].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  logger.info("GET /api/gcal/auth: redirecting to Google consent", { userId: user.id });

  return NextResponse.redirect(authUrl);
}
