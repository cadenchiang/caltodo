/**
 * GET /api/tasks/invites/pending
 *
 * Fetches all pending task invitations for the current user.
 * Returns enriched data including task details and inviter info.
 *
 * @returns 200 with { invites: PendingInvite[] }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`pending-invites:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    // Fetch pending shares where the current user is the invitee
    const { data: shares, error: sharesError } = await supabase
      .from("task_shares")
      .select("id, source_task_id, inviter_id, invitee_email, created_at")
      .eq("invitee_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (sharesError) {
      logger.error("GET /api/tasks/invites/pending: failed to fetch shares", {
        error: sharesError.message,
      });
      return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
    }

    if (!shares || shares.length === 0) {
      return NextResponse.json({ invites: [] });
    }

    // Fetch source tasks for all pending shares
    const taskIds = [...new Set(shares.map((s) => s.source_task_id))];
    const adminClient = createAdminClient();

    const { data: tasks, error: tasksError } = await adminClient
      .from("tasks")
      .select("id, title, due_date, due_time, color")
      .in("id", taskIds);

    if (tasksError) {
      logger.error("GET /api/tasks/invites/pending: failed to fetch source tasks", {
        error: tasksError.message,
      });
      return NextResponse.json({ error: "Failed to fetch task details" }, { status: 500 });
    }

    const taskMap = new Map(tasks?.map((t) => [t.id, t]) ?? []);

    // Fetch inviter user metadata
    const inviterIds = [...new Set(shares.map((s) => s.inviter_id))];
    const { data: usersData } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    const userMap = new Map(
      usersData?.users?.map((u) => [u.id, {
        email: u.email ?? "",
        name: (u.user_metadata?.full_name as string) ?? null,
        avatar: (u.user_metadata?.avatar_url as string) ?? null,
      }]) ?? []
    );

    const invites = shares.map((share) => {
      const task = taskMap.get(share.source_task_id);
      const inviter = userMap.get(share.inviter_id);
      return {
        shareId: share.id,
        taskTitle: task?.title ?? "Unknown task",
        taskDueDate: task?.due_date ?? null,
        taskDueTime: task?.due_time ?? null,
        taskColor: task?.color ?? "#3B82F6",
        inviterName: inviter?.name ?? null,
        inviterEmail: inviter?.email ?? share.invitee_email,
        inviterAvatar: inviter?.avatar ?? null,
        createdAt: share.created_at,
      };
    });

    return NextResponse.json({ invites });
  } catch (err) {
    logger.error("GET /api/tasks/invites/pending: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
