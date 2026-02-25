/**
 * POST /api/auth/process-deferred
 *
 * Processes deferred task invites after a new user signs up or logs in.
 * Finds all task_shares where invitee_email matches the user's email
 * and invitee_id is NULL, then updates them to be pending invites.
 *
 * Called from the auth callback after account creation/login.
 *
 * @returns 200 with { processed: number } — count of deferred shares resolved
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`process-deferred:${user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const userEmail = user.email?.toLowerCase();
  if (!userEmail) {
    return NextResponse.json({ processed: 0 });
  }

  try {
    const adminClient = createAdminClient();

    // Find all deferred shares for this email
    const { data: deferredShares, error: fetchError } = await adminClient
      .from("task_shares")
      .select("id")
      .eq("invitee_email", userEmail)
      .is("invitee_id", null);

    if (fetchError) {
      logger.error("POST /api/auth/process-deferred: failed to fetch deferred shares", {
        error: fetchError.message,
        email: userEmail,
      });
      return NextResponse.json({ error: "Failed to process invites" }, { status: 500 });
    }

    if (!deferredShares || deferredShares.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    const shareIds = deferredShares.map((s) => s.id);

    // Update all matching shares: set invitee_id and change status to pending
    const { error: updateError } = await adminClient
      .from("task_shares")
      .update({ invitee_id: user.id, status: "pending" })
      .in("id", shareIds);

    if (updateError) {
      logger.error("POST /api/auth/process-deferred: failed to update deferred shares", {
        error: updateError.message,
        shareIds,
      });
      return NextResponse.json({ error: "Failed to update invites" }, { status: 500 });
    }

    logger.info("POST /api/auth/process-deferred: deferred shares resolved", {
      userId: user.id,
      email: userEmail,
      processed: shareIds.length,
    });

    return NextResponse.json({ processed: shareIds.length });
  } catch (err) {
    logger.error("POST /api/auth/process-deferred: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
