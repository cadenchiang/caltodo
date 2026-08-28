/**
 * API route for the Google Classroom integration.
 * Cookie-authenticated (standard Supabase session).
 *
 * GET   — Lists the user's active Classroom courses, using the Google tokens
 *         the Calendar integration already stores.
 * PATCH — Saves whether Classroom syncing is on and which courses to sync.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { fetchClassroomCourses, ClassroomScopeError } from "@/lib/classroom-client";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Requests per minute per user across both methods. */
const RATE_LIMIT_PER_MINUTE = 20;

/**
 * Resolves the signed-in user and applies the rate limit.
 *
 * @returns The session and user id, or a response to return immediately
 */
async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`classroom:${user.id}`, RATE_LIMIT_PER_MINUTE, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return { userId: user.id, supabase };
}

/**
 * GET /api/classroom
 * Returns the user's active Classroom courses.
 */
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const accessToken = await getValidAccessToken(auth.supabase, auth.userId);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Connect Google first.", needsGoogle: true },
        { status: 400 }
      );
    }

    const courses = await fetchClassroomCourses(accessToken);
    return NextResponse.json({ courses });
  } catch (err) {
    // A grant made before Classroom scopes existed fails here. Say so
    // specifically, so the UI offers "reconnect" rather than a dead end.
    if (err instanceof ClassroomScopeError) {
      logger.warn("GET /api/classroom: scopes not granted", {
        cause: err.message,
        userId: auth.userId,
        impact: "user prompted to reconnect Google",
      });
      return NextResponse.json(
        { error: err.message, needsReconnect: true },
        { status: 403 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/classroom failed", {
      cause: message,
      userId: auth.userId,
      impact: "course picker could not load",
    });
    return NextResponse.json({ error: "Failed to load Classroom courses" }, { status: 500 });
  }
}

/**
 * PATCH /api/classroom
 * Body: { enabled?: boolean, courses?: Array<{ id, name }> }
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (typeof body.enabled === "boolean") {
    update.classroom_enabled = body.enabled;
    // Turning it back on should retry rather than stay stuck on a stale
    // failure flag from a previous grant.
    if (body.enabled) update.classroom_auth_failed = false;
  }

  if (Array.isArray(body.courses)) {
    const courses = body.courses
      .filter(
        (c): c is { id: string; name: string } =>
          !!c && typeof c === "object" &&
          typeof (c as { id?: unknown }).id === "string" &&
          typeof (c as { name?: unknown }).name === "string"
      )
      .map((c) => ({ id: c.id, name: c.name }));
    update.selected_classroom_courses = courses;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("integration_credentials")
    .upsert({ user_id: auth.userId, ...update }, { onConflict: "user_id" });

  if (error) {
    logger.error("PATCH /api/classroom failed", {
      cause: error.message,
      userId: auth.userId,
      impact: "Classroom settings were not saved",
    });
    return NextResponse.json({ error: "Failed to save Classroom settings" }, { status: 500 });
  }

  logger.info("PATCH /api/classroom saved", {
    userId: auth.userId,
    enabled: update.classroom_enabled,
    courseCount: Array.isArray(update.selected_classroom_courses)
      ? update.selected_classroom_courses.length
      : undefined,
  });

  return NextResponse.json({ saved: true });
}
