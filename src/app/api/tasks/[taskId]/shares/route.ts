/**
 * GET /api/tasks/[taskId]/shares
 *
 * Lists all shares for a given task. Only returns shares where the
 * authenticated user is the inviter.
 *
 * @param params.taskId - The task ID to list shares for
 * @returns 200 with { shares: TaskShare[] }
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`task-shares:${user.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { taskId } = await params;

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  }

  // Verify task ownership
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const { data: shares, error: sharesError } = await supabase
    .from("task_shares")
    .select("id, invitee_id, invitee_email, copied_task_id, status, created_at")
    .eq("source_task_id", taskId)
    .eq("inviter_id", user.id)
    .order("created_at", { ascending: true });

  if (sharesError) {
    logger.error("GET /api/tasks/[taskId]/shares: failed to fetch shares", {
      taskId,
      error: sharesError.message,
    });
    return NextResponse.json({ error: "Failed to fetch shares" }, { status: 500 });
  }

  if (!shares || shares.length === 0) {
    return NextResponse.json({ shares: [] });
  }

  // Enrich with invitee name and avatar from auth metadata
  const adminClient = createAdminClient();
  const { data: usersData } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const userMap = new Map(
    usersData?.users?.map((u) => [u.id, {
      name: (u.user_metadata?.full_name as string) ?? null,
      avatar: (u.user_metadata?.avatar_url as string) ?? null,
    }]) ?? []
  );

  const enrichedShares = shares.map((s) => {
    const meta = userMap.get(s.invitee_id);
    return {
      id: s.id,
      invitee_email: s.invitee_email,
      invitee_name: meta?.name ?? null,
      invitee_avatar_url: meta?.avatar ?? null,
      status: s.status,
      copied_task_id: s.copied_task_id,
      created_at: s.created_at,
    };
  });

  return NextResponse.json({ shares: enrichedShares });
}
