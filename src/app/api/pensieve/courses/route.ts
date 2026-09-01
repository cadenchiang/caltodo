/**
 * API route for fetching available Pensieve courses.
 * GET /api/pensieve/courses
 *
 * Fetches the user's Pensieve calendar URL, parses assignments,
 * and returns unique course names for the course selection modal.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveFeedAccountUrl } from "@/lib/account-scope";
import { fetchPensieveAssignments } from "@/lib/pensieve-client";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/pensieve/courses
 * Returns deduplicated course names from the user's Pensieve calendar feed.
 *
 * @returns JSON with courses array [{ id: string, name: string }]
 *   where id is the course name (Pensieve has no numeric IDs).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`pensieve-courses:${user.id}`, 15, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // `account_id` picks one of the user's extra Pensive calendars; without it
  // this is the primary account in the flat credential column.
  const accountId = new URL(request.url).searchParams.get("account_id");
  const calendarUrl = await resolveFeedAccountUrl(
    supabase,
    user.id,
    "pensieve",
    accountId,
    "pensieve_calendar_url"
  );

  if (!calendarUrl) {
    return NextResponse.json(
      { error: "No Pensieve calendar URL configured." },
      { status: 400 }
    );
  }

  try {
    const assignments = await fetchPensieveAssignments(calendarUrl);

    // Deduplicate by course_name
    const courseNames = new Set<string>();
    for (const a of assignments) {
      if (a.course_name) {
        courseNames.add(a.course_name);
      }
    }

    const courses = Array.from(courseNames)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ id: name, name }));

    logger.info("GET /api/pensieve/courses success", {
      userId: user.id,
      courseCount: courses.length,
    });

    return NextResponse.json({ courses });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/pensieve/courses failed", {
      userId: user.id,
      error: message,
    });
    return NextResponse.json({ error: "Failed to load Pensieve courses" }, { status: 500 });
  }
}
