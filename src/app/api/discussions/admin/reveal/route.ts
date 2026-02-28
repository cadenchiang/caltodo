/**
 * Admin-only API route for revealing the identity behind anonymous messages.
 * Only the hardcoded admin email can access this endpoint.
 *
 * GET /api/discussions/admin/reveal?userId=<uuid>
 * Returns { userName } if the caller is the admin; 403 otherwise.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/admin";

/**
 * GET /api/discussions/admin/reveal?userId=<uuid>
 *
 * Server-side admin check — only ADMIN_EMAIL can reveal anonymous identities.
 * Returns the target user's full name.
 *
 * @param request - The incoming request with userId query param
 * @returns { userName: string } on success; 401/403/404/500 on error
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Server-side admin check — centralized via @/lib/admin
  if (!isAdmin(user.email)) {
    logger.warn("Admin reveal: unauthorized attempt", {
      userId: user.id,
      email: user.email,
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { allowed } = rateLimit(`admin-reveal:${user.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get("userId");

  if (!targetUserId) {
    return NextResponse.json({ error: "userId query parameter required" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: targetUser, error: userError } = await admin.auth.admin.getUserById(targetUserId);

    if (userError || !targetUser?.user) {
      logger.warn("Admin reveal: user not found", { targetUserId, adminId: user.id });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = targetUser.user.user_metadata?.full_name ?? "Unknown";
    const userAvatar = targetUser.user.user_metadata?.avatar_url ?? null;

    logger.info("Admin reveal: identity revealed", {
      adminId: user.id,
      targetUserId,
      targetName: userName,
    });

    return NextResponse.json({ userName, userAvatar });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Admin reveal: unexpected error", {
      targetUserId,
      adminId: user.id,
      error: message,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
