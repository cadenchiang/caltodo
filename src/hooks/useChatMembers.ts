"use client";

import { useState, useEffect, useRef } from "react";
import type { CourseMemberProfile } from "@/lib/types";

const CACHE_PREFIX = "chat_members_cache_";
const CACHE_TTL = 5 * 60_000;

/**
 * Reads cached members from sessionStorage.
 *
 * @param courseId - The course UUID
 * @returns Cached members array or null if missing/expired
 */
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

/**
 * Writes members to sessionStorage cache.
 *
 * @param courseId - The course UUID
 * @param members - Members to cache
 */
function writeCache(courseId: string, members: CourseMemberProfile[]) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + courseId,
      JSON.stringify({ members, timestamp: Date.now() })
    );
  } catch {
    /* sessionStorage unavailable */
  }
}

/**
 * Hook to fetch and cache course members for a given course.
 * Uses stale-while-revalidate: returns cached data instantly,
 * then refreshes from API in background.
 *
 * @param courseId - The course UUID to fetch members for
 * @returns members array and loading state
 */
export function useChatMembers(courseId: string): {
  members: CourseMemberProfile[];
  loading: boolean;
} {
  const [members, setMembers] = useState<CourseMemberProfile[]>(
    () => readCache(courseId) ?? []
  );
  const [loading, setLoading] = useState(() => !readCache(courseId));
  const prevCourseIdRef = useRef(courseId);

  // Synchronously update state when courseId changes (no flash frame)
  if (prevCourseIdRef.current !== courseId) {
    prevCourseIdRef.current = courseId;
    const cached = readCache(courseId);
    if (cached) {
      setMembers(cached);
      setLoading(false);
    } else {
      setMembers([]);
      setLoading(true);
    }
  }

  useEffect(() => {
    const cached = readCache(courseId);
    if (cached) {
      setMembers(cached);
      setLoading(false);
    }

    let cancelled = false;
    fetch(`/api/discussions/members?courseId=${encodeURIComponent(courseId)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CourseMemberProfile[]) => {
        if (cancelled) return;
        setMembers(data);
        writeCache(courseId, data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return { members, loading };
}
