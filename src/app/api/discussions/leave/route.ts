/**
 * API route for hiding and unhiding a course chat.
 *
 * "Leave" is a hide: POST soft-deletes the user's course_memberships row
 * (sets deleted_at) and PATCH clears it again. The row is kept rather than
 * deleted because it is the only record that the user hid the chat; a hard
 * delete let the next assignment sync re-create the membership (audit H12).
 * get_my_course_ids / get_user_boards / get_course_members all filter
 * deleted_at IS NULL, so a hidden chat disappears from the list, the
 * notifier and the member list until it is unhidden.
 *
 * System courses (CalYak) cannot be hidden server-side. The client hides
 * them per device with a localStorage preference plus mute instead, so the
 * membership that auto_enroll_calfam() maintains is never soft-deleted.
 *
 * Both writes use the admin client: the table has no UPDATE policy.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Parsed and validated request body, or an error response. */
async function readCourseId(request: Request): Promise<{ courseId: string } | NextResponse> {
  let courseId: unknown;
  try {
    const body = await request.json();
    courseId = body?.courseId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!courseId || typeof courseId !== "string") {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }
  return { courseId };
}

/**
 * Rejects the request when the course is a system course.
 *
 * @returns null when the course may be hidden, otherwise the 403 response
 */
async function rejectSystemCourse(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  courseId: string,
): Promise<NextResponse | null> {
  const { data: course } = await supabase
    .from("courses")
    .select("source")
    .eq("id", courseId)
    .maybeSingle();
  if (course?.source === "system") {
    logger.warn("discussions/leave: refused to hide a system course", {
      userId,
      courseId,
      cause: "system memberships are maintained by auto_enroll_calfam() and are hidden per device instead",
      impact: "membership left untouched",
    });
    return NextResponse.json({ error: "System chats cannot be hidden here" }, { status: 403 });
  }
  return null;
}

/**
 * POST /api/discussions/leave
 * Body: { courseId: string }
 *
 * Hides the chat: marks the authenticated user's live membership deleted.
 *
 * @returns { success: true } on 200; 403 for system courses; 404 when there
 *          is no live membership (hiding twice is a 404)
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

  const parsed = await readCourseId(request);
  if (parsed instanceof NextResponse) return parsed;
  const { courseId } = parsed;

  try {
    const refusal = await rejectSystemCourse(supabase, user.id, courseId);
    if (refusal) return refusal;

    const { data: membership, error: lookupError } = await supabase
      .from("course_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .is("deleted_at", null)
      .single();

    if (lookupError || !membership) {
      logger.warn("POST /api/discussions/leave: no live membership found", { userId: user.id, courseId });
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    const admin = createAdminClient();
    const { error: hideError } = await admin
      .from("course_memberships")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", membership.id)
      .is("deleted_at", null);

    if (hideError) {
      logger.error("POST /api/discussions/leave: hide failed", {
        userId: user.id,
        courseId,
        membershipId: membership.id,
        cause: hideError.message,
        impact: "chat stays visible in the user's list",
      });
      return NextResponse.json({ error: "Failed to hide chat" }, { status: 500 });
    }

    logger.info("POST /api/discussions/leave: chat hidden", {
      userId: user.id,
      courseId,
      membershipId: membership.id,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/discussions/leave: unexpected error", { userId: user.id, courseId, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/discussions/leave
 * Body: { courseId: string }
 *
 * Unhides the chat: clears deleted_at on the user's hidden membership.
 *
 * @returns { success: true } on 200; 404 when no hidden membership exists
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`unhide-chat:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = await readCourseId(request);
  if (parsed instanceof NextResponse) return parsed;
  const { courseId } = parsed;

  try {
    // The user's own soft-deleted row is not visible through RLS (the
    // membership policies filter deleted_at), so look it up as admin.
    const admin = createAdminClient();
    const { data: membership, error: lookupError } = await admin
      .from("course_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .not("deleted_at", "is", null)
      .maybeSingle();

    if (lookupError || !membership) {
      logger.warn("PATCH /api/discussions/leave: no hidden membership found", {
        userId: user.id,
        courseId,
        error: lookupError?.message,
      });
      return NextResponse.json({ error: "Hidden chat not found" }, { status: 404 });
    }

    const { error: unhideError } = await admin
      .from("course_memberships")
      .update({ deleted_at: null })
      .eq("id", membership.id);

    if (unhideError) {
      logger.error("PATCH /api/discussions/leave: unhide failed", {
        userId: user.id,
        courseId,
        membershipId: membership.id,
        cause: unhideError.message,
        impact: "chat stays hidden",
      });
      return NextResponse.json({ error: "Failed to unhide chat" }, { status: 500 });
    }

    logger.info("PATCH /api/discussions/leave: chat unhidden", {
      userId: user.id,
      courseId,
      membershipId: membership.id,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("PATCH /api/discussions/leave: unexpected error", { userId: user.id, courseId, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
