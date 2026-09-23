"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BellOff, Pin, Users } from "lucide-react";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import type { DiscussionBoard } from "@/lib/types";
import GroupAvatar from "./GroupAvatar";
import ChatContextMenu from "./ChatContextMenu";
import LeaveGroupModal from "./LeaveGroupModal";
import {
  MUTE_KEY_PREFIX,
  READ_AT_PREFIX,
  PIN_KEY_PREFIX,
  toggleMute,
  markAsUnread,
  togglePin,
  isPinned as readPinState,
  leaveGroup,
} from "@/lib/chat-actions";
import {
  stripParentheses,
  summarizeBody,
  relativeTime,
  getInitials,
  hasFreshCache,
  prefetchMessages,
  prefetchMembers,
} from "@/lib/chat-utils";

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
 * Single conversation row in the sidebar.
 * Supports right-click context menu and displays pin/mute indicators.
 */
function ChatRow({
  board,
  isActive,
  isMuted,
  isPinned,
  isUnread,
  onSelect,
  onContextMenu,
}: {
  board: DiscussionBoard;
  isActive: boolean;
  isMuted: boolean;
  isPinned: boolean;
  isUnread: boolean;
  onSelect: (courseId: string, courseName: string) => void;
  onContextMenu: (pos: { x: number; y: number }) => void;
}) {
  const isSystem = board.course.source === "system";
  const displayName = isSystem
    ? board.course.name
    : stripParentheses(board.course.name);
  const initials = getInitials(displayName);

  return (
    <button
      onClick={() => onSelect(board.course.id, board.course.name)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu({ x: e.clientX, y: e.clientY });
      }}
      disabled={isActive}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left cursor-pointer disabled:cursor-default ${
        isActive
          ? "bg-gray-200 dark:bg-zinc-700"
          : "hover:bg-gray-100 dark:hover:bg-zinc-800"
      }`}
    >
      <div className="relative shrink-0">
        {isSystem ? (
          <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
            <Users size={22} className="text-muted-foreground" />
          </div>
        ) : (
          <GroupAvatar initials={initials} name={board.course.name} size={44} />
        )}
        {isUnread && !isActive && (
          <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-[#0e89d6] border-2 border-white dark:border-zinc-900" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-[13px] truncate ${
              isActive
                ? "font-semibold text-foreground"
                : "font-medium text-foreground"
            }`}
          >
            {displayName}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isPinned && (
              <Pin size={11} className="text-muted-foreground/40" />
            )}
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
        <p className={`text-[12px] truncate mt-0.5 ${isUnread && !isActive ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
          {board.last_message_body
            ? `${board.last_message_author ?? "Anonymous"}: ${summarizeBody(board.last_message_body)}`
            : "No messages yet"}
        </p>
      </div>
    </button>
  );
}

export default function ChatSidebar({
  activeCourseId,
  onChatSelect,
}: ChatSidebarProps) {
  const router = useRouter();
  const { boards, loading } = useDiscussionBoards();
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [readUpdateTick, setReadUpdateTick] = useState(0);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    board: DiscussionBoard;
    position: { x: number; y: number };
  } | null>(null);

  // Leave confirmation modal target
  const [leaveTarget, setLeaveTarget] = useState<DiscussionBoard | null>(null);

  // Read mute + pin states from localStorage on mount and when boards change
  useEffect(() => {
    const muted = new Set<string>();
    const pinned = new Set<string>();
    for (const board of boards) {
      try {
        if (
          localStorage.getItem(MUTE_KEY_PREFIX + board.course.id) === "true"
        ) {
          muted.add(board.course.id);
        }
        if (readPinState(board.course.id)) {
          pinned.add(board.course.id);
        }
      } catch {
        /* ignore */
      }
    }
    setMutedIds(muted);
    setPinnedIds(pinned);
  }, [boards]);

  // Listen for mute changes from ChatDetailsSidebar or context menu
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
      setReadUpdateTick((t) => t + 1);
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

  // Mark the active chat as read whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        READ_AT_PREFIX + activeCourseId,
        new Date().toISOString()
      );
    } catch {
      /* ignore */
    }
    // Notify sidebar badge to recheck unread count
    window.dispatchEvent(
      new CustomEvent("calchat-read-update", { detail: { courseId: activeCourseId } })
    );
  }, [activeCourseId]);

  /**
   * Checks if a board has unread messages by comparing last_message_at with
   * the stored read_at timestamp. Also considers the user's own last-sent
   * timestamp so messages the current user typed are never flagged unread,
   * and applies a small clock-skew tolerance to avoid flicker when the
   * server's last_message_at is a hair newer than the local read_at.
   */
  const OWN_CLOCK_SKEW_MS = 5000;
  function isUnread(board: DiscussionBoard): boolean {
    // readUpdateTick is used to trigger re-evaluation
    void readUpdateTick;
    try {
      // No messages yet → nothing to be unread about
      if (!board.last_message_at) return false;

      const readAt = localStorage.getItem(READ_AT_PREFIX + board.course.id);
      const lastSentRaw = localStorage.getItem(`calchat_last_sent_${board.course.id}`);
      const readTime = readAt ? new Date(readAt).getTime() : 0;
      const sentTime = lastSentRaw ? parseInt(lastSentRaw, 10) : 0;

      // Never opened AND never sent → unread
      if (!readTime && !sentTime) return true;

      const lastMsg = new Date(board.last_message_at).getTime();
      return lastMsg > Math.max(readTime, sentTime) + OWN_CLOCK_SKEW_MS;
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

  // Sort boards: system first → pinned → rest (stable order within groups).
  // Unread state intentionally does NOT affect order — reading or receiving a
  // message should not shuffle the list position.
  const sortedBoards = useMemo(() => {
    return [...boards].sort((a, b) => {
      const aSystem = a.course.source === "system" ? 0 : 1;
      const bSystem = b.course.source === "system" ? 0 : 1;
      if (aSystem !== bSystem) return aSystem - bSystem;
      const aPinned = pinnedIds.has(a.course.id) ? 0 : 1;
      const bPinned = pinnedIds.has(b.course.id) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;
      return 0;
    });
  }, [boards, pinnedIds]);

  /**
   * Handles the leave group confirmation. Calls the API, then navigates
   * to discussions list if the left chat was the active one.
   */
  async function handleLeaveConfirm() {
    if (!leaveTarget) return;
    const courseId = leaveTarget.course.id;
    const success = await leaveGroup(courseId);
    if (success) {
      setLeaveTarget(null);
      if (courseId === activeCourseId) {
        router.push("/app/discussions");
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <h2 className="text-base md:text-xl font-bold text-foreground">Messages</h2>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        {loading && boards.length === 0 ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 animate-pulse"
              >
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
          sortedBoards.map((board) => (
            <ChatRow
              key={board.course.id}
              board={board}
              isActive={board.course.id === activeCourseId}
              isMuted={mutedIds.has(board.course.id)}
              isPinned={pinnedIds.has(board.course.id)}
              isUnread={isUnread(board)}
              onSelect={onChatSelect}
              onContextMenu={(pos) => setContextMenu({ board, position: pos })}
            />
          ))
        )}
      </div>

      {/* Right-click context menu */}
      {contextMenu && typeof document !== "undefined" && (
        <ChatContextMenu
          position={contextMenu.position}
          isMuted={mutedIds.has(contextMenu.board.course.id)}
          isPinned={pinnedIds.has(contextMenu.board.course.id)}
          isSystemCourse={contextMenu.board.course.source === "system"}
          onMute={() =>
            toggleMute(
              contextMenu.board.course.id,
              mutedIds.has(contextMenu.board.course.id)
            )
          }
          onMarkUnread={() => markAsUnread(contextMenu.board.course.id)}
          onPin={() =>
            togglePin(
              contextMenu.board.course.id,
              pinnedIds.has(contextMenu.board.course.id)
            )
          }
          onLeave={() => setLeaveTarget(contextMenu.board)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Leave group confirmation modal */}
      {leaveTarget && typeof document !== "undefined" && (
        <LeaveGroupModal
          courseName={stripParentheses(leaveTarget.course.name)}
          onConfirm={handleLeaveConfirm}
          onClose={() => setLeaveTarget(null)}
        />
      )}
    </div>
  );
}
