/**
 * API route for blocking users in chat (D6).
 *
 * GET  ?courseId=<uuid>  -> { blockedUserIds, blockedAuthorKeys }
 *      The author keys are computed server-side for the given room, so the
 *      client can drop a blocked user's messages (which carry only
 *      author_key) without ever learning the mapping the other way.
 * POST { userId }        -> block
 * DELETE { userId }      -> unblock
 *
 * Blocks are private to the blocker (RLS on chat_blocks, migration
 * 20260923000002). The blocked user is never told.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { computeAuthorKey } from "@/lib/chat-author-key";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads and validates { userId } from the body. */
async function readUserId(request: Request): Promise<string | NextResponse> {
  let body: { userId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.userId !== "string" || !UUID_RE.test(body.userId)) {
    return NextResponse.json({ error: "userId must be a uuid" }, { status: 400 });
  }
  return body.userId;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`chat-blocks:${user.id}`, 60, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const courseId = new URL(request.url).searchParams.get("courseId");

  const { data, error } = await supabase.from("chat_blocks").select("blocked_user_id").eq("user_id", user.id);
  if (error) {
    logger.error("GET /api/discussions/block: lookup failed", { userId: user.id, cause: error.message, impact: "blocked users' messages show until retry" });
    return NextResponse.json({ error: "Failed to load blocks" }, { status: 500 });
  }

  const blockedUserIds = (data ?? []).map((r) => r.blocked_user_id as string);
  const blockedAuthorKeys = courseId ? blockedUserIds.map((id) => computeAuthorKey(id, courseId)) : [];
  return NextResponse.json({ blockedUserIds, blockedAuthorKeys });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`chat-block-write:${user.id}`, 30, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const userId = await readUserId(request);
  if (userId instanceof NextResponse) return userId;
  if (userId === user.id) return NextResponse.json({ error: "You can't block yourself" }, { status: 400 });

  const { error } = await supabase
    .from("chat_blocks")
    .upsert({ user_id: user.id, blocked_user_id: userId }, { onConflict: "user_id,blocked_user_id", ignoreDuplicates: true });
  if (error) {
    logger.error("POST /api/discussions/block: insert failed", { userId: user.id, blockedUserId: userId, cause: error.message, impact: "user not blocked" });
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }
  logger.info("POST /api/discussions/block: user blocked", { userId: user.id, blockedUserId: userId });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`chat-block-write:${user.id}`, 30, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const userId = await readUserId(request);
  if (userId instanceof NextResponse) return userId;

  const { error } = await supabase.from("chat_blocks").delete().eq("user_id", user.id).eq("blocked_user_id", userId);
  if (error) {
    logger.error("DELETE /api/discussions/block: delete failed", { userId: user.id, blockedUserId: userId, cause: error.message, impact: "user stays blocked" });
    return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
  }
  logger.info("DELETE /api/discussions/block: user unblocked", { userId: user.id, blockedUserId: userId });
  return NextResponse.json({ success: true });
}
