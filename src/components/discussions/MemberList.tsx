"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Users } from "lucide-react";
import type { CourseMemberProfile } from "@/lib/types";

const CACHE_PREFIX = "chat_members_cache_";
const CACHE_TTL = 5 * 60_000;

/**
 * Reads cached members from sessionStorage.
 *
 * @param courseId - The course UUID
 * @returns Cached members or null if missing/expired
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
  } catch { /* ignore */ }
}

/**
 * Shows all members enrolled in a course with online status indicators.
 * Uses sessionStorage cache for instant rendering on chat switch.
 * Sorts online members first, includes the current user.
 *
 * @param courseId - The course UUID to fetch members for
 * @param onlineUserIds - Set of user IDs currently online (from Presence)
 */
interface MemberListProps {
  courseId: string;
  onlineUserIds?: Set<string>;
}

export default function MemberList({ courseId, onlineUserIds }: MemberListProps) {
  const [members, setMembers] = useState<CourseMemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
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
    setExpanded(false);
  }

  useEffect(() => {
    // If fresh cache exists, use it and skip the fetch
    const cached = readCache(courseId);
    if (cached) {
      setMembers(cached);
      setLoading(false);
      return;
    }

    // No cache — fetch from API
    let cancelled = false;
    fetch(`/api/discussions/members?courseId=${encodeURIComponent(courseId)}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: CourseMemberProfile[]) => {
        if (cancelled) return;
        setMembers(data);
        writeCache(courseId, data);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [courseId]);

  // Alphabetical sort only — no reordering on presence changes
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) =>
      (a.user_name ?? "").localeCompare(b.user_name ?? "")
    );
  }, [members]);

  const onlineCount = onlineUserIds?.size ?? 0;

  if (loading && members.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-3 bg-muted rounded w-20 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted" />
              <div className="h-2.5 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) return null;

  const visibleMembers = expanded ? sortedMembers : sortedMembers.slice(0, 8);

  return (
    <div>
      {/* Online / total count */}
      <div className="flex items-center gap-2 pb-3">
        <span className="text-[12px] font-medium text-muted-foreground">
          {members.length} members
        </span>
        <span className="text-[12px] font-medium">
          {onlineCount > 0
            ? <span className="text-green-500">{onlineCount} online</span>
            : <span className="text-muted-foreground/40">– online</span>
          }
        </span>
      </div>

      {/* Member list */}
      <div className="space-y-0.5">
        {visibleMembers.map((member) => {
          const isOnline = onlineUserIds?.has(member.user_id);
          return (
            <div
              key={member.user_id}
              className="flex items-center gap-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 px-2 -mx-2"
            >
              <div className="relative shrink-0">
                {member.user_avatar ? (
                  <img
                    src={member.user_avatar}
                    alt=""
                    className="w-9 h-9 rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {(member.user_name ?? "?")[0]?.toUpperCase()}
                  </div>
                )}
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900" />
                )}
              </div>
              <span className="text-[14px] text-foreground truncate">
                {member.user_name ?? "Unknown"}
              </span>
            </div>
          );
        })}
      </div>

      {members.length > 8 && (
        <div className="pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
          >
            {expanded ? "Show less" : `Show all ${members.length}`}
          </button>
        </div>
      )}
    </div>
  );
}
