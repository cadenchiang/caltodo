/**
 * API route for chat messages in a course group chat.
 * GET: Paginated message history.
 * POST: Send a new message with denormalized author info.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { containsBlockedContent } from "@/lib/content-moderation";
import { checkSpam, checkDuplicate } from "@/lib/spam-detection";
import { isAdmin } from "@/lib/admin";
import { obfuscateAuthorId } from "@/lib/author-obfuscate";
import { hasCompletedOnboarding } from "@/lib/check-onboarding";

/**
 * GET /api/discussions/messages?courseId=<uuid>&limit=50&before=<iso>
 * Returns paginated chat history for a course, newest first.
 * Cursor-based pagination via `before` timestamp.
 *
 * @param request - The incoming request with query params
 * @returns Array of ChatMessage objects
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Block access if user hasn't completed onboarding (synced at least one class)
  const onboarded = await hasCompletedOnboarding(supabase, user.id);
  if (!onboarded) {
    return NextResponse.json({ error: "Complete onboarding to access CalChat" }, { status: 403 });
  }

  const { allowed } = rateLimit(`chat-messages:${user.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");
  const limitParam = url.searchParams.get("limit");
  const before = url.searchParams.get("before");

  if (!courseId) {
    return NextResponse.json({ error: "courseId query parameter required" }, { status: 400 });
  }

  const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 100);

  try {
    // Verify enrollment
    const { data: membership } = await supabase
      .from("course_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    let query = supabase
      .from("chat_messages")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt("created_at", before);
    }

    const { data: messages, error: fetchError } = await query;

    if (fetchError) {
      logger.error("GET /api/discussions/messages: fetch failed", {
        userId: user.id,
        courseId,
        error: fetchError.message,
      });
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    logger.info("GET /api/discussions/messages", {
      userId: user.id,
      courseId,
      count: messages?.length ?? 0,
    });

    // Obfuscate author_id for anonymous messages from other users (non-admin).
    // Own messages keep real author_id (needed for isOwn check on client).
    // Admin gets all real author_ids (needed for reveal feature).
    const userIsAdmin = isAdmin(user.email);
    const sanitized = (messages ?? []).map((msg) => {
      if (userIsAdmin) return msg;
      if (msg.author_id === user.id) return msg;
      if (msg.author_name) return msg; // named messages — not anonymous
      return { ...msg, author_id: obfuscateAuthorId(msg.author_id, courseId) };
    });

    return NextResponse.json(sanitized);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/discussions/messages: unexpected error", {
      userId: user.id,
      courseId,
      error: message,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/discussions/messages
 * Creates a new chat message. Supports optional anonymous sending.
 * Body: { courseId, body, anonymous?: boolean }
 *
 * @param request - The incoming request with JSON body
 * @returns The created ChatMessage (201)
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Block access if user hasn't completed onboarding
  const onboarded = await hasCompletedOnboarding(supabase, user.id);
  if (!onboarded) {
    return NextResponse.json({ error: "Complete onboarding to access CalChat" }, { status: 403 });
  }

  // Burst spam detection (escalating timeouts for rapid-fire messages)
  const spam = checkSpam(user.id);
  if (!spam.allowed) {
    return NextResponse.json(
      { error: "Slow down — try again shortly", retryAfter: spam.retryAfter },
      { status: 429 }
    );
  }

  const { allowed } = rateLimit(`chat-message-send:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let reqBody: Record<string, unknown>;
  try {
    reqBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const courseId = reqBody.courseId as string;
  const body = (reqBody.body as string)?.trim();
  const anonymous = reqBody.anonymous === true;
  const replyToId = (reqBody.replyToId as string) || null;

  if (!courseId || !body) {
    return NextResponse.json({ error: "courseId and body are required" }, { status: 400 });
  }

  if (body.length > 5000) {
    return NextResponse.json({ error: "Message must be 5000 characters or fewer" }, { status: 400 });
  }

  // Content moderation
  if (containsBlockedContent(body)) {
    logger.warn("POST /api/discussions/messages: blocked content", {
      userId: user.id,
      courseId,
    });
    return NextResponse.json({ error: "Message contains inappropriate content" }, { status: 422 });
  }

  // Duplicate message detection
  const dupe = checkDuplicate(user.id, body);
  if (!dupe.allowed) {
    return NextResponse.json(
      { error: dupe.error },
      { status: 429 }
    );
  }

  try {
    // Verify enrollment
    const { data: membership } = await supabase
      .from("course_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // When anonymous, omit author identity; otherwise denormalize from metadata
    const authorName = anonymous ? null : (user.user_metadata?.full_name ?? null);
    const authorAvatar = anonymous ? null : (user.user_metadata?.avatar_url ?? null);

    const { data: message, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        course_id: courseId,
        author_id: user.id,
        author_name: authorName,
        author_avatar: authorAvatar,
        body,
        reply_to_id: replyToId,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("POST /api/discussions/messages: insert failed", {
        userId: user.id,
        courseId,
        error: insertError.message,
      });
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    logger.info("POST /api/discussions/messages: sent", {
      userId: user.id,
      courseId,
      messageId: message.id,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/discussions/messages: unexpected error", {
      userId: user.id,
      error: message,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/discussions/messages
 * Deletes a message owned by the requesting user.
 * Body: { messageId: string }
 *
 * @param request - The incoming request with JSON body
 * @returns 200 on success, 403 if not the message owner
 */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`chat-message-delete:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let reqBody: Record<string, unknown>;
  try {
    reqBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messageId = reqBody.messageId as string;
  if (!messageId) {
    return NextResponse.json({ error: "messageId is required" }, { status: 400 });
  }

  try {
    // Fetch the message to verify ownership
    const { data: msg, error: fetchError } = await supabase
      .from("chat_messages")
      .select("id, author_id, course_id")
      .eq("id", messageId)
      .single();

    if (fetchError || !msg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (msg.author_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own messages" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId);

    if (deleteError) {
      logger.error("DELETE /api/discussions/messages: delete failed", {
        userId: user.id,
        messageId,
        error: deleteError.message,
      });
      return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }

    logger.info("DELETE /api/discussions/messages: deleted", {
      userId: user.id,
      messageId,
      courseId: msg.course_id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error("DELETE /api/discussions/messages: unexpected error", {
      userId: user.id,
      messageId,
      error: errMsg,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
