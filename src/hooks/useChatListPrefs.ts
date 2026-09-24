"use client";

import { useEffect, useState, useCallback } from "react";
import type { DiscussionBoard } from "@/lib/types";
import {
  MUTE_KEY_PREFIX,
  PIN_KEY_PREFIX,
  isChatMuted,
  isChatUnread,
  isPinned as readPinState,
} from "@/lib/chat-actions";

/**
 * Per-device room preferences for the chat list: mute, pin and unread.
 *
 * Reads localStorage after mount (never during render, so SSR and the
 * client agree) and stays in sync with the custom events the shared
 * chat-actions helpers dispatch, plus cross-tab storage events.
 *
 * @param boards - The boards to track
 * @returns muted / pinned id sets and an `isUnread(board)` predicate
 */
export function useChatListPrefs(boards: readonly DiscussionBoard[]) {
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [readTick, setReadTick] = useState(0);

  // Read mute + pin states when boards change
  useEffect(() => {
    const muted = new Set<string>();
    const pinned = new Set<string>();
    for (const board of boards) {
      if (isChatMuted(board.course.id, board.course.source === "system")) muted.add(board.course.id);
      if (readPinState(board.course.id)) pinned.add(board.course.id);
    }
    setMutedIds(muted);
    setPinnedIds(pinned);
  }, [boards]);

  // Stay in sync with changes made elsewhere (details panel, other tabs)
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key?.startsWith(MUTE_KEY_PREFIX)) {
        const id = e.key.slice(MUTE_KEY_PREFIX.length);
        setMutedIds((prev) => {
          const next = new Set(prev);
          if (e.newValue === "true") next.add(id);
          else next.delete(id);
          return next;
        });
      }
      if (e.key?.startsWith(PIN_KEY_PREFIX)) {
        const id = e.key.slice(PIN_KEY_PREFIX.length);
        setPinnedIds((prev) => {
          const next = new Set(prev);
          if (e.newValue === "true") next.add(id);
          else next.delete(id);
          return next;
        });
      }
      setReadTick((t) => t + 1);
    }
    function handleMuteChanged(e: Event) {
      const { courseId, muted } = (e as CustomEvent).detail;
      setMutedIds((prev) => {
        const next = new Set(prev);
        if (muted) next.add(courseId);
        else next.delete(courseId);
        return next;
      });
    }
    function handlePinChanged(e: Event) {
      const { courseId, pinned } = (e as CustomEvent).detail;
      setPinnedIds((prev) => {
        const next = new Set(prev);
        if (pinned) next.add(courseId);
        else next.delete(courseId);
        return next;
      });
    }
    function handleReadUpdate() {
      setReadTick((t) => t + 1);
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener("calchat-mute-changed", handleMuteChanged);
    window.addEventListener("calchat-pin-changed", handlePinChanged);
    window.addEventListener("calchat-read-update", handleReadUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("calchat-mute-changed", handleMuteChanged);
      window.removeEventListener("calchat-pin-changed", handlePinChanged);
      window.removeEventListener("calchat-read-update", handleReadUpdate);
    };
  }, []);

  const isUnread = useCallback(
    (board: DiscussionBoard) => {
      void readTick; // re-evaluate after read updates
      return isChatUnread(board.course.id, board.last_message_at);
    },
    [readTick],
  );

  return { mutedIds, pinnedIds, isUnread };
}
