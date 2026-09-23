"use client";

import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "discussion_boards_cache_v4";
const MUTE_KEY_PREFIX = "calchat_muted_";
const READ_AT_PREFIX = "calchat_read_at_";

/**
 * Counts how many non-muted CalChat boards have unread messages.
 * Reads boards from sessionStorage cache and compares timestamps.
 * Re-checks on storage events, custom events, and a 10-second interval.
 *
 * @returns Number of boards with unread messages
 */
export function useCalChatUnread(): number {
  const [unreadCount, setUnreadCount] = useState(0);

  const check = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const entry = JSON.parse(raw);
      const boards: Array<{
        course: { id: string };
        last_message_at?: string | null;
      }> = entry.boards ?? [];

      let count = 0;
      for (const board of boards) {
        if (!board.last_message_at) continue;
        try {
          if (localStorage.getItem(MUTE_KEY_PREFIX + board.course.id) === "true") continue;
          const readAt = localStorage.getItem(READ_AT_PREFIX + board.course.id);
          if (!readAt) { count++; continue; }
          if (new Date(board.last_message_at!) > new Date(readAt)) count++;
        } catch {
          // Storage unavailable for this board
        }
      }

      setUnreadCount(count);
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    check();

    const interval = setInterval(check, 10_000);

    function handleStorage() { check(); }
    function handleReadUpdate() { check(); }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("calchat-read-update", handleReadUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("calchat-read-update", handleReadUpdate);
    };
  }, [check]);

  return unreadCount;
}
