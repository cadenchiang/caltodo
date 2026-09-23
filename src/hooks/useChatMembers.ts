"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CourseMemberProfile } from "@/lib/types";

const CACHE_PREFIX = "chat_members_cache_";
const CACHE_TTL = 5 * 60_000;
/** Members fetched per page. */
export const MEMBERS_PAGE_SIZE = 50;

/** Reads cached members from sessionStorage (null if missing or expired). */
function readCache(courseId: string): CourseMemberProfile[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.members;
  } catch {
    return null;
  }
}

/** Writes members to sessionStorage cache. */
function writeCache(courseId: string, members: CourseMemberProfile[]) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + courseId, JSON.stringify({ members, timestamp: Date.now() }));
  } catch {
    /* sessionStorage unavailable */
  }
}

/**
 * Members of a room, paged.
 *
 * Hydrates from the sessionStorage cache in an effect (not the state
 * initializer, which also runs during SSR and produced a hydration
 * mismatch), fetches the first page, and exposes loadMore for the rest.
 *
 * @param courseId - The course UUID
 * @returns members, total, loading, hasMore, loadMore, refetch
 */
export function useChatMembers(courseId: string): {
  members: CourseMemberProfile[];
  total: number;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
} {
  const [members, setMembers] = useState<CourseMemberProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const activeCourseIdRef = useRef(courseId);
  activeCourseIdRef.current = courseId;
  const loadingMoreRef = useRef(false);

  /** Fetches one page; offset 0 replaces the list, otherwise appends. */
  const fetchPage = useCallback(async (offset: number) => {
    try {
      const res = await fetch(
        `/api/discussions/members?courseId=${encodeURIComponent(courseId)}&limit=${MEMBERS_PAGE_SIZE}&offset=${offset}`,
      );
      if (!res.ok || activeCourseIdRef.current !== courseId) return;
      const page: CourseMemberProfile[] = await res.json();
      const totalHeader = parseInt(res.headers.get("X-Total-Count") ?? "", 10);
      setTotal(Number.isFinite(totalHeader) ? totalHeader : offset + page.length);
      setMembers((prev) => {
        const next = offset === 0 ? page : [...prev, ...page.filter((m) => !prev.some((p) => p.user_id === m.user_id))];
        writeCache(courseId, next);
        return next;
      });
    } catch {
      // Keep existing members on network error
    } finally {
      if (activeCourseIdRef.current === courseId) setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const cached = readCache(courseId);
    setMembers(cached ?? []);
    setTotal(cached?.length ?? 0);
    setLoading(!cached);
    fetchPage(0);
  }, [courseId, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || members.length >= total) return;
    loadingMoreRef.current = true;
    await fetchPage(members.length);
    loadingMoreRef.current = false;
  }, [fetchPage, members.length, total]);

  return { members, total, loading, hasMore: members.length < total, loadMore, refetch: () => fetchPage(0) };
}
