"use client";

import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "discussion_boards_cache_v2";
const MUTE_KEY_PREFIX = "calchat_muted_";
const READ_AT_PREFIX = "calchat_read_at_";

/**
 * Checks whether any non-muted CalChat board has unread messages.
 * Reads boards from sessionStorage cache and compares timestamps.
 * Re-checks on storage events, custom events, and a 10-second interval.
 *
 * @returns true if any board has unread messages
 */
export function useCalChatUnread(): boolean {
  const [hasUnread, setHasUnread] = useState(false);

  const check = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const entry = JSON.parse(raw);
      const boards: Array<{
        course: { id: string };
        last_message_at?: string | null;
      }> = entry.boards ?? [];

      const unread = boards.some((board) => {
        if (!board.last_message_at) return false;
        try {
          if (localStorage.getItem(MUTE_KEY_PREFIX + board.course.id) === "true") return false;
          const readAt = localStorage.getItem(READ_AT_PREFIX + board.course.id);
          if (!readAt) return true;
          return new Date(board.last_message_at!) > new Date(readAt);
        } catch {
          return false;
        }
      });

      setHasUnread(unread);
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

  return hasUnread;
}
