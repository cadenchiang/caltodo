"use client";

import { useState, useEffect, useCallback } from "react";
import type { DiscussionBoard } from "@/lib/types";
import { ensureReadBaseline } from "@/lib/chat-actions";
import { BOARDS_CACHE_KEY, BOARDS_CHANGED_EVENT } from "@/lib/chat-hide";
import { friendlyChatError } from "@/lib/chat-errors";

const CACHE_TTL_MS = 60_000; // 1 minute

interface CacheEntry {
  boards: DiscussionBoard[];
  timestamp: number;
}

/**
 * Reads cached boards from sessionStorage.
 * Returns null if cache is missing or expired.
 */
function readCache(): DiscussionBoard[] | null {
  try {
    const raw = sessionStorage.getItem(BOARDS_CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.boards;
  } catch {
    return null;
  }
}

/**
 * Writes boards to sessionStorage cache.
 */
function writeCache(boards: DiscussionBoard[]) {
  try {
    sessionStorage.setItem(BOARDS_CACHE_KEY, JSON.stringify({ boards, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

/**
 * Hook for fetching the user's discussion boards (visible and hidden).
 *
 * Hydrates from the sessionStorage cache in an effect, never in the state
 * initializer: this hook runs during SSR of client components too, where
 * there is no sessionStorage, so an initializer produced a server tree
 * with no boards and a client tree with boards (a hydration mismatch).
 *
 * @returns boards array (check `board.hidden`), loading state, a plain
 *          error string for students, and refetch
 */
export function useDiscussionBoards() {
  const [boards, setBoards] = useState<DiscussionBoard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    setError(null);

    try {
      const res = await fetch("/api/discussions/boards");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(friendlyChatError(res.status, data.error, "load your chats"));
      }
      const data: DiscussionBoard[] = await res.json();
      // Sort system courses (CalYak) first, preserve order for the rest
      data.sort((a, b) => {
        const aSystem = a.course.source === "system" ? 0 : 1;
        const bSystem = b.course.source === "system" ? 0 : 1;
        return aSystem - bSystem;
      });
      // First visit: rooms never opened count as read from now, not unread.
      ensureReadBaseline(data.filter((b) => !b.hidden).map((b) => b.course.id));
      setBoards(data);
      writeCache(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : friendlyChatError(0, null, "load your chats");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Show cached data first (stale-while-revalidate), then revalidate.
    const cached = readCache();
    if (cached) {
      setBoards(cached);
      setLoading(false);
    }
    fetchBoards();
  }, [fetchBoards]);

  // Refetch when courses change in settings or a room is hidden / unhidden.
  useEffect(() => {
    function handleChanged() {
      try { sessionStorage.removeItem(BOARDS_CACHE_KEY); } catch { /* non-critical */ }
      fetchBoards();
    }
    window.addEventListener("caltodo-courses-changed", handleChanged);
    window.addEventListener(BOARDS_CHANGED_EVENT, handleChanged);
    return () => {
      window.removeEventListener("caltodo-courses-changed", handleChanged);
      window.removeEventListener(BOARDS_CHANGED_EVENT, handleChanged);
    };
  }, [fetchBoards]);

  return { boards, loading, error, refetch: fetchBoards };
}
