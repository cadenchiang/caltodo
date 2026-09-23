/**
 * API route for fetching members of a course.
 * GET: Returns all members with profiles via a single DB function call.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/discussions/members?courseId=<uuid>
 * Calls get_course_members() — returns all members with name/avatar.
 * Only works if the calling user is enrolled in the course.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`discussion-members:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId query parameter required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.rpc("get_course_members", {
      p_course_id: courseId,
    });

    if (error) {
      logger.error("GET /api/discussions/members: rpc failed", {
        userId: user.id,
        courseId,
        error: error.message,
      });
      return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/discussions/members: unexpected error", {
      userId: user.id,
      courseId,
      error: message,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
