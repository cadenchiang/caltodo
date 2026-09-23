/**
 * SessionStorage cache helpers for chat messages and the viewer's author key.
 * Messages: TTL of 5 minutes, newest 200 kept per course (M21: the old cache
 * kept the oldest 200, so the most recent messages were dropped first).
 */

import type { ChatMessage } from "@/lib/types";

const CACHE_PREFIX = "chat_messages_cache_";
const AUTHOR_KEY_PREFIX = "calchat_author_key_";
const CACHE_TTL = 5 * 60_000;
/** Cap on cached messages per course. */
export const CACHE_LIMIT = 200;

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
 * Keeps the newest CACHE_LIMIT messages of an oldest-first list, dropping
 * anything still in flight (temp ids never belong in the cache).
 *
 * @param messages - Oldest-first messages
 */
export function trimForCache(messages: readonly ChatMessage[]): ChatMessage[] {
  const settled = messages.filter((m) => !m.id.startsWith("temp-"));
  return settled.length > CACHE_LIMIT ? settled.slice(settled.length - CACHE_LIMIT) : settled;
}

/**
 * Writes messages to sessionStorage cache.
 *
 * @param courseId - The course UUID
 * @param messages - Oldest-first messages; the newest 200 are kept
 */
export function writeCache(courseId: string, messages: readonly ChatMessage[]) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + courseId,
      JSON.stringify({ messages: trimForCache(messages), timestamp: Date.now() })
    );
  } catch { /* ignore */ }
}

/**
 * Reads the viewer's own author key for a course.
 *
 * @param courseId - The course UUID
 * @returns The key, or null when no API response has reported it yet
 */
export function readAuthorKey(courseId: string): string | null {
  try {
    return sessionStorage.getItem(AUTHOR_KEY_PREFIX + courseId);
  } catch {
    return null;
  }
}

/**
 * Stores the viewer's own author key for a course (from the API header).
 *
 * @param courseId - The course UUID
 * @param key - The author key
 */
export function writeAuthorKey(courseId: string, key: string) {
  try {
    sessionStorage.setItem(AUTHOR_KEY_PREFIX + courseId, key);
  } catch { /* ignore */ }
}
