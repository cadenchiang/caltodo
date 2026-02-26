/**
 * API route for leaving a course chat.
 * POST: Deletes the user's course_memberships row using the admin client
 * to bypass RLS (no DELETE policy exists on course_memberships).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/discussions/leave
 * Body: { courseId: string }
 *
 * Removes the authenticated user's membership from the given course.
 * Uses admin client to bypass RLS since no DELETE policy exists.
 *
 * @returns { success: true } on 200
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`leave-chat:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let courseId: string;
  try {
    const body = await request.json();
    courseId = body.courseId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!courseId || typeof courseId !== "string") {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  try {
    // Verify the user actually has a membership before deleting
    const { data: membership, error: lookupError } = await supabase
      .from("course_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (lookupError || !membership) {
      logger.warn("POST /api/discussions/leave: no membership found", {
        userId: user.id,
        courseId,
      });
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // Use admin client to delete — no DELETE RLS policy on course_memberships
    const admin = createAdminClient();
    const { error: deleteError } = await admin
      .from("course_memberships")
      .delete()
      .eq("id", membership.id);

    if (deleteError) {
      logger.error("POST /api/discussions/leave: delete failed", {
        userId: user.id,
        courseId,
        membershipId: membership.id,
        error: deleteError.message,
      });
      return NextResponse.json({ error: "Failed to leave chat" }, { status: 500 });
    }

    logger.info("POST /api/discussions/leave: membership deleted", {
      userId: user.id,
      courseId,
      membershipId: membership.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/discussions/leave: unexpected error", {
      userId: user.id,
      courseId,
      error: message,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
