/**
 * DELETE /api/tasks/invite/[shareId]
 *
 * Revokes a task share. Only the inviter can revoke.
 *
 * @param params.shareId - The share ID to revoke
 * @returns 200 on success
 * @returns 404 if share not found or not owned by the user
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  return NextResponse.json({ success: true });
}
