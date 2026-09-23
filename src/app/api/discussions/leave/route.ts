/**
 * API route for leaving a course chat.
 * POST: Soft-deletes the user's course_memberships row (sets deleted_at)
 * using the admin client to bypass RLS (no UPDATE policy on the table).
 *
 * The row is kept rather than deleted because it is the only record that
 * the user left. A hard delete left nothing behind, so the next assignment
 * sync re-created the membership and announced the user as having joined,
 * while the leave modal promised "You cannot join back ever again".
 * course-enrollment.ts leaves existing rows alone; this row's deleted_at is
 * what keeps the user out.
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
 * Marks the authenticated user's membership in the given course as left.
 * Uses admin client to bypass RLS since no UPDATE policy exists.
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
    // Verify the user actually holds a live membership before leaving. A
    // row already marked deleted is not a membership, so leaving twice 404s.
    const { data: membership, error: lookupError } = await supabase
      .from("course_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .is("deleted_at", null)
      .single();

    if (lookupError || !membership) {
      logger.warn("POST /api/discussions/leave: no membership found", {
        userId: user.id,
        courseId,
      });
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // Soft delete with the admin client: no UPDATE RLS policy on the table.
    const admin = createAdminClient();
    const { error: leaveError } = await admin
      .from("course_memberships")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", membership.id)
      .is("deleted_at", null);

    if (leaveError) {
      logger.error("POST /api/discussions/leave: soft delete failed", {
        userId: user.id,
        courseId,
        membershipId: membership.id,
        cause: leaveError.message,
        impact: "user remains a member of the chat",
      });
      return NextResponse.json({ error: "Failed to leave chat" }, { status: 500 });
    }

    logger.info("POST /api/discussions/leave: membership marked left", {
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
