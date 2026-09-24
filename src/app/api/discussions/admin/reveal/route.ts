/**
 * Admin-only API route for revealing the identity behind an anonymous
 * message. Only the hardcoded admin email can access this endpoint.
 *
 * GET /api/discussions/admin/reveal?messageId=<uuid>
 * Returns { userName, userAvatar, authorKey } if the caller is the admin.
 *
 * Takes a message id, not a user id: clients no longer hold author ids
 * (audit C2). The author is looked up with the service role and every
 * reveal is logged with the admin id and the message id.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(user.email)) {
    logger.warn("Admin reveal: unauthorized attempt", { userId: user.id, email: user.email });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { allowed } = rateLimit(`admin-reveal:${user.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const messageId = url.searchParams.get("messageId");
  if (!messageId) {
    return NextResponse.json({ error: "messageId query parameter required" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: message, error: messageError } = await admin
      .from("chat_messages")
      .select("id, author_id, author_key, course_id")
      .eq("id", messageId)
      .maybeSingle();

    if (messageError || !message) {
      logger.warn("Admin reveal: message not found", { messageId, adminId: user.id, error: messageError?.message });
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const { data: targetUser, error: userError } = await admin.auth.admin.getUserById(message.author_id);
    if (userError || !targetUser?.user) {
      logger.warn("Admin reveal: author not found", { messageId, adminId: user.id });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = targetUser.user.user_metadata?.full_name ?? "Unknown";
    const userAvatar = targetUser.user.user_metadata?.avatar_url ?? null;

    logger.info("Admin reveal: identity revealed", {
      adminId: user.id,
      messageId,
      courseId: message.course_id,
      targetUserId: message.author_id,
    });

    return NextResponse.json({ userName, userAvatar, authorKey: message.author_key });
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    logger.error("Admin reveal: unexpected error", { messageId, adminId: user.id, error: errMessage });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
