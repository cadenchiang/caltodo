/**
 * API route for fetching members of a course.
 * GET: Returns all members with profiles via a single DB function call.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Default and maximum page size for the member list. */
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * GET /api/discussions/members?courseId=<uuid>&limit=50&offset=0
 * Calls get_course_members() (name and avatar per member, only for an
 * enrolled caller) and returns one page of it. The response carries the
 * total in X-Total-Count so the client knows whether to offer "Show more".
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
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);

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

    const all = (data ?? []) as unknown[];
    return NextResponse.json(all.slice(offset, offset + limit), {
      headers: { "X-Total-Count": String(all.length) },
    });
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
