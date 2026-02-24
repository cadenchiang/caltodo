/**
 * DELETE /api/tasks/invite/[shareId]
 *
 * Revokes a task share. Only the inviter can revoke.
 * If the original task has a GCal event, removes the invitee as attendee.
 *
 * @param params.shareId - The share ID to revoke
 * @returns 200 on success
 * @returns 404 if share not found or not owned by the user
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { removeAttendeeFromEvent } from "@/lib/gcal/calendar-attendees";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`task-invite-revoke:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { shareId } = await params;

  if (!shareId) {
    return NextResponse.json({ error: "Missing shareId" }, { status: 400 });
  }

  // Fetch the share (RLS ensures only inviter can see it)
  const { data: share, error: shareError } = await supabase
    .from("task_shares")
    .select("id, source_task_id, invitee_email")
    .eq("id", shareId)
    .eq("inviter_id", user.id)
    .single();

  if (shareError || !share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  // Fetch the source task to check for GCal event
  const { data: task } = await supabase
    .from("tasks")
    .select("google_event_id")
    .eq("id", share.source_task_id)
    .eq("user_id", user.id)
    .single();

  // Delete the share row
  const { error: deleteError } = await supabase
    .from("task_shares")
    .delete()
    .eq("id", shareId)
    .eq("inviter_id", user.id);

  if (deleteError) {
    logger.error("DELETE /api/tasks/invite/[shareId]: failed to delete share", {
      shareId,
      error: deleteError.message,
    });
    return NextResponse.json({ error: "Failed to revoke share" }, { status: 500 });
  }

  logger.info("DELETE /api/tasks/invite/[shareId]: share revoked", {
    shareId,
    inviteeEmail: share.invitee_email,
  });

  // Fire-and-forget: remove invitee from GCal attendees
  if (task?.google_event_id) {
    removeGCalAttendee(supabase, user.id, task.google_event_id, share.invitee_email).catch(
      (err) => {
        logger.warn("DELETE /api/tasks/invite/[shareId]: GCal attendee removal failed (non-blocking)", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    );
  }

  return NextResponse.json({ success: true });
}

/**
 * Fire-and-forget helper to remove an attendee from a Google Calendar event.
 * Silently skips if GCal is not connected.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The inviter's user ID
 * @param googleEventId - The Google Calendar event ID
 * @param email - The invitee's email to remove
 */
async function removeGCalAttendee(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  googleEventId: string,
  email: string
): Promise<void> {
  const accessToken = await getValidAccessToken(supabase, userId);
  if (!accessToken) return;

  const calendarId = await getCalendarId(supabase, userId);
  if (!calendarId) return;

  await removeAttendeeFromEvent(accessToken, calendarId, googleEventId, email);
}
