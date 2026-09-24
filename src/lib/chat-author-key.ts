/**
 * Server-side author keys for chat messages (audit C2).
 *
 * `author_key` is HMAC-SHA256(secret, "<author_id>:<course_id>") in hex. It
 * is stored on every message, sent to clients instead of author_id, and is
 * what the UI groups by: the same person has the same key within a chat
 * (so "#N is the same person"), a different key in another chat, and no
 * client can turn a key back into a user id without the secret.
 *
 * The secret comes from CHAT_AUTHOR_SECRET. In production it must be set;
 * outside production a documented default keeps local development
 * working. Migration 20260923000005 backfills the column with the same
 * formula using the database setting `app.settings.chat_author_secret`;
 * set both to the same value so old and new messages share keys.
 *
 * Server only: never import from client components.
 *
 * @module chat-author-key
 */

import { createHmac } from "crypto";
import { logger } from "@/lib/logger";

/** Development fallback. Matches the default in migration 20260923000005. */
export const DEV_CHAT_AUTHOR_SECRET = "caltodo-dev-chat-author-secret";

let warned = false;

/**
 * Resolves the HMAC secret.
 *
 * @returns The configured secret, or the development default outside production
 * @throws Error in production when CHAT_AUTHOR_SECRET is unset
 */
export function getChatAuthorSecret(): string {
  const configured = process.env.CHAT_AUTHOR_SECRET;
  if (configured && configured.length > 0) return configured;
  if (process.env.NODE_ENV === "production") {
    logger.error("chat-author-key: CHAT_AUTHOR_SECRET is not set", {
      cause: "environment variable missing",
      impact: "messages cannot be sent or read; anonymous author keys would be forgeable",
    });
    throw new Error("CHAT_AUTHOR_SECRET is not configured");
  }
  if (!warned) {
    warned = true;
    logger.warn("chat-author-key: using the development default secret", {
      impact: "author keys are predictable; fine locally, never in production",
    });
  }
  return DEV_CHAT_AUTHOR_SECRET;
}

/**
 * Computes the author key for a (user, course) pair.
 *
 * @param authorId - The author's auth user id
 * @param courseId - The room
 * @returns 64 hex characters
 */
export function computeAuthorKey(authorId: string, courseId: string): string {
  return createHmac("sha256", getChatAuthorSecret()).update(`${authorId}:${courseId}`).digest("hex");
}
