"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
 * Listens for "calchat-members-changed" custom events to refetch
 * when new members join or leave.
 *
 * @param courseId - The course UUID to fetch members for
 * @returns members array, loading state, and refetch function
 */
export function useChatMembers(courseId: string): {
  members: CourseMemberProfile[];
  loading: boolean;
  refetch: () => void;
} {
  const [members, setMembers] = useState<CourseMemberProfile[]>(
    () => readCache(courseId) ?? []
  );
  const [loading, setLoading] = useState(() => !readCache(courseId));
  const prevCourseIdRef = useRef(courseId);
  /** Ref to track the active courseId for stale-guard in async callbacks. */
  const activeCourseIdRef = useRef(courseId);
  activeCourseIdRef.current = courseId;

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

  /**
   * Fetches members from API and updates state + cache.
   * Keeps existing data on failure to prevent list from disappearing.
   */
  const fetchMembers = useCallback(() => {
    fetch(`/api/discussions/members?courseId=${encodeURIComponent(courseId)}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: CourseMemberProfile[] | null) => {
        if (activeCourseIdRef.current !== courseId || !data) return;
        setMembers(data);
        writeCache(courseId, data);
      })
      .catch(() => {
        // Keep existing members on network error
      })
      .finally(() => {
        if (activeCourseIdRef.current === courseId) setLoading(false);
      });
  }, [courseId]);

  useEffect(() => {
    const cached = readCache(courseId);
    if (cached) {
      setMembers(cached);
      setLoading(false);
    }

    fetchMembers();

    // Listen for member change events (fired by useCourseChat on join/leave)
    function handleMemberChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.courseId === courseId) {
        fetchMembers();
      }
    }
    window.addEventListener("calchat-members-changed", handleMemberChange);

    return () => {
      window.removeEventListener("calchat-members-changed", handleMemberChange);
    };
  }, [courseId, fetchMembers]);

  return { members, loading, refetch: fetchMembers };
}
