/**
 * CalChat cache utility.
 * Updates the board-level `last_message_at` timestamp in sessionStorage
 * so the unread badge re-counts immediately when a new message arrives.
 *
 * @module calchat-cache
 */

/** SessionStorage key shared with useDiscussionBoards and GlobalChatNotifier. */
const DEFAULT_CACHE_KEY = "discussion_boards_cache_v4";

/**
 * Updates `last_message_at` for a specific board in the sessionStorage cache
 * and dispatches a `calchat-read-update` custom event so useCalChatUnread
 * recounts immediately.
 *
 * @param courseId - The course UUID whose timestamp should be bumped
 * @param cacheKey - SessionStorage key (defaults to discussion_boards_cache_v4)
 * @returns void
 *
 * @edge-cases
 * - Does not throw when sessionStorage is unavailable or cache is empty
 * - Does not throw on invalid/corrupt JSON in cache
 * - Does not modify other boards' timestamps
 */
export function updateBoardCacheTimestamp(
  courseId: string,
  cacheKey: string = DEFAULT_CACHE_KEY
): void {
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const entry = JSON.parse(raw);
      const boards: Array<{ course: { id: string }; last_message_at?: string | null }> =
        entry.boards ?? [];

      let updated = false;
      for (const board of boards) {
        if (board.course.id === courseId) {
          board.last_message_at = new Date().toISOString();
          updated = true;
          break;
        }
      }

      if (updated) {
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
      }
    }
  } catch {
    /* sessionStorage unavailable or corrupt JSON — safe to ignore */
  }

  // Always dispatch the event so listeners re-check, even if storage failed
  try {
    window.dispatchEvent(
      new CustomEvent("calchat-read-update", { detail: { courseId } })
    );
  } catch {
    /* window/CustomEvent unavailable (SSR edge case) */
  }
}
