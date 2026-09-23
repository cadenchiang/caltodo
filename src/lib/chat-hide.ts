/**
 * Hide and unhide a chat room (D3, D5).
 *
 * Hiding a normal course room soft-deletes the membership through
 * POST /api/discussions/leave; unhiding clears it through PATCH. The room
 * moves to the "Hidden chats" group and stops notifying; nothing is lost.
 *
 * System courses (CalYak) are different: the API refuses to soft-delete
 * their membership, so hiding one is a per-device preference stored in
 * localStorage plus a mute. The list, the notifier and the unread badge all
 * consult isBoardHidden(), which merges the two.
 *
 * @module chat-hide
 */

import type { DiscussionBoard } from "@/lib/types";
import {
  LAST_CHAT_KEY,
  MUTE_KEY_PREFIX,
  NAME_KEY_PREFIX,
  PIN_KEY_PREFIX,
  READ_AT_PREFIX,
  MSG_CACHE_PREFIX,
  MEM_CACHE_PREFIX,
} from "@/lib/chat-actions";

/** localStorage prefix for the per-device "hidden" flag on system courses. */
export const SYSTEM_HIDDEN_KEY_PREFIX = "calchat_hidden_system_";

/** sessionStorage key for the boards list cache (shared with useDiscussionBoards). */
export const BOARDS_CACHE_KEY = "discussion_boards_cache_v4";

/** Event fired when the boards list must be refetched. */
export const BOARDS_CHANGED_EVENT = "calchat-boards-changed";

/**
 * Whether a board is hidden from the list, on the server or on this device.
 *
 * @param board - A board from /api/discussions/boards
 * @returns true when the room belongs in the "Hidden chats" group
 */
export function isBoardHidden(board: Pick<DiscussionBoard, "hidden" | "course">): boolean {
  if (board.hidden) return true;
  if (board.course.source !== "system") return false;
  try {
    return localStorage.getItem(SYSTEM_HIDDEN_KEY_PREFIX + board.course.id) === "true";
  } catch {
    return false;
  }
}

/**
 * Drops the boards cache and asks every boards hook to refetch.
 */
export function invalidateBoardsCache(): void {
  try {
    sessionStorage.removeItem(BOARDS_CACHE_KEY);
  } catch {
    // sessionStorage unavailable
  }
  window.dispatchEvent(new CustomEvent(BOARDS_CHANGED_EVENT));
}

/**
 * Forgets everything this device remembers about a room: caches, nickname,
 * pin, mute, read state, and the "last opened room" pointer when it points
 * here. The last-opened pointer matters most: /app/discussions used to read
 * it and send the user straight back into the room they had just left.
 *
 * @param courseId - The course UUID
 */
export function clearRoomState(courseId: string): void {
  try {
    sessionStorage.removeItem(MSG_CACHE_PREFIX + courseId);
    sessionStorage.removeItem(MEM_CACHE_PREFIX + courseId);
  } catch {
    // sessionStorage unavailable
  }
  try {
    localStorage.removeItem(NAME_KEY_PREFIX + courseId);
    localStorage.removeItem(MUTE_KEY_PREFIX + courseId);
    localStorage.removeItem(PIN_KEY_PREFIX + courseId);
    localStorage.removeItem(READ_AT_PREFIX + courseId);
    if (localStorage.getItem(LAST_CHAT_KEY) === courseId) {
      localStorage.removeItem(LAST_CHAT_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

/**
 * Hides a chat. Normal courses go through the API; system courses are
 * hidden on this device only (and muted so they never notify).
 *
 * @param courseId - The course UUID
 * @param isSystemCourse - Whether the course is a system course
 * @returns true on success. On failure the caller should surface an error;
 *          nothing local is cleared so the room stays where it was.
 */
export async function hideChat(courseId: string, isSystemCourse: boolean): Promise<boolean> {
  if (isSystemCourse) {
    try {
      localStorage.setItem(SYSTEM_HIDDEN_KEY_PREFIX + courseId, "true");
      localStorage.setItem(MUTE_KEY_PREFIX + courseId, "true");
      if (localStorage.getItem(LAST_CHAT_KEY) === courseId) {
        localStorage.removeItem(LAST_CHAT_KEY);
      }
    } catch {
      return false;
    }
    invalidateBoardsCache();
    return true;
  }

  try {
    const res = await fetch("/api/discussions/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Failed to hide chat:", data.error ?? res.statusText);
      return false;
    }
  } catch (err) {
    console.error("Hide chat error:", err);
    return false;
  }

  clearRoomState(courseId);
  invalidateBoardsCache();
  return true;
}

/**
 * Unhides a chat hidden with hideChat().
 *
 * @param courseId - The course UUID
 * @param isSystemCourse - Whether the course is a system course
 * @returns true on success
 */
export async function unhideChat(courseId: string, isSystemCourse: boolean): Promise<boolean> {
  if (isSystemCourse) {
    try {
      localStorage.removeItem(SYSTEM_HIDDEN_KEY_PREFIX + courseId);
    } catch {
      return false;
    }
    invalidateBoardsCache();
    return true;
  }

  try {
    const res = await fetch("/api/discussions/leave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Failed to unhide chat:", data.error ?? res.statusText);
      return false;
    }
  } catch (err) {
    console.error("Unhide chat error:", err);
    return false;
  }

  invalidateBoardsCache();
  return true;
}

/**
 * Picks the room to open on desktop: the last opened room if it is still
 * visible, else the first visible room. Hidden rooms are never chosen, so
 * hiding the open room no longer bounces the user straight back into it.
 *
 * @param boards - Every board, hidden ones included
 * @returns The target board, or null when there is nothing to open
 */
export function pickInitialRoom(boards: readonly DiscussionBoard[]): DiscussionBoard | null {
  const visible = boards.filter((b) => !isBoardHidden(b));
  if (visible.length === 0) return null;
  try {
    const lastId = localStorage.getItem(LAST_CHAT_KEY);
    const match = lastId ? visible.find((b) => b.course.id === lastId) : undefined;
    if (match) return match;
  } catch {
    // localStorage unavailable
  }
  return visible[0];
}
