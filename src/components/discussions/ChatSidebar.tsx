"use client";

import { useEffect, useState } from "react";
import { BellOff } from "lucide-react";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import type { DiscussionBoard } from "@/lib/types";
import GroupAvatar from "./GroupAvatar";

const MUTE_KEY_PREFIX = "calchat_muted_";
const READ_AT_PREFIX = "calchat_read_at_";

/**
 * Instagram DM-style conversation list sidebar.
 * Shown alongside the active chat when inside a group chat.
 * Calls onChatSelect to switch chats via client state (no page navigation).
 * Eagerly prefetches all chat messages on mount for instant switching.
 *
 * @param activeCourseId - The currently open course chat ID (highlighted)
 * @param onChatSelect - Callback to switch active chat (courseId, courseName)
 */
interface ChatSidebarProps {
  activeCourseId: string;
  onChatSelect: (courseId: string, courseName: string) => void;
}

/**
 * Strips parenthetical content from a course name.
 *
 * @param name - Raw course name
 * @returns Cleaned name without parentheses
 */
function stripParentheses(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

/** Image file extensions to detect in message body URLs. */
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

/**
 * Summarizes a message body for preview: replaces image URLs with a label.
 *
 * @param body - The raw message body
 * @returns Human-readable preview string
 */
function summarizeBody(body: string): string {
  const lines = body.split("\n");
  const textLines: string[] = [];
  let imageCount = 0;
  for (const line of lines) {
    const t = line.trim();
    if ((t.startsWith("http://") || t.startsWith("https://")) && (() => { try { return IMAGE_EXT.test(new URL(t).pathname); } catch { return false; } })()) {
      imageCount++;
    } else {
      textLines.push(line);
    }
  }
  const text = textLines.join(" ").trim();
  if (text && imageCount > 0) return `${text} · ${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
  if (imageCount > 0) return `${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
  return text;
}

/**
 * Formats a timestamp as a relative time string.
 *
 * @param dateStr - ISO date string
 * @returns Short relative time like "2m", "1h", "3d"
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

/**
 * Generates initials for a course name (first letter of first two words).
 *
 * @param name - Course display name
 * @returns 1-2 character initials string
 */
function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const CACHE_PREFIX = "chat_messages_cache_";
const CACHE_TTL = 5 * 60_000;

/**
 * Checks if a fresh sessionStorage cache exists for a course.
 *
 * @param courseId - The course UUID
 * @returns true if valid cache exists
 */
function hasFreshCache(courseId: string): boolean {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
    if (!raw) return false;
    const entry = JSON.parse(raw);
    return Date.now() - entry.timestamp < CACHE_TTL;
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
    // Silent failure for prefetch
  }
}

const MEMBERS_CACHE_PREFIX = "chat_members_cache_";

/**
 * Prefetches members for a course and stores in sessionStorage.
 *
 * @param courseId - The course UUID to prefetch
 */
async function prefetchMembers(courseId: string): Promise<void> {
  try {
    const existing = sessionStorage.getItem(MEMBERS_CACHE_PREFIX + courseId);
    if (existing) {
      const entry = JSON.parse(existing);
      if (Date.now() - entry.timestamp < CACHE_TTL) return;
    }
    const res = await fetch(
      `/api/discussions/members?courseId=${encodeURIComponent(courseId)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    sessionStorage.setItem(
      MEMBERS_CACHE_PREFIX + courseId,
      JSON.stringify({ members: data, timestamp: Date.now() })
    );
  } catch {
    // Silent failure
  }
}

/**
 * Single conversation row in the sidebar.
 */
function ChatRow({
  board,
  isActive,
  isMuted,
  isUnread,
  onSelect,
}: {
  board: DiscussionBoard;
  isActive: boolean;
  isMuted: boolean;
  isUnread: boolean;
  onSelect: (courseId: string, courseName: string) => void;
}) {
  const isSystem = board.course.source === "system";
  const displayName = isSystem ? board.course.name : stripParentheses(board.course.name);
  const initials = getInitials(displayName);

  return (
    <button
      onClick={() => onSelect(board.course.id, board.course.name)}
      disabled={isActive}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left cursor-pointer disabled:cursor-default ${
        isActive
          ? "bg-gray-200 dark:bg-zinc-700"
          : "hover:bg-gray-100 dark:hover:bg-zinc-800"
      }`}
    >
      <div className="relative shrink-0">
        {isSystem ? (
          <img
            src="/calchatlogo-clean.png"
            alt="CalTodo Fam"
            className="w-11 h-11 rounded-full object-cover dark:invert"
          />
        ) : (
          <GroupAvatar initials={initials} name={board.course.name} size={44} />
        )}
        {isUnread && !isActive && (
          <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-[#007AFF] border-2 border-white dark:border-zinc-900" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-[13px] truncate ${isActive ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
            {displayName}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isMuted && (
              <BellOff size={11} className="text-muted-foreground/40" />
            )}
            {board.last_message_at && (
              <span className="text-[10px] text-muted-foreground/60">
                {relativeTime(board.last_message_at)}
              </span>
            )}
          </div>
        </div>
        <p className="text-[12px] text-muted-foreground truncate mt-0.5">
          {board.last_message_body
            ? `${board.last_message_author ?? "Anonymous"}: ${summarizeBody(board.last_message_body)}`
            : "No messages yet"}
        </p>
      </div>
    </button>
  );
}

export default function ChatSidebar({ activeCourseId, onChatSelect }: ChatSidebarProps) {
  const { boards, loading } = useDiscussionBoards();
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());

  // Read mute states from localStorage on mount and when boards change
  useEffect(() => {
    const muted = new Set<string>();
    for (const board of boards) {
      try {
        if (localStorage.getItem(MUTE_KEY_PREFIX + board.course.id) === "true") {
          muted.add(board.course.id);
        }
      } catch { /* ignore */ }
    }
    setMutedIds(muted);
  }, [boards]);

  // Listen for mute changes from ChatDetailsSidebar
  useEffect(() => {
    // Cross-tab: storage event
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
    }
    // Same-tab: custom event
    function handleMuteChanged(e: Event) {
      const { courseId, muted } = (e as CustomEvent).detail;
      setMutedIds((prev) => {
        const next = new Set(prev);
        if (muted) next.add(courseId);
        else next.delete(courseId);
        return next;
      });
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener("calchat-mute-changed", handleMuteChanged);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("calchat-mute-changed", handleMuteChanged);
    };
  }, []);

  // Mark the active chat as read whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(READ_AT_PREFIX + activeCourseId, new Date().toISOString());
    } catch { /* ignore */ }
  }, [activeCourseId]);

  /**
   * Checks if a board has unread messages by comparing last_message_at
   * with the stored read_at timestamp.
   */
  function isUnread(board: DiscussionBoard): boolean {
    if (!board.last_message_at) return false;
    try {
      const readAt = localStorage.getItem(READ_AT_PREFIX + board.course.id);
      if (!readAt) return true; // Never opened → unread if has messages
      return new Date(board.last_message_at) > new Date(readAt);
    } catch {
      return false;
    }
  }

  // Eagerly prefetch messages and members for all chats on mount
  useEffect(() => {
    if (boards.length === 0) return;
    for (const board of boards) {
      if (!hasFreshCache(board.course.id)) {
        prefetchMessages(board.course.id);
      }
      prefetchMembers(board.course.id);
    }
  }, [boards]);

  return (
    <div className="flex flex-col h-full">
      {/* Header — no bottom border */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <h2 className="text-[15px] font-bold text-foreground">Messages</h2>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        {loading && boards.length === 0 ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 bg-muted rounded w-24 mb-1.5" />
                  <div className="h-3 bg-muted rounded w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No chats yet</p>
          </div>
        ) : (
          boards.map((board) => (
            <ChatRow
              key={board.course.id}
              board={board}
              isActive={board.course.id === activeCourseId}
              isMuted={mutedIds.has(board.course.id)}
              isUnread={isUnread(board)}
              onSelect={onChatSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
