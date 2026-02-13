/**
 * API route for fetching Canvas courses.
 * GET /api/canvas/courses?token=...&base_url=...
 *
 * If query params are provided, uses them directly (for onboarding verification).
 * Otherwise falls back to stored credentials from the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCanvasCourses } from "@/lib/canvas-client";
import { logger } from "@/lib/logger";

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

  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get("token");
  const queryBaseUrl = searchParams.get("base_url");

  let token: string;
  let baseUrl: string;

  // Fall back to stored credentials if no query params
  if (queryToken && queryBaseUrl) {
    token = queryToken;
    baseUrl = queryBaseUrl;
  } else {
    const { data: creds } = await supabase
      .from("integration_credentials")
      .select("canvas_token, canvas_base_url")
      .eq("user_id", user.id)
      .single();

    if (!creds?.canvas_token) {
      return NextResponse.json(
        { error: "No Canvas token configured. Provide token and base_url query params or save credentials first." },
        { status: 400 }
      );
    }

    token = creds.canvas_token;
    baseUrl = creds.canvas_base_url;
  }

  try {
    const courses = await fetchCanvasCourses(token, baseUrl);
    logger.info("GET /api/canvas/courses success", { userId: user.id, courseCount: courses.length });
    return NextResponse.json({ courses });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/canvas/courses failed", { userId: user.id, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
