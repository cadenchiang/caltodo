/**
 * API route to trigger assignment sync from Canvas and Gradescope.
 * POST: Runs the sync engine and returns results.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSync, type SyncCourseOverrides } from "@/lib/sync-engine";
import { logger } from "@/lib/logger";

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

  try {
    const body = await request.json().catch(() => ({}));
    const timezone = body.timezone || "America/Los_Angeles";

    // Build course overrides if provided by the client
    const courseOverrides: SyncCourseOverrides | undefined =
      (body.canvas_courses || body.gradescope_courses)
        ? {
            canvas_courses: body.canvas_courses,
            gradescope_courses: body.gradescope_courses,
          }
        : undefined;

    logger.info("POST /api/assignments/sync started", { userId: user.id, timezone, hasOverrides: !!courseOverrides });
    const result = await runSync(supabase, user.id, timezone, courseOverrides);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/assignments/sync failed", { userId: user.id, error: message });
    return NextResponse.json({ error: "Sync failed: " + message }, { status: 500 });
  }
}
