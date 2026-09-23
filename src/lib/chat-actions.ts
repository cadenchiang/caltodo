/**
 * Shared chat action utilities for mute, read state, and pin operations.
 * Centralizes localStorage management and event dispatch logic used by
 * ChatSidebar, ChatDetailsSidebar, ChatContextMenu and the notifier.
 * Hide / unhide live in chat-hide.ts.
 */

/** localStorage key prefixes for chat state. */
export const MUTE_KEY_PREFIX = "calchat_muted_";
export const READ_AT_PREFIX = "calchat_read_at_";
export const PIN_KEY_PREFIX = "calchat_pinned_";
export const NAME_KEY_PREFIX = "calchat_name_";
/** localStorage key remembering the last opened room. */
export const LAST_CHAT_KEY = "calchat_last_course";

/** sessionStorage key prefixes for chat caches. */
export const MSG_CACHE_PREFIX = "chat_messages_cache_";
export const MEM_CACHE_PREFIX = "chat_members_cache_";

/**
 * Reads the mute state for a chat.
 *
 * System courses (CalYak) are muted by default for everyone (D5): with no
 * stored value they report muted, and only an explicit "false" unmutes.
 * Every other chat defaults to unmuted.
 *
 * @param courseId - The course UUID
 * @param isSystemCourse - Whether the course is a system course
 * @returns true when notifications and sounds are suppressed for this chat
 */
export function isChatMuted(courseId: string, isSystemCourse: boolean): boolean {
  try {
    const stored = localStorage.getItem(MUTE_KEY_PREFIX + courseId);
    if (stored === null) return isSystemCourse;
    return stored === "true";
  } catch {
    return isSystemCourse;
  }
}

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
 * Marks a chat as read now and notifies the unread badge.
 *
 * @param courseId - The course UUID that was viewed
 */
export function markAsRead(courseId: string): void {
  try {
    localStorage.setItem(READ_AT_PREFIX + courseId, new Date().toISOString());
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(
    new CustomEvent("calchat-read-update", { detail: { courseId } })
  );
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
 * Establishes a read baseline for rooms the user has never opened.
 *
 * Without this, the first visit flagged every room as unread: no read_at
 * meant "unread", so a brand-new user saw a badge on all of their classes.
 * Rooms with no read_at are marked read as of now; rooms already read are
 * left alone so a real unread state survives.
 *
 * @param courseIds - Every room id in the user's list
 * @returns The ids that received a baseline
 */
export function ensureReadBaseline(courseIds: readonly string[]): string[] {
  const seeded: string[] = [];
  const now = new Date().toISOString();
  for (const id of courseIds) {
    try {
      if (localStorage.getItem(READ_AT_PREFIX + id) === null) {
        localStorage.setItem(READ_AT_PREFIX + id, now);
        seeded.push(id);
      }
    } catch {
      // localStorage unavailable
    }
  }
  return seeded;
}

/** localStorage prefix for the time the user last sent into a room. */
export const LAST_SENT_PREFIX = "calchat_last_sent_";

/**
 * Tolerance for the server stamping a message a hair after the client
 * marked the room read (own sends, clock skew). Two seconds is enough for
 * that and short enough that a classmate's reply still shows as unread.
 */
const READ_SKEW_MS = 2000;

/**
 * Whether a room has messages newer than the user last read it.
 *
 * @param courseId - The course UUID
 * @param lastMessageAt - ISO timestamp of the newest message, or null
 * @returns true when the newest message is newer than read_at (or the
 *          user's own last send, whichever is later). A room with no
 *          read_at is NOT unread (see ensureReadBaseline).
 */
export function isChatUnread(courseId: string, lastMessageAt: string | null | undefined): boolean {
  if (!lastMessageAt) return false;
  try {
    const readAt = localStorage.getItem(READ_AT_PREFIX + courseId);
    if (!readAt) return false;
    const sentRaw = localStorage.getItem(LAST_SENT_PREFIX + courseId);
    const sentAt = sentRaw ? parseInt(sentRaw, 10) || 0 : 0;
    const seenAt = Math.max(new Date(readAt).getTime(), sentAt);
    return new Date(lastMessageAt).getTime() > seenAt + READ_SKEW_MS;
  } catch {
    return false;
  }
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
