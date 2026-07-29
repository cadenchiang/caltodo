import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client authenticated with the Bearer token.
 */
function getAuthClient(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

/**
 * PATCH /api/mobile/tasks/:taskId
 * Updates fields on an existing task.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const supabase = getAuthClient(req);
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Allowlist the fields a client may edit — the canonical TaskUpdate editable
  // set (src/lib/types.ts). Never let the client set user_id/id/source/
  // external_id/is_submitted — spreading raw body into .update() was a
  // mass-assignment vector (e.g. reassigning user_id).
  const ALLOWED = [
    "title", "description", "due_date", "due_time", "is_completed", "color",
    "repeat_interval", "repeat_unit", "repeat_end_date", "repeat_end_count",
    "completed_at", "tags", "snoozed_until", "sort_order", "course_name",
    "dismissed_at",
  ] as const;
  const update: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) update[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  // Keep is_completed and completed_at consistent. They are two independent
  // entries in ALLOWED, so a client could set one without the other, and
  // clients did: prod holds 44 tasks that are complete with a null
  // completed_at. That is not cosmetic — the nightly archive purge in
  // cron/push-reminders deletes on `completed_at < cutoff`, so a null one is
  // invisible to it and the row is retained forever. The web client's
  // toggleComplete always sends both; this makes the server enforce it rather
  // than trusting every caller to remember.
  if ("is_completed" in update) {
    if (update.is_completed === true) {
      if (update.completed_at == null) update.completed_at = new Date().toISOString();
    } else if (update.is_completed === false) {
      update.completed_at = null;
    }
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", taskId)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
  // RLS scopes to the owner: a missing/foreign task matches 0 rows → 404, not a
  // raw 500 from .single().
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
  const supabase = getAuthClient(req);
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const { data, error } = await supabase
    .from("tasks")
    .update({ dismissed_at: new Date().toISOString(), dismissed_by_user: true })
    .eq("id", taskId)
    .select("id");

  if (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
  // 0 rows affected (missing/foreign task under RLS) → 404 instead of a
  // misleading success.
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
