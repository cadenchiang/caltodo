/**
 * API route for message reactions (iMessage-style tapback).
 * GET: Fetch all reactions for a course's messages.
 * POST: Toggle a reaction on a message (add if absent, remove if present).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Allowed tapback emoji to prevent abuse. */
const ALLOWED_EMOJI = new Set(["❤️", "👍", "👎", "😂", "‼️", "❓"]);

/**
 * GET /api/discussions/reactions?courseId=<uuid>
 * Returns all reactions for messages in a course.
 * Requires course enrollment.
 *
 * @returns Array of { message_id, emoji, user_id }
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 422 });

  // Rate limit
  const rl = rateLimit(`reactions-read:${user.id}`, 30, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  // Verify enrollment
  const { data: membership } = await supabase
    .from("course_memberships")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("message_reactions")
    .select("message_id, emoji, user_id")
    .eq("course_id", courseId);

  if (error) {
    logger.error("Failed to fetch reactions", { userId: user.id, courseId, error: error.message });
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/discussions/reactions
 * Toggles a reaction on a message: adds if absent, removes if present.
 * Requires course enrollment.
 *
 * @param body.messageId - The message UUID to react to
 * @param body.emoji - One of the allowed tapback emoji
 * @param body.courseId - The course UUID (for Realtime filtering)
 * @returns { action: "added" | "removed" }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.messageId || !body?.emoji || !body?.courseId) {
    return NextResponse.json({ error: "messageId, emoji, and courseId required" }, { status: 422 });
  }

  const { messageId, emoji, courseId } = body;

  // Validate emoji
  if (!ALLOWED_EMOJI.has(emoji)) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 422 });
  }

  // Rate limit
  const rl = rateLimit(`reactions-toggle:${user.id}`, 60, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  // Verify enrollment
  const { data: membership } = await supabase
    .from("course_memberships")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from("message_reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    // Remove reaction
    const { error: delErr } = await supabase
      .from("message_reactions")
      .delete()
      .eq("id", existing.id);

    if (delErr) {
      logger.error("Failed to remove reaction", { userId: user.id, messageId, error: delErr.message });
      return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 });
    }

    logger.info("Reaction removed", { userId: user.id, messageId, emoji });
    return NextResponse.json({ action: "removed" });
  }

  // Add reaction
  const { error: insErr } = await supabase
    .from("message_reactions")
    .insert({ message_id: messageId, course_id: courseId, user_id: user.id, emoji });

  if (insErr) {
    logger.error("Failed to add reaction", { userId: user.id, messageId, error: insErr.message });
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 });
  }

  logger.info("Reaction added", { userId: user.id, messageId, emoji });
  return NextResponse.json({ action: "added" });
}
