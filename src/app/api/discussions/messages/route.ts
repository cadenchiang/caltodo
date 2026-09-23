/**
 * API route for chat messages in a course group chat.
 * GET: Paginated message history, or one message by id (for quoted replies).
 * POST: Send a new message; the row carries author_key (never author_id).
 * DELETE: Unsend an own message and remove its attachments.
 *
 * Clients never see author_id: every read selects MESSAGE_COLUMNS, the
 * column privilege is revoked in migration 20260923000005, and the
 * viewer's own key for the room travels in the X-Chat-Author-Key header so
 * the UI can tell which messages are its own.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { containsBlockedContent } from "@/lib/content-moderation";
import { checkSpam, checkDuplicate } from "@/lib/spam-detection";
import { hasCompletedOnboarding } from "@/lib/check-onboarding";
import { computeAuthorKey } from "@/lib/chat-author-key";
import { attachmentPaths, attachmentUrlPrefix, CHAT_ATTACHMENTS_BUCKET } from "@/lib/chat-attachments";
import { MESSAGE_COLUMNS, AUTHOR_KEY_HEADER, MAX_MESSAGE_LENGTH } from "@/lib/chat-message-shape";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type UserClient = Awaited<ReturnType<typeof createClient>>;

/** Membership check shared by every method. */
async function isMember(supabase: UserClient, userId: string, courseId: string): Promise<boolean> {
  const { data } = await supabase
    .from("course_memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();
  return !!data;
}

/**
 * GET /api/discussions/messages?courseId=<uuid>&limit=50&before=<iso>
 * GET /api/discussions/messages?courseId=<uuid>&messageId=<uuid>
 *
 * Returns chat history newest first (cursor-based via `before`), or a
 * single-element array for `messageId` (a quoted reply outside the loaded
 * window). The viewer's own author key is in the X-Chat-Author-Key header.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const onboarded = await hasCompletedOnboarding(supabase, user.id);
  if (!onboarded) {
    return NextResponse.json({ error: "Complete onboarding to access Chat" }, { status: 403 });
  }

  const { allowed } = rateLimit(`chat-messages:${user.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");
  const messageId = url.searchParams.get("messageId");
  const before = url.searchParams.get("before");
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 100);

  if (!courseId) {
    return NextResponse.json({ error: "courseId query parameter required" }, { status: 400 });
  }

  try {
    if (!(await isMember(supabase, user.id, courseId))) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    let query = supabase.from("chat_messages").select(MESSAGE_COLUMNS).eq("course_id", courseId);
    if (messageId) {
      if (!UUID_RE.test(messageId)) {
        return NextResponse.json({ error: "messageId must be a uuid" }, { status: 400 });
      }
      query = query.eq("id", messageId).limit(1);
    } else {
      query = query.order("created_at", { ascending: false }).limit(limit);
      if (before) query = query.lt("created_at", before);
    }

    const { data: messages, error: fetchError } = await query;
    if (fetchError) {
      logger.error("GET /api/discussions/messages: fetch failed", {
        userId: user.id,
        courseId,
        cause: fetchError.message,
        impact: "room shows its cached messages or an error state",
      });
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    logger.info("GET /api/discussions/messages", { userId: user.id, courseId, count: messages?.length ?? 0, single: !!messageId });

    return NextResponse.json(messages ?? [], {
      headers: { [AUTHOR_KEY_HEADER]: computeAuthorKey(user.id, courseId) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/discussions/messages: unexpected error", { userId: user.id, courseId, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/discussions/messages
 * Body: { courseId, body, anonymous?, replyToId?, clientNonce? }
 *
 * Inserts with the admin client after checking membership, so RETURNING can
 * be limited to MESSAGE_COLUMNS regardless of column privileges. author_key
 * is computed here from the server secret; a database trigger recomputes
 * it for any direct PostgREST insert.
 *
 * @returns The created message (201) with the viewer's key in the header
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const onboarded = await hasCompletedOnboarding(supabase, user.id);
  if (!onboarded) {
    return NextResponse.json({ error: "Complete onboarding to access Chat" }, { status: 403 });
  }

  const spam = checkSpam(user.id);
  if (!spam.allowed) {
    return NextResponse.json({ error: "Slow down and try again shortly", retryAfter: spam.retryAfter }, { status: 429 });
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
  const replyToId = typeof reqBody.replyToId === "string" && UUID_RE.test(reqBody.replyToId) ? reqBody.replyToId : null;
  const clientNonce = typeof reqBody.clientNonce === "string" ? reqBody.clientNonce.slice(0, 64) : null;

  if (!courseId || !body) {
    return NextResponse.json({ error: "courseId and body are required" }, { status: 400 });
  }
  if (body.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message must be 5000 characters or fewer" }, { status: 400 });
  }
  if (containsBlockedContent(body)) {
    logger.warn("POST /api/discussions/messages: blocked content", { userId: user.id, courseId });
    return NextResponse.json({ error: "Message contains inappropriate content" }, { status: 422 });
  }
  const dupe = checkDuplicate(user.id, body);
  if (!dupe.allowed) {
    return NextResponse.json({ error: dupe.error }, { status: 429 });
  }

  try {
    if (!(await isMember(supabase, user.id, courseId))) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    const admin = createAdminClient();
    if (replyToId) {
      const { data: target } = await admin.from("chat_messages").select("id").eq("id", replyToId).eq("course_id", courseId).maybeSingle();
      if (!target) {
        return NextResponse.json({ error: "Reply target is not in this chat" }, { status: 400 });
      }
    }

    const authorKey = computeAuthorKey(user.id, courseId);
    const { data: message, error: insertError } = await admin
      .from("chat_messages")
      .insert({
        course_id: courseId,
        author_id: user.id,
        author_key: authorKey,
        author_name: anonymous ? null : (user.user_metadata?.full_name ?? null),
        author_avatar: anonymous ? null : (user.user_metadata?.avatar_url ?? null),
        body,
        reply_to_id: replyToId,
        client_nonce: clientNonce,
      })
      .select(MESSAGE_COLUMNS)
      .single();

    if (insertError || !message) {
      logger.error("POST /api/discussions/messages: insert failed", {
        userId: user.id,
        courseId,
        cause: insertError?.message,
        impact: "message not sent; client shows the bubble as failed with retry",
      });
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    logger.info("POST /api/discussions/messages: sent", { userId: user.id, courseId, messageId: message.id, anonymous });
    return NextResponse.json(message, { status: 201, headers: { [AUTHOR_KEY_HEADER]: authorKey } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/discussions/messages: unexpected error", { userId: user.id, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/discussions/messages
 * Body: { messageId: string }
 *
 * Deletes a message owned by the requesting user and removes the storage
 * objects its body references. Ownership is read with the admin client
 * (author_id is not selectable by end users).
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
    const admin = createAdminClient();
    const { data: msg, error: fetchError } = await admin
      .from("chat_messages")
      .select("id, author_id, course_id, body")
      .eq("id", messageId)
      .maybeSingle();

    if (fetchError || !msg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    if (msg.author_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own messages" }, { status: 403 });
    }

    const { error: deleteError } = await admin.from("chat_messages").delete().eq("id", messageId);
    if (deleteError) {
      logger.error("DELETE /api/discussions/messages: delete failed", {
        userId: user.id,
        messageId,
        cause: deleteError.message,
        impact: "message still visible; client refetches",
      });
      return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const paths = supabaseUrl ? attachmentPaths(msg.body, attachmentUrlPrefix(supabaseUrl)) : [];
    if (paths.length > 0) {
      const { error: storageError } = await admin.storage.from(CHAT_ATTACHMENTS_BUCKET).remove(paths);
      if (storageError) {
        logger.error("DELETE /api/discussions/messages: attachment cleanup failed", {
          userId: user.id,
          messageId,
          paths,
          cause: storageError.message,
          impact: "message removed but its files remain in storage",
        });
      }
    }

    logger.info("DELETE /api/discussions/messages: deleted", { userId: user.id, messageId, courseId: msg.course_id, attachmentsRemoved: paths.length });
    return NextResponse.json({ success: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error("DELETE /api/discussions/messages: unexpected error", { userId: user.id, messageId, error: errMsg });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
