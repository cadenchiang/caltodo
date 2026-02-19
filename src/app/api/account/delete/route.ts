/**
 * API route for deleting a user's account.
 * Deletes all user data (tasks, credentials) then removes the auth user.
 * Requires an authenticated session and uses the admin client for user deletion.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/account/delete
 * Permanently deletes the authenticated user's account and all associated data.
 * Deletion order: tasks → integration_credentials → auth user.
 *
 * @returns 200 on success, 401 if unauthenticated, 429 if rate limited, 500 on error
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn("DELETE /api/account/delete: unauthorized attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`account-delete:${user.id}`, 3, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const userId = user.id;
  logger.info("Account deletion started", { userId });

  try {
    // 1. Delete all tasks for this user
    const { error: tasksError } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId);

    if (tasksError) {
      logger.error("Account deletion: failed to delete tasks", { userId, error: tasksError.message });
      return NextResponse.json({ error: "Failed to delete tasks" }, { status: 500 });
    }

    // 2. Delete integration credentials for this user
    const { error: credsError } = await supabase
      .from("integration_credentials")
      .delete()
      .eq("user_id", userId);

    if (credsError) {
      logger.error("Account deletion: failed to delete credentials", { userId, error: credsError.message });
      return NextResponse.json({ error: "Failed to delete credentials" }, { status: 500 });
    }

    // 3. Delete the auth user via admin client (requires service role)
    const adminClient = createAdminClient();
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      logger.error("Account deletion: failed to delete auth user", { userId, error: deleteUserError.message });
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    // 4. Sign out the current session
    await supabase.auth.signOut();

    logger.info("Account deletion completed", { userId });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Account deletion: unexpected error", { userId, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
