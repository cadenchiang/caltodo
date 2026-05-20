"use client";

import { useState, useEffect, useCallback } from "react";
import type { DiscussionBoard } from "@/lib/types";

const CACHE_KEY = "discussion_boards_cache_v4";
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
    const raw = sessionStorage.getItem(CACHE_KEY);
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
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ boards, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

/**
 * Hook for fetching the user's enrolled discussion boards.
 * Shows cached data after mount to avoid hydration mismatch,
 * then revalidates in the background.
 *
 * @returns boards array, loading state, error state, and refetch function
 */
export function useDiscussionBoards() {
  // Hydrate from cache synchronously so the first paint has real data
  // and we don't flash the skeleton for a frame on every mount.
  // Lazy initializers only run on the client (this hook is "use client").
  const [boards, setBoards] = useState<DiscussionBoard[]>(() => readCache() ?? []);
  const [loading, setLoading] = useState<boolean>(() => readCache() === null);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    setError(null);

    try {
      const res = await fetch("/api/discussions/boards");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch boards (${res.status})`);
      }
      const data: DiscussionBoard[] = await res.json();
      // Sort system courses (CalTodo Fam) first, preserve order for the rest
      data.sort((a, b) => {
        const aSystem = a.course.source === "system" ? 0 : 1;
        const bSystem = b.course.source === "system" ? 0 : 1;
        return aSystem - bSystem;
      });
      setBoards(data);
      writeCache(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial state already hydrated from cache; just revalidate in background.
    fetchBoards();
  }, [fetchBoards]);

  // Refetch when courses are added/removed in settings
  useEffect(() => {
    function handleCoursesChanged() {
      try { sessionStorage.removeItem(CACHE_KEY); } catch { /* non-critical */ }
      fetchBoards();
    }
    window.addEventListener("caltodo-courses-changed", handleCoursesChanged);
    return () => window.removeEventListener("caltodo-courses-changed", handleCoursesChanged);
  }, [fetchBoards]);

  return { boards, loading, error, refetch: fetchBoards };
}
