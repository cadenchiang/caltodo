/**
 * POST /api/tasks/invite/[shareId]/respond
 *
 * Accepts or declines a pending task invitation.
 * Only the invitee can respond. On accept, creates a task copy
 * in the invitee's account and updates the share status.
 *
 * @param params.shareId - The share ID to respond to
 * @param body.action - "accept" or "decline"
 * @returns 200 with { success: true, taskId? } on success
 * @returns 400 for invalid action
 * @returns 404 if share not found or not pending
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { updateAttendeeResponseStatus } from "@/lib/gcal/calendar-attendees";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

interface RespondBody {
  action: "accept" | "decline";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`invite-respond:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { shareId } = await params;

  if (!shareId) {
    return NextResponse.json({ error: "Missing shareId" }, { status: 400 });
  }

  let body: RespondBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action !== "accept" && body.action !== "decline") {
    return NextResponse.json({ error: "Action must be 'accept' or 'decline'" }, { status: 400 });
  }

  // Fetch the pending share (invitee only via RLS)
  const { data: share, error: shareError } = await supabase
    .from("task_shares")
    .select("id, source_task_id, inviter_id, invitee_id, status")
    .eq("id", shareId)
    .eq("invitee_id", user.id)
    .single();

  if (shareError || !share) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (share.status !== "pending") {
    return NextResponse.json({ error: "Invite already responded to" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  if (body.action === "decline") {
    const { error: updateError } = await adminClient
      .from("task_shares")
      .update({ status: "declined" })
      .eq("id", shareId);

    if (updateError) {
      logger.error("POST /api/tasks/invite/[shareId]/respond: decline failed", {
        shareId,
        error: updateError.message,
      });
      return NextResponse.json({ error: "Failed to decline invite" }, { status: 500 });
    }

    logger.info("POST /api/tasks/invite/[shareId]/respond: invite declined", { shareId });
    return NextResponse.json({ success: true });
  }

  // Accept: fetch source task, create copy, update share
  const { data: sourceTask, error: taskError } = await adminClient
    .from("tasks")
    .select("*")
    .eq("id", share.source_task_id)
    .single();

  if (taskError || !sourceTask) {
    logger.error("POST /api/tasks/invite/[shareId]/respond: source task not found", {
      shareId,
      sourceTaskId: share.source_task_id,
    });
    return NextResponse.json({ error: "Source task not found" }, { status: 404 });
  }

  // Create task copy in invitee's account
  const { data: copiedTask, error: copyError } = await adminClient
    .from("tasks")
    .insert({
      user_id: user.id,
      title: sourceTask.title,
      description: sourceTask.description || "",
      due_date: sourceTask.due_date,
      due_time: sourceTask.due_time,
      color: sourceTask.color,
      course_name: sourceTask.course_name,
      tags: sourceTask.tags || [],
      is_completed: false,
    })
    .select("id")
    .single();

  if (copyError || !copiedTask) {
    logger.error("POST /api/tasks/invite/[shareId]/respond: task copy failed", {
      shareId,
      error: copyError?.message,
    });
    return NextResponse.json({ error: "Failed to create task copy" }, { status: 500 });
  }

  // Update share status and link copied task
  const { error: updateError } = await adminClient
    .from("task_shares")
    .update({ status: "accepted", copied_task_id: copiedTask.id })
    .eq("id", shareId);

  if (updateError) {
    logger.error("POST /api/tasks/invite/[shareId]/respond: share update failed", {
      shareId,
      error: updateError.message,
    });
    return NextResponse.json({ error: "Failed to update invite status" }, { status: 500 });
  }

  logger.info("POST /api/tasks/invite/[shareId]/respond: invite accepted", {
    shareId,
    newTaskId: copiedTask.id,
  });

  // Fire-and-forget: update GCal attendee status to "accepted" if applicable
  if (sourceTask.google_event_id) {
    syncGCalAcceptStatus(
      supabase,
      share.inviter_id,
      sourceTask.google_event_id,
      user.email ?? ""
    ).catch((err) => {
      logger.warn("POST /api/tasks/invite/[shareId]/respond: GCal sync failed (non-blocking)", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }

  return NextResponse.json({ success: true, taskId: copiedTask.id });
}

/**
 * Fire-and-forget helper to update the invitee's attendee status
 * on the inviter's Google Calendar event to "accepted".
 * Silently skips if the inviter does not have GCal connected.
 *
 * @param supabase - Authenticated Supabase client
 * @param inviterId - The inviter's user ID (owns the GCal event)
 * @param googleEventId - The Google Calendar event ID
 * @param inviteeEmail - The invitee's email address
 */
async function syncGCalAcceptStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  inviterId: string,
  googleEventId: string,
  inviteeEmail: string
): Promise<void> {
  if (!inviteeEmail) return;

  const accessToken = await getValidAccessToken(supabase, inviterId);
  if (!accessToken) return;

  const calendarId = await getCalendarId(supabase, inviterId);
  if (!calendarId) return;

  await updateAttendeeResponseStatus(
    accessToken,
    calendarId,
    googleEventId,
    inviteeEmail,
    "accepted"
  );
}
