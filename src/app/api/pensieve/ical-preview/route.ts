/**
 * API route for previewing courses from a Pensieve iCal feed URL.
 * POST /api/pensieve/ical-preview
 *
 * Fetches the iCal feed, parses unique course names from VEVENT entries,
 * and returns them for course selection during onboarding.
 *
 * @param request - JSON body with { url: string }
 * @returns JSON with courses array [{ name: string }]
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseICalEvents } from "@/lib/pensieve-client";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const FETCH_TIMEOUT_MS = 15_000;
const PENSIEVE_URL_REGEX = /^https:\/\/api\.pensieve\.co\/api\/calendar\/[^/]+\.ics$/;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`pensieve-preview:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url || !PENSIEVE_URL_REGEX.test(url)) {
    return NextResponse.json(
      { error: "Invalid Pensieve URL." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      logger.error("POST /api/pensieve/ical-preview: feed fetch failed", {
        userId: user.id,
        status: res.status,
      });
      return NextResponse.json(
        { error: `Failed to fetch calendar feed: ${res.status}` },
        { status: 502 }
      );
    }

    const icsText = await res.text();
    const assignments = parseICalEvents(icsText);

    // Extract unique course names
    const courseNames = new Set<string>();
    for (const a of assignments) {
      if (a.course_name) {
        courseNames.add(a.course_name);
      }
    }

    const courses = Array.from(courseNames)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name }));

    logger.info("POST /api/pensieve/ical-preview success", {
      userId: user.id,
      courseCount: courses.length,
      assignmentCount: assignments.length,
    });

    return NextResponse.json({ courses });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/pensieve/ical-preview failed", {
      userId: user.id,
      error: message,
    });
    return NextResponse.json({ error: "Failed to load calendar preview" }, { status: 500 });
  }
}
