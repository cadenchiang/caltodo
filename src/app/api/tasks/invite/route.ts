/**
 * POST /api/tasks/invite
 *
 * Invites a user to an assignment by email.
 * Creates a copy of the task in the invitee's account and records the share.
 * If the inviter has Google Calendar connected and the task has a GCal event,
 * adds the invitee as an attendee (fire-and-forget).
 *
 * @param body.taskId - The task to share
 * @param body.email - The invitee's email address
 *
 * @returns 200 with share record on success
 * @returns 400 for invalid input or self-invite
 * @returns 404 if invitee not on caltodo ("not_on_caltodo")
 * @returns 409 if already shared ("already_shared")
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { addAttendeeToEvent } from "@/lib/gcal/calendar-attendees";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

interface InviteRequestBody {
  taskId: string;
  email: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`task-invite:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: InviteRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { taskId, email } = body;

  if (!taskId || !email) {
    return NextResponse.json({ error: "Missing taskId or email" }, { status: 400 });
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Self-invite check
  if (trimmedEmail === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Cannot invite yourself", code: "self_invite" }, { status: 400 });
  }

  // Verify task ownership
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();

  if (taskError || !task) {
    logger.warn("POST /api/tasks/invite: task not found or not owned", { taskId, userId: user.id });
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Look up invitee by email using admin client
  const adminClient = createAdminClient();
  const inviteeId = await lookupUserByEmail(adminClient, trimmedEmail);

  if (!inviteeId) {
    logger.info("POST /api/tasks/invite: invitee not on caltodo", { email: trimmedEmail });
    return NextResponse.json(
      { error: "User not found on caltodo", code: "not_on_caltodo" },
      { status: 404 }
    );
  }

  // Self-invite check (by ID, in case email alias differs)
  if (inviteeId === user.id) {
    return NextResponse.json({ error: "Cannot invite yourself", code: "self_invite" }, { status: 400 });
  }

  // Check for duplicate share
  const { data: existingShare } = await supabase
    .from("task_shares")
    .select("id")
    .eq("source_task_id", taskId)
    .eq("invitee_id", inviteeId)
    .single();

  if (existingShare) {
    return NextResponse.json(
      { error: "Already shared with this user", code: "already_shared" },
      { status: 409 }
    );
  }

  // Create task copy in invitee's account (admin client bypasses RLS)
  const { data: copiedTask, error: copyError } = await adminClient
    .from("tasks")
    .insert({
      user_id: inviteeId,
      title: task.title,
      description: task.description || "",
      due_date: task.due_date,
      due_time: task.due_time,
      color: task.color,
      course_name: task.course_name,
      tags: task.tags || [],
      is_completed: false,
    })
    .select("id")
    .single();

  if (copyError || !copiedTask) {
    logger.error("POST /api/tasks/invite: failed to create task copy", {
      taskId,
      inviteeId,
      error: copyError?.message,
    });
    return NextResponse.json({ error: "Failed to create task copy" }, { status: 500 });
  }

  // Insert task_shares row
  const { data: share, error: shareError } = await supabase
    .from("task_shares")
    .insert({
      source_task_id: taskId,
      inviter_id: user.id,
      invitee_id: inviteeId,
      copied_task_id: copiedTask.id,
      invitee_email: trimmedEmail,
    })
    .select("*")
    .single();

  if (shareError) {
    logger.error("POST /api/tasks/invite: failed to insert share", {
      taskId,
      inviteeId,
      error: shareError.message,
    });
    return NextResponse.json({ error: "Failed to create share" }, { status: 500 });
  }

  logger.info("POST /api/tasks/invite: share created", {
    shareId: share.id,
    taskId,
    inviteeEmail: trimmedEmail,
  });

  // Fire-and-forget: add invitee as GCal attendee if inviter has GCal connected
  if (task.google_event_id) {
    addGCalAttendee(supabase, user.id, task.google_event_id, trimmedEmail).catch((err) => {
      logger.warn("POST /api/tasks/invite: GCal attendee addition failed (non-blocking)", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }

  return NextResponse.json({ share });
}

/**
 * Fire-and-forget helper to add an attendee to a Google Calendar event.
 * Silently skips if GCal is not connected.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The inviter's user ID
 * @param googleEventId - The Google Calendar event ID
 * @param email - The invitee's email address
 */
async function addGCalAttendee(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  googleEventId: string,
  email: string
): Promise<void> {
  const accessToken = await getValidAccessToken(supabase, userId);
  if (!accessToken) return;

  const calendarId = await getCalendarId(supabase, userId);
  if (!calendarId) return;

  await addAttendeeToEvent(accessToken, calendarId, googleEventId, email);
}

/**
 * Looks up a user by email using the admin Supabase client.
 * Uses listUsers and filters by email client-side.
 * Sufficient for a school-sized user base (<1000 users).
 *
 * @param adminClient - Supabase admin client (service role)
 * @param email - Email address to look up (case-insensitive)
 * @returns The user's UUID if found, or null
 */
async function lookupUserByEmail(
  adminClient: ReturnType<typeof createAdminClient>,
  email: string
): Promise<string | null> {
  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error || !data?.users) return null;

  const match = data.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  return match?.id ?? null;
}
