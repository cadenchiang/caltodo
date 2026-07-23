/**
 * API route for fetching a user's profile with shared courses.
 * GET: Returns user name, avatar, and courses shared with the requester.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/discussions/profile?userId=<uuid>
 * Returns the target user's name, avatar, and courses shared with the requester.
 *
 * @param request - The incoming request with userId query param
 * @returns { userName, userAvatar, sharedCourses }
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`discussion-profile:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId query parameter required" }, { status: 400 });
  }

  try {
    // Fetch target user's profile via admin client (auth.admin)
    const admin = createAdminClient();
    const { data: targetUser, error: userError } = await admin.auth.admin.getUserById(userId);

    if (userError || !targetUser?.user) {
      logger.warn("GET /api/discussions/profile: user not found", { userId, requesterId: user.id });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = targetUser.user.user_metadata?.full_name ?? null;
    const userAvatar = targetUser.user.user_metadata?.avatar_url ?? null;

    // Requester's own course ids — RLS correctly scopes this to the caller.
    const { data: myMemberships } = await supabase
      .from("course_memberships")
      .select("course_id")
      .eq("user_id", user.id);
    const myCourseIds = new Set((myMemberships ?? []).map((m) => m.course_id));

    // Target's memberships must be read with the ADMIN client — under the
    // caller's RLS a query for another user's rows returns nothing, which made
    // sharedCourses silently always empty and the identity gate never fire.
    const { data: targetMemberships, error: courseError } = await admin
      .from("course_memberships")
      .select("course_id, courses!inner(id, name, source)")
      .eq("user_id", userId);

    if (courseError) {
      logger.error("GET /api/discussions/profile: course query failed", {
        userId,
        requesterId: user.id,
        error: courseError.message,
      });
      return NextResponse.json({ error: "Failed to fetch shared courses" }, { status: 500 });
    }

    const shared = (targetMemberships ?? [])
      .filter((m) => myCourseIds.has(m.course_id))
      .map((m) => {
        const course = m.courses as unknown as { id: string; name: string; source: string };
        return { id: course.id, name: course.name, source: course.source };
      });

    // Only disclose identity to someone who actually shares a course with the
    // target — otherwise any authenticated user could harvest every user's
    // name + avatar by iterating user ids.
    if (shared.length === 0) {
      return NextResponse.json({ error: "No shared courses" }, { status: 403 });
    }

    logger.info("GET /api/discussions/profile", {
      requesterId: user.id,
      targetUserId: userId,
      sharedCount: shared.length,
    });

    return NextResponse.json({ userName, userAvatar, sharedCourses: shared });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/discussions/profile: unexpected error", {
      userId,
      requesterId: user.id,
      error: message,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
