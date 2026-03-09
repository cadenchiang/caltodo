"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import type { DiscussionBoard } from "@/lib/types";

/**
 * Card for a single course chat room in the board list.
 * Shows course name (parenthetical content stripped), source badge,
 * member avatars, and last message preview.
 * Prefetches messages before navigating for instant chat rendering.
 *
 * @param board - The discussion board data
 */
interface BoardCardProps {
  board: DiscussionBoard;
}

/** Maps source to a colored badge. */
const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  canvas: { label: "Canvas", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  gradescope: { label: "Gradescope", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  pensieve: { label: "Pensive", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

/**
 * Strips parenthetical content from a course name.
 * e.g. "CS 61A (Spring 2026)" -> "CS 61A"
 *
 * @param name - The raw course name
 * @returns Cleaned course name without parenthetical content
 */
function stripParentheses(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

/**
 * Formats a timestamp as a relative time string.
 *
 * @param dateStr - ISO date string
 * @returns Relative time like "2m", "1h", "3d", or formatted date
 */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CACHE_PREFIX = "chat_messages_cache_";

/**
 * Checks if a fresh sessionStorage cache exists for a course.
 *
 * @param courseId - The course UUID
 * @returns true if valid cache exists (less than 60s old)
 */
function hasFreshCache(courseId: string): boolean {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
    if (!raw) return false;
    const entry = JSON.parse(raw);
    return Date.now() - entry.timestamp < 5 * 60_000;
  } catch {
    return false;
  }
}

/**
 * Prefetches messages for a course and stores them in sessionStorage cache.
 *
 * @param courseId - The course UUID to prefetch
 */
async function prefetchMessages(courseId: string): Promise<void> {
  try {
    const res = await fetch(
      `/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=50`
    );
    if (!res.ok) return;
    const data = await res.json();
    const sorted = [...data].reverse();
    sessionStorage.setItem(
      CACHE_PREFIX + courseId,
      JSON.stringify({ messages: sorted.slice(0, 200), timestamp: Date.now() })
    );
  } catch {
    // Navigate anyway on fetch failure
  }
}

export default function BoardCard({ board }: BoardCardProps) {
  const router = useRouter();
  const [prefetching, setPrefetching] = useState(false);

  const badge = SOURCE_BADGE[board.course.source] ?? { label: board.course.source, className: "bg-gray-100 text-gray-700" };
  const avatars = board.member_avatars ?? [];
  const hasMembers = board.member_count > 1;
  const memberCount = board.member_count - 1;
  const extraCount = Math.max(0, memberCount - avatars.length + 1);
  const displayName = stripParentheses(board.course.name);

  /**
   * Prefetches chat messages, then navigates to the chat page.
   */
  const handleClick = useCallback(async () => {
    const url = `/app/discussions/${board.course.id}?name=${encodeURIComponent(board.course.name)}`;

    if (hasFreshCache(board.course.id)) {
      router.push(url);
      return;
    }

    setPrefetching(true);
    await prefetchMessages(board.course.id);
    setPrefetching(false);
    router.push(url);
  }, [board.course.id, board.course.name, router]);

  return (
    <button
      onClick={handleClick}
      disabled={prefetching}
      className={`group block w-full text-left rounded-xl border border-black/30 dark:border-white/20 bg-card p-4 shadow-sm shadow-black/5 hover:shadow-md dark:shadow-none transition-all hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer ${
        prefetching ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-blue-500 transition-colors line-clamp-2">
          {displayName}
        </h3>
        <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Member avatars — only shown when other people are enrolled */}
      {hasMembers && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {avatars.slice(0, Math.min(avatars.length, 4)).map((member, i) => (
              member.avatar ? (
                <img
                  key={i}
                  src={member.avatar}
                  alt={member.name ?? ""}
                  title={member.name ?? "Member"}
                  className="w-6 h-6 rounded-full border-2 border-card"
                />
              ) : (
                <div
                  key={i}
                  title={member.name ?? "Member"}
                  className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground"
                >
                  {(member.name ?? "?")[0]?.toUpperCase()}
                </div>
              )
            ))}
            {extraCount > 0 && (
              <div className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                +{extraCount}
              </div>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      )}

      {/* Last message preview or message count */}
      {board.last_message_body ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageCircle size={13} className="shrink-0" />
          <span className="truncate">
            <span className="font-medium">{board.last_message_author ?? "Anonymous"}: </span>
            {board.last_message_body}
          </span>
          {board.last_message_at && (
            <span className="shrink-0 text-muted-foreground/60">
              {relativeTime(board.last_message_at)}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageCircle size={13} />
          <span>No messages yet</span>
        </div>
      )}
    </button>
  );
}
