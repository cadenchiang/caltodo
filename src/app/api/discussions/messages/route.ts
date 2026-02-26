/**
 * API route for chat messages in a course group chat.
 * GET: Paginated message history.
 * POST: Send a new message with denormalized author info.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Words/patterns blocked from chat messages. */
const BLOCKED_PATTERNS = [
  /\b(fuck|shit|damn|bitch|ass|dick|pussy|cock|cunt)\b/gi,
];

/**
 * Checks message body against blocked content patterns.
 *
 * @param body - The message text to check
 * @returns true if the message contains blocked content
 */
function containsBlockedContent(body: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(body));
}

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

    return NextResponse.json(messages ?? []);
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
 * Creates a new chat message with denormalized author info.
 * Body: { courseId, body }
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

    // Denormalize author name/avatar from user metadata
    const authorName = user.user_metadata?.full_name ?? null;
    const authorAvatar = user.user_metadata?.avatar_url ?? null;

    const { data: message, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        course_id: courseId,
        author_id: user.id,
        author_name: authorName,
        author_avatar: authorAvatar,
        body,
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
