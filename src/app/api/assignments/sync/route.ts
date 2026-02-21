/**
 * API route to trigger assignment sync from Canvas and Gradescope.
 * POST: Runs the sync engine and returns results.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSync, type SyncCourseOverrides } from "@/lib/sync-engine";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/assignments/sync
 * Triggers a full sync from both Canvas and Gradescope.
 * Accepts optional { timezone } in request body for timezone-aware date conversion.
 * Returns sync results with counts and any errors per source.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`assignments-sync:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const rawTimezone = (body.timezone as string) || "America/Los_Angeles";

    // Validate timezone against IANA database to prevent injection of arbitrary strings
    const validTimezones = Intl.supportedValuesOf("timeZone");
    const timezone = validTimezones.includes(rawTimezone) ? rawTimezone : "America/Los_Angeles";

    // Build course overrides if provided by the client
    const courseOverrides: SyncCourseOverrides | undefined =
      (body.canvas_courses || body.gradescope_courses)
        ? {
            canvas_courses: body.canvas_courses as SyncCourseOverrides["canvas_courses"],
            gradescope_courses: body.gradescope_courses as SyncCourseOverrides["gradescope_courses"],
          }
        : undefined;

    // Manual syncs (with overrides or explicit force flag) bypass the Gradescope 30-min cooldown
    const forceGradescope = !!courseOverrides || body.forceGradescope === true;

    logger.info("POST /api/assignments/sync started", { userId: user.id, timezone, hasOverrides: !!courseOverrides, forceGradescope });
    const result = await runSync(supabase, user.id, timezone, courseOverrides, forceGradescope);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/assignments/sync failed", { userId: user.id, error: message });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
