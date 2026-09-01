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
import { fetchCanvasICalAssignments } from "@/lib/canvas-ical-client";
import { stableIdFromName } from "@/lib/course-enrollment";

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
        logger.info("GET /api/canvas/courses success (feed)", {
          userId: user.id,
          accountId,
          courseCount: courses.length,
        });
        return NextResponse.json({ courses });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("GET /api/canvas/courses failed reading feed", {
          userId: user.id,
          accountId,
          error: message,
        });
        return NextResponse.json({ error: "Failed to read the Canvas calendar feed" }, { status: 502 });
      }
    }

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
