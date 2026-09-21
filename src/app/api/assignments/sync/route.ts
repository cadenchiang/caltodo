/**
 * API route to trigger assignment sync from Canvas and Gradescope.
 * POST: Runs the sync engine and returns results.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSync, type SyncCourseOverrides, type SyncPlatform } from "@/lib/sync-engine";
import { emptySyncResult, parsePlatformFilter } from "@/lib/sync-platforms";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * The sync fetches several upstreams in one function and paginates Canvas.
 * At the 10s default one slow page killed it mid-write (audit M7). Segment
 * config must be a literal, so this is spelled out; it must agree with the
 * entry for this route in vercel.json and with SYNC_FUNCTION_MAX_DURATION_MS
 * in sync-budget.ts, and the budget test checks all three.
 */
export const maxDuration = 60;

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

    // Optional platform filter: only sync specific platforms. The valid set
    // derives from the engine's platform list; a literal set here once
    // stopped at Brightspace, so Blackboard and Classroom setup syncs were
    // filtered to nothing and silently never ran.
    const filter = parsePlatformFilter(body.platforms);

    // An explicitly-provided but empty/all-invalid filter means "sync nothing",
    // NOT a full sync. runSync treats [] as "sync all", so short-circuit here to
    // avoid an unintended full sync (incl. a Gradescope login) on a bad filter.
    if (filter.kind === "none") {
      logger.warn("POST /api/assignments/sync: platform filter named no known platform", {
        userId: user.id,
        cause: "platforms was an array with no valid entries",
        requested: body.platforms,
        impact: "nothing was synced",
      });
      return NextResponse.json(emptySyncResult(new Date().toISOString()));
    }
    const platforms: SyncPlatform[] | undefined = filter.kind === "some" ? filter.platforms : undefined;

    logger.info("POST /api/assignments/sync started", { userId: user.id, timezone, hasOverrides: !!courseOverrides, forceGradescope, platforms });
    const result = await runSync(supabase, user.id, timezone, courseOverrides, forceGradescope, platforms);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/assignments/sync failed", { userId: user.id, error: message });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
