/**
 * API route for fetching Canvas courses.
 * GET /api/canvas/courses?token=...&base_url=...
 * GET /api/canvas/courses?account_id=...
 *
 * If token and base_url are provided, uses them directly (for onboarding
 * verification, before anything has been saved). Otherwise reads a stored
 * account: `account_id` selects one of the user's additional Canvas schools,
 * and its absence means the primary account in the flat credential columns.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCanvasCourses } from "@/lib/canvas-client";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedCanvasUrl } from "@/lib/canvas-url-validation";
import { resolveCanvasAccount } from "@/lib/account-scope";

/**
 * GET /api/canvas/courses
 * Returns list of active Canvas courses for the user.
 *
 * @param request - Incoming request with optional token and base_url query params
 * @returns JSON with courses array [{id, name, course_code}]
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`canvas-courses:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get("token");
  const queryBaseUrl = searchParams.get("base_url");
  const accountId = searchParams.get("account_id");

  let token: string;
  let baseUrl: string;

  // Fall back to stored credentials if no query params
  if (queryToken && queryBaseUrl) {
    if (!isAllowedCanvasUrl(queryBaseUrl)) {
      logger.warn("GET /api/canvas/courses: rejected disallowed base_url", {
        userId: user.id,
        baseUrl: queryBaseUrl,
      });
      return NextResponse.json(
        { error: "Invalid Canvas base URL. Please use an HTTPS URL." },
        { status: 400 }
      );
    }
    token = queryToken;
    baseUrl = queryBaseUrl;
  } else {
    // Scoped by user_id inside resolveCanvasAccount, so an account_id
    // belonging to somebody else resolves to nothing rather than to their
    // school.
    const account = await resolveCanvasAccount(supabase, user.id, accountId);

    if (!account?.token) {
      return NextResponse.json(
        { error: "No Canvas token configured. Provide token and base_url query params or save credentials first." },
        { status: 400 }
      );
    }

    token = account.token;
    baseUrl = account.baseUrl;
  }

  try {
    const courses = await fetchCanvasCourses(token, baseUrl);
    logger.info("GET /api/canvas/courses success", { userId: user.id, courseCount: courses.length });
    return NextResponse.json({ courses });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/canvas/courses failed", { userId: user.id, error: message });
    // Preserve the auth/rate-limit STATUS the onboarding UI branches on (401 ->
    // "Invalid access token", 403 -> rate limit) while keeping the body generic.
    const isAuth = /invalid or expired|token is invalid|\b401\b|unauthorized/i.test(message);
    const isRate = /rate limit|\b403\b/i.test(message);
    if (isAuth) return NextResponse.json({ error: "Canvas token is invalid or expired." }, { status: 401 });
    if (isRate) return NextResponse.json({ error: "Canvas rate limit exceeded. Try again later." }, { status: 403 });
    return NextResponse.json({ error: "Failed to load Canvas courses" }, { status: 500 });
  }
}
