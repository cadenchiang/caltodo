/**
 * SessionStorage cache helpers for chat messages.
 * Uses a TTL of 5 minutes. Max 200 messages cached per course.
 */

import type { ChatMessage } from "@/lib/types";

const CACHE_PREFIX = "chat_messages_cache_";
const CACHE_TTL = 5 * 60_000;

/**
 * Reads cached messages for a course from sessionStorage.
 *
 * @param courseId - The course UUID
 * @returns Cached messages or null if missing/expired
 */
export function readCache(courseId: string): ChatMessage[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.messages;
  } catch {
    return null;
  }
}

/**
 * Writes messages to sessionStorage cache.
 *
 * @param courseId - The course UUID
 * @param messages - Messages to cache
 */
export function writeCache(courseId: string, messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + courseId,
      JSON.stringify({ messages: messages.slice(0, 200), timestamp: Date.now() })
    );
  } catch { /* ignore */ }
}
