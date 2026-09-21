/**
 * API route for fetching Canvas courses.
 * GET /api/canvas/courses            (primary account, stored credentials)
 * GET /api/canvas/courses?account_id=... (one of the user's extra schools)
 * POST /api/canvas/courses { token, base_url }
 *
 * POST verifies a token the user has just typed, before anything is saved
 * (onboarding). The token travels in the JSON body, never in the URL, so it
 * cannot land in request logs. GET reads a stored account: `account_id`
 * selects one of the user's additional Canvas schools, and its absence means
 * the primary account in the flat credential columns.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCanvasCourses } from "@/lib/canvas-client";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedCanvasUrl } from "@/lib/canvas-url-validation";
import { resolveCanvasAccount } from "@/lib/account-scope";
import { fetchCanvasICalAssignments } from "@/lib/canvas-ical-client";
import { stableIdFromName } from "@/lib/course-enrollment";

/** Upper bound on a Canvas token; matches PUT /api/credentials. */
const CANVAS_TOKEN_MAX = 256;

/**
 * Resolves the signed-in user and applies the per-user rate limit.
 *
 * @returns The user id, or the error response to return as-is
 */
async function authorize(): Promise<{ userId: string } | { response: NextResponse }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { allowed } = rateLimit(`canvas-courses:${user.id}`, 30, 60_000);
  if (!allowed) {
    return { response: NextResponse.json({ error: "Too many requests" }, { status: 429 }) };
  }
  return { userId: user.id };
}

/**
 * Lists active courses with a token, mapping Canvas failures to statuses.
 *
 * @param userId - For logging only
 * @param token - Canvas API token
 * @param baseUrl - Canvas instance URL (already allowlisted)
 * @returns The JSON response for the caller
 */
async function listCoursesWithToken(userId: string, token: string, baseUrl: string): Promise<NextResponse> {
  try {
    const courses = await fetchCanvasCourses(token, baseUrl);
    logger.info("canvas/courses success", { userId, courseCount: courses.length });
    return NextResponse.json({ courses });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("canvas/courses failed", { userId, error: message });
    // Preserve the auth/rate-limit STATUS the onboarding UI branches on (401 ->
    // "Invalid access token", 403 -> rate limit) while keeping the body generic.
    const isAuth = /invalid or expired|token is invalid|\b401\b|unauthorized/i.test(message);
    const isRate = /rate limit|\b403\b/i.test(message);
    if (isAuth) return NextResponse.json({ error: "Canvas token is invalid or expired." }, { status: 401 });
    if (isRate) return NextResponse.json({ error: "Canvas rate limit exceeded. Try again later." }, { status: 403 });
    return NextResponse.json({ error: "Failed to load Canvas courses" }, { status: 500 });
  }
}

/**
 * POST /api/canvas/courses
 * Verifies an unsaved token by listing its courses.
 *
 * @param request - JSON body `{ token, base_url }`
 * @returns JSON with courses array [{id, name, course_code}]
 */
export async function POST(request: NextRequest) {
  const auth = await authorize();
  if ("response" in auth) return auth.response;

  let body: { token?: unknown; base_url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const baseUrl = typeof body?.base_url === "string" ? body.base_url.trim() : "";
  if (!token || token.length > CANVAS_TOKEN_MAX || !baseUrl) {
    return NextResponse.json({ error: "token and base_url are required" }, { status: 400 });
  }
  if (!isAllowedCanvasUrl(baseUrl)) {
    logger.warn("POST /api/canvas/courses: rejected disallowed base_url", { userId: auth.userId, baseUrl });
    return NextResponse.json({ error: "Invalid Canvas base URL. Please use an HTTPS URL." }, { status: 400 });
  }
  return listCoursesWithToken(auth.userId, token, baseUrl);
}

/**
 * GET /api/canvas/courses
 * Returns list of active Canvas courses for a stored account.
 *
 * @param request - Incoming request with optional account_id query param
 * @returns JSON with courses array [{id, name, course_code}]
 */
export async function GET(request: NextRequest) {
  const auth = await authorize();
  if ("response" in auth) return auth.response;
  const userId = auth.userId;
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");

  // Scoped by user_id inside resolveCanvasAccount, so an account_id
  // belonging to somebody else resolves to nothing rather than to their
  // school.
  const account = await resolveCanvasAccount(supabase, userId, accountId);

  // A Canvas account is connected one of two ways, and only one of them has
  // a token. On the calendar-feed path there is no courses API to call at
  // all: courses exist only as the distinct course names across the feed's
  // events, which is why a class with nothing published yet never appears.
  // Handling that here rather than in the client keeps the feed URL server
  // side and lets one endpoint answer for either kind of account.
  if (!account?.token && account?.icalUrl) {
    try {
      const assignments = await fetchCanvasICalAssignments(account.icalUrl);
      const names = new Set<string>();
      for (const a of assignments) {
        if (a.course_name) names.add(a.course_name);
      }
      const courses = Array.from(names)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({ id: stableIdFromName(name), name, course_code: name }));
      logger.info("GET /api/canvas/courses success (feed)", { userId, accountId, courseCount: courses.length });
      return NextResponse.json({ courses });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("GET /api/canvas/courses failed reading feed", { userId, accountId, error: message });
      return NextResponse.json({ error: "Failed to read the Canvas calendar feed" }, { status: 502 });
    }
  }

  if (!account?.token) {
    return NextResponse.json(
      { error: "No Canvas token configured. Save credentials first, or POST a token to verify it." },
      { status: 400 }
    );
  }

  return listCoursesWithToken(userId, account.token, account.baseUrl);
}
