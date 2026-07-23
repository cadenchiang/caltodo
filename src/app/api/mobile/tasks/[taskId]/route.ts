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
  const body = await req.json();

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

  const { data, error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { error } = await supabase
    .from("tasks")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
