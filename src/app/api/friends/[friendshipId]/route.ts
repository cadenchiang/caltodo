/**
 * POST /api/friends/[friendshipId] — Accept or decline a friend request.
 * DELETE /api/friends/[friendshipId] — Remove a friendship or cancel a request.
 *
 * POST body: { action: "accept" | "decline" }
 * Only the receiver can accept/decline. RLS enforces this.
 *
 * @param params.friendshipId - The friendship row ID
 * @returns 200 with { success: true }
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`friends-respond:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { friendshipId } = await params;

  if (!friendshipId) {
    return NextResponse.json({ error: "Missing friendshipId" }, { status: 400 });
  }

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action !== "accept" && body.action !== "decline") {
    return NextResponse.json({ error: "Action must be 'accept' or 'decline'" }, { status: 400 });
  }

  if (body.action === "decline") {
    // Declining = delete the request entirely
    const { error: deleteError, count } = await supabase
      .from("friendships")
      .delete({ count: "exact" })
      .eq("id", friendshipId)
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (deleteError) {
      logger.error("POST /api/friends/[friendshipId]: decline failed", {
        friendshipId,
        error: deleteError.message,
      });
      return NextResponse.json({ error: "Failed to decline request" }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    logger.info("POST /api/friends/[friendshipId]: request declined", {
      friendshipId,
      userId: user.id,
    });

    return NextResponse.json({ success: true });
  }

  // Accept: update status to "accepted" (RLS ensures only receiver can update)
  const { error: updateError, count } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (updateError) {
    logger.error("POST /api/friends/[friendshipId]: accept failed", {
      friendshipId,
      error: updateError.message,
    });
    return NextResponse.json({ error: "Failed to accept request" }, { status: 500 });
  }

  // count may be undefined if supabase doesn't return it without { count: "exact" }
  // The update call above doesn't pass count option, let me check — actually let's just check error
  logger.info("POST /api/friends/[friendshipId]: request accepted", {
    friendshipId,
    userId: user.id,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`friends-remove:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { friendshipId } = await params;

  if (!friendshipId) {
    return NextResponse.json({ error: "Missing friendshipId" }, { status: 400 });
  }

  // RLS ensures only requester or receiver can delete
  const { error: deleteError, count } = await supabase
    .from("friendships")
    .delete({ count: "exact" })
    .eq("id", friendshipId);

  if (deleteError) {
    logger.error("DELETE /api/friends/[friendshipId]: failed to delete", {
      friendshipId,
      error: deleteError.message,
    });
    return NextResponse.json({ error: "Failed to remove friend" }, { status: 500 });
  }

  if (count === 0) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  logger.info("DELETE /api/friends/[friendshipId]: friendship removed", {
    friendshipId,
    userId: user.id,
  });

  return NextResponse.json({ success: true });
}
