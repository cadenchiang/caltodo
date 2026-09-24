"use client";

import { useState, useEffect, useCallback } from "react";
import type { DiscussionBoard } from "@/lib/types";
import { isChatMuted, isChatUnread } from "@/lib/chat-actions";
import { BOARDS_CACHE_KEY, BOARDS_CHANGED_EVENT, isBoardHidden } from "@/lib/chat-hide";

/**
 * Counts unread rooms for the nav badge.
 *
 * Reads the boards cache and compares each room's newest message with the
 * device's read_at. Hidden rooms and muted rooms (system rooms are muted by
 * default) never count, and a room with no read baseline is not unread
 * (the first visit seeds one). Re-checks on storage and chat events and
 * every 10 seconds.
 *
 * @returns Number of rooms with unread messages
 */
export function useCalChatUnread(): number {
  const [unreadCount, setUnreadCount] = useState(0);

  const check = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(BOARDS_CACHE_KEY);
      if (!raw) return;
      const boards: DiscussionBoard[] = JSON.parse(raw).boards ?? [];
      let count = 0;
      for (const board of boards) {
        if (isBoardHidden(board)) continue;
        if (isChatMuted(board.course.id, board.course.source === "system")) continue;
        if (isChatUnread(board.course.id, board.last_message_at)) count++;
      }
      setUnreadCount(count);
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 10_000);
    window.addEventListener("storage", check);
    window.addEventListener("calchat-read-update", check);
    window.addEventListener("calchat-mute-changed", check);
    window.addEventListener(BOARDS_CHANGED_EVENT, check);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", check);
      window.removeEventListener("calchat-read-update", check);
      window.removeEventListener("calchat-mute-changed", check);
      window.removeEventListener(BOARDS_CHANGED_EVENT, check);
    };
  }, [check]);

  return unreadCount;
}
