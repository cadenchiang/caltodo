import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  authenticateMobile,
  applyCompletionInvariant,
  applyDismissalInvariant,
} from "@/lib/mobile-task-helpers";

/**
 * PATCH /api/mobile/tasks/:taskId
 * Updates fields on an existing task.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const auth = await authenticateMobile(req, "PATCH /api/mobile/tasks/:taskId");
  if ("response" in auth) return auth.response;
  const { supabase, user } = auth;

  const { taskId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Allowlist the fields a client may edit: the canonical TaskUpdate editable
  // set (src/lib/types.ts). Never let the client set user_id/id/source/
  // external_id/is_submitted; spreading raw body into .update() was a
  // mass-assignment vector (e.g. reassigning user_id).
  const ALLOWED = [
    "title", "description", "due_date", "due_time", "is_completed", "color",
    "repeat_interval", "repeat_unit", "repeat_end_date", "repeat_end_count",
    "completed_at", "tags", "snoozed_until", "sort_order", "course_name",
    "dismissed_at",
  ] as const;
  const fields: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) fields[key] = body[key];
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  // Completion and dismissal each span two columns the client can set
  // independently; derive the second from the first so the archive purge
  // and the sync engine see what the user meant.
  const update = applyDismissalInvariant(applyCompletionInvariant(fields));

  const { data, error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", taskId)
    .select()
    .maybeSingle();

  if (error) {
    logger.error("PATCH /api/mobile/tasks/:taskId: update failed", {
      userId: user.id,
      taskId,
      fields: Object.keys(update),
      error: error.message,
      impact: "edit not saved; client shows an error",
    });
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
  // RLS scopes to the owner: a missing/foreign task matches 0 rows, so 404
  // rather than a raw 500 from .single().
  if (!data) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/mobile/tasks/:taskId
 * Soft-deletes a task by setting dismissed_at.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const auth = await authenticateMobile(req, "DELETE /api/mobile/tasks/:taskId");
  if ("response" in auth) return auth.response;
  const { supabase, user } = auth;

  const { taskId } = await params;

  const { data, error } = await supabase
    .from("tasks")
    .update({ dismissed_at: new Date().toISOString(), dismissed_by_user: true })
    .eq("id", taskId)
    .select("id");

  if (error) {
    logger.error("DELETE /api/mobile/tasks/:taskId: dismiss failed", {
      userId: user.id,
      taskId,
      error: error.message,
      impact: "task not dismissed; client shows an error",
    });
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
  // 0 rows affected (missing/foreign task under RLS): 404 instead of a
  // misleading success.
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
