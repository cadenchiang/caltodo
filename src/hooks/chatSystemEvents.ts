/**
 * Helpers for creating client-only system event messages
 * (delete notices, join/leave notifications) in the chat.
 */

import type { ChatMessage } from "@/lib/types";

/**
 * Creates a system event ChatMessage with centered display text.
 * These are client-only and not persisted to the database.
 *
 * @param courseId - The course UUID
 * @param id - Unique ID for the system event (e.g. "sys-del-xxx")
 * @param text - Display text (e.g. "Alice deleted a message")
 * @returns A ChatMessage with _systemText set
 */
export function createSystemEvent(courseId: string, id: string, text: string): ChatMessage {
  const now = new Date().toISOString();
  return {
    id,
    course_id: courseId,
    author_id: "",
    author_name: null,
    author_avatar: null,
    body: "",
    created_at: now,
    updated_at: now,
    _systemText: text,
  };
}

/**
 * Fetches a user's display name from the profile API.
 *
 * @param userId - The user UUID
 * @returns The user's display name or "Someone" if unavailable
 */
export async function fetchUserName(userId: string): Promise<string> {
  try {
    const res = await fetch(`/api/discussions/profile?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      return data.userName ?? "Someone";
    }
  } catch { /* fallback */ }
  return "Someone";
}
