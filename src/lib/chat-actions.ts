/**
 * Shared chat action utilities for mute, unread, pin, and leave operations.
 * Centralizes localStorage management and event dispatch logic used by
 * ChatSidebar, ChatDetailsSidebar, and ChatContextMenu.
 */

/** localStorage key prefixes for chat state. */
export const MUTE_KEY_PREFIX = "calchat_muted_";
export const READ_AT_PREFIX = "calchat_read_at_";
export const PIN_KEY_PREFIX = "calchat_pinned_";
export const NAME_KEY_PREFIX = "calchat_name_";

/** sessionStorage key prefixes for chat caches. */
export const MSG_CACHE_PREFIX = "chat_messages_cache_";
export const MEM_CACHE_PREFIX = "chat_members_cache_";

/**
 * Toggles the mute state for a chat, persists to localStorage, and
 * dispatches a custom event so other components stay in sync.
 *
 * @param courseId - The course UUID
 * @param currentlyMuted - The current mute state
 * @returns The new mute state (inverse of currentlyMuted)
 */
export function toggleMute(courseId: string, currentlyMuted: boolean): boolean {
  const newMuted = !currentlyMuted;
  try {
    localStorage.setItem(MUTE_KEY_PREFIX + courseId, String(newMuted));
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(
    new CustomEvent("calchat-mute-changed", {
      detail: { courseId, muted: newMuted },
    })
  );
  return newMuted;
}

/**
 * Marks a chat as unread by removing its read_at timestamp.
 * Dispatches a custom event so the sidebar re-evaluates unread state.
 *
 * @param courseId - The course UUID to mark as unread
 */
export function markAsUnread(courseId: string): void {
  try {
    localStorage.removeItem(READ_AT_PREFIX + courseId);
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(
    new CustomEvent("calchat-read-update", {
      detail: { courseId },
    })
  );
}

/**
 * Toggles the pin state for a chat, persists to localStorage, and
 * dispatches a custom event so the sidebar re-sorts.
 *
 * @param courseId - The course UUID
 * @param currentlyPinned - The current pin state
 * @returns The new pin state (inverse of currentlyPinned)
 */
export function togglePin(courseId: string, currentlyPinned: boolean): boolean {
  const newPinned = !currentlyPinned;
  try {
    if (newPinned) {
      localStorage.setItem(PIN_KEY_PREFIX + courseId, "true");
    } else {
      localStorage.removeItem(PIN_KEY_PREFIX + courseId);
    }
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(
    new CustomEvent("calchat-pin-changed", {
      detail: { courseId, pinned: newPinned },
    })
  );
  return newPinned;
}

/**
 * Reads the pin state for a chat from localStorage.
 *
 * @param courseId - The course UUID
 * @returns true if the chat is pinned
 */
export function isPinned(courseId: string): boolean {
  try {
    return localStorage.getItem(PIN_KEY_PREFIX + courseId) === "true";
  } catch {
    return false;
  }
}

/**
 * Calls the leave API for a course and clears all associated caches.
 * Does NOT handle navigation — the caller is responsible for redirecting.
 *
 * @param courseId - The course UUID to leave
 * @returns true on success, false on failure
 */
export async function leaveGroup(courseId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/discussions/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Failed to leave chat:", data.error ?? res.statusText);
      return false;
    }

    // Clear sessionStorage caches
    try {
      sessionStorage.removeItem(MSG_CACHE_PREFIX + courseId);
      sessionStorage.removeItem(MEM_CACHE_PREFIX + courseId);
    } catch {
      // sessionStorage unavailable
    }

    // Clear localStorage overrides
    try {
      localStorage.removeItem(NAME_KEY_PREFIX + courseId);
      localStorage.removeItem(MUTE_KEY_PREFIX + courseId);
      localStorage.removeItem(PIN_KEY_PREFIX + courseId);
      localStorage.removeItem(READ_AT_PREFIX + courseId);
    } catch {
      // localStorage unavailable
    }

    return true;
  } catch (err) {
    console.error("Leave chat error:", err);
    return false;
  }
}
