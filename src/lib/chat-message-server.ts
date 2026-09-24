/**
 * Server-side helpers shared by the chat messages route.
 *
 * @module chat-message-server
 */

import type { createClient } from "@/lib/supabase/server";
import type { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { attachmentPaths, attachmentUrlPrefix, CHAT_ATTACHMENTS_BUCKET } from "@/lib/chat-attachments";

type UserClient = Awaited<ReturnType<typeof createClient>>;

/** Membership check shared by every method. */
export async function isMember(supabase: UserClient, userId: string, courseId: string): Promise<boolean> {
  const { data } = await supabase
    .from("course_memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();
  return !!data;
}

/**
 * Removes the storage objects a message body references. Logged, never thrown:
 * the message is already gone and orphaned files are recoverable by hand.
 *
 * @returns Number of paths asked to be removed
 */
export async function removeAttachments(admin: ReturnType<typeof createAdminClient>, userId: string, messageId: string, body: string): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const paths = supabaseUrl ? attachmentPaths(body, attachmentUrlPrefix(supabaseUrl)) : [];
  if (paths.length === 0) return 0;
  const { error } = await admin.storage.from(CHAT_ATTACHMENTS_BUCKET).remove(paths);
  if (error) {
    logger.error("DELETE /api/discussions/messages: attachment cleanup failed", {
      userId, messageId, paths, cause: error.message, impact: "message removed but its files remain in storage",
    });
  }
  return paths.length;
}

