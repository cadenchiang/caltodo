"use client";

import { useRef } from "react";
import { BellOff, MoreHorizontal, Pin, Users } from "lucide-react";
import type { DiscussionBoard } from "@/lib/types";
import GroupAvatar from "./GroupAvatar";
import { stripParentheses, summarizeBody, relativeTime, getInitials, prefetchRoom } from "@/lib/chat-utils";
import { platformLabel } from "@/lib/chat-room-groups";

/**
 * Props for a single conversation row in the chat list.
 *
 * @param board - The board to render
 * @param isActive - Whether this room is open
 * @param isMuted - Whether the room is muted
 * @param isPinned - Whether the room is pinned
 * @param isUnread - Whether the room has unread messages
 * @param onSelect - Opens the room (courseId, courseName)
 * @param onOpenMenu - Opens the row menu at the given viewport point
 */
interface ChatRowProps {
  board: DiscussionBoard;
  isActive: boolean;
  isMuted: boolean;
  isPinned: boolean;
  isUnread: boolean;
  onSelect: (courseId: string, courseName: string) => void;
  onOpenMenu: (pos: { x: number; y: number }) => void;
}

/**
 * Conversation row: avatar, name, platform badge, last message preview.
 *
 * The row is a button; its options menu is a sibling button (nested
 * buttons are invalid HTML) that is always visible on coarse pointers and
 * on hover / focus-within elsewhere. Right-click opens the same menu.
 * Messages and members for the room are prefetched on hover or focus, not
 * for every room on mount.
 */
export default function ChatRow({
  board,
  isActive,
  isMuted,
  isPinned,
  isUnread,
  onSelect,
  onOpenMenu,
}: ChatRowProps) {
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const isSystem = board.course.source === "system";
  const displayName = isSystem ? board.course.name : stripParentheses(board.course.name);
  const sources = (board.sources ?? [board.course.source]).filter((s) => s !== "system");
  const badge = sources.map(platformLabel).join(" + ");

  /** Opens the options menu anchored to the "..." button. */
  function openMenuFromButton() {
    const rect = menuBtnRef.current?.getBoundingClientRect();
    onOpenMenu({ x: rect ? rect.right - 180 : 0, y: rect ? rect.bottom + 4 : 0 });
  }

  return (
    <div className="relative group/row">
      <button
        type="button"
        onClick={() => onSelect(board.course.id, board.course.name)}
        onContextMenu={(e) => {
          e.preventDefault();
          onOpenMenu({ x: e.clientX, y: e.clientY });
        }}
        onMouseEnter={() => prefetchRoom(board.course.id)}
        onFocus={() => prefetchRoom(board.course.id)}
        aria-current={isActive ? "page" : undefined}
        className={`w-full flex items-center gap-3 pl-3 pr-10 py-2.5 rounded-xl transition-colors text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isActive ? "bg-muted" : "hover:bg-muted/60"
        }`}
      >
        <div className="relative shrink-0">
          {isSystem ? (
            <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
              <Users size={22} className="text-muted-foreground" aria-hidden="true" />
            </div>
          ) : (
            <GroupAvatar initials={getInitials(displayName)} name={board.course.name} size={44} />
          )}
          {isUnread && !isActive && (
            <span
              className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-background"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[13px] truncate text-foreground ${isActive ? "font-semibold" : "font-medium"}`}>
              {displayName}
              {isUnread && !isActive && <span className="sr-only"> (unread)</span>}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {isPinned && <Pin size={11} className="text-muted-foreground" aria-label="Pinned" />}
              {isMuted && <BellOff size={11} className="text-muted-foreground" aria-label="Muted" />}
              {board.last_message_at && (
                <span className="text-[10px] text-muted-foreground">{relativeTime(board.last_message_at)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
            {badge && (
              <span className="shrink-0 px-1.5 py-px rounded text-[9px] font-medium bg-muted text-muted-foreground">
                {badge}
              </span>
            )}
            <p className={`text-[12px] truncate ${isUnread && !isActive ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              {board.last_message_body
                ? `${board.last_message_author ?? "Anonymous"}: ${summarizeBody(board.last_message_body)}`
                : "No messages yet"}
            </p>
          </div>
        </div>
      </button>

      <button
        ref={menuBtnRef}
        type="button"
        onClick={openMenuFromButton}
        aria-label={`Options for ${displayName}`}
        aria-haspopup="menu"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-opacity cursor-pointer opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 pointer-coarse:opacity-100 focus-visible:opacity-100"
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
