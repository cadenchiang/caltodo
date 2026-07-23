/**
 * API route to trigger assignment sync from Canvas and Gradescope.
 * POST: Runs the sync engine and returns results.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSync, type SyncCourseOverrides, type SyncPlatform } from "@/lib/sync-engine";
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

    // Only an EXPLICIT user-initiated force bypasses the Gradescope 30-min
    // login cooldown. Previously the mere presence of course overrides forced
    // it, so the onboarding course-selection flow (which sends overrides) could
    // trigger repeated logins in minutes and trip Gradescope's anti-abuse
    // lockout. Overrides still change WHICH courses sync; they just no longer
    // bypass the cooldown. First-ever sync passes anyway (no prior timestamp).
    const forceGradescope = body.forceGradescope === true;

    // Optional platform filter — only sync specific platforms
    const VALID_PLATFORMS = new Set<SyncPlatform>(["canvas", "gradescope", "pensieve", "brightspace"]);
    const platforms: SyncPlatform[] | undefined = Array.isArray(body.platforms)
      ? (body.platforms as string[]).filter((p): p is SyncPlatform => VALID_PLATFORMS.has(p as SyncPlatform))
      : undefined;

    // An explicitly-provided but empty/all-invalid filter means "sync nothing" —
    // NOT a full sync. runSync treats [] as "sync all", so short-circuit here to
    // avoid an unintended full sync (incl. a Gradescope login) on a bad filter.
    if (Array.isArray(body.platforms) && platforms && platforms.length === 0) {
      const empty = { synced: 0, errors: [] as string[] };
      return NextResponse.json({
        canvas: empty, gradescope: empty, pensieve: empty, brightspace: empty,
        last_synced_at: new Date().toISOString(),
      });
    }

    logger.info("POST /api/assignments/sync started", { userId: user.id, timezone, hasOverrides: !!courseOverrides, forceGradescope, platforms });
    const result = await runSync(supabase, user.id, timezone, courseOverrides, forceGradescope, platforms);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/assignments/sync failed", { userId: user.id, error: message });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
