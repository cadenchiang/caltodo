"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import { useChatListPrefs } from "@/hooks/useChatListPrefs";
import { useToast } from "@/contexts/ToastContext";
import type { DiscussionBoard } from "@/lib/types";
import ChatRow from "./ChatRow";
import ChatContextMenu from "./ChatContextMenu";
import ChatConfirmDialog from "./ChatConfirmDialog";
import ChatListGroup from "./ChatListGroup";
import { ChatListSkeleton } from "./ChatSkeleton";
import { toggleMute, markAsUnread, togglePin, markAsRead } from "@/lib/chat-actions";
import { hideChat, unhideChat, isBoardHidden } from "@/lib/chat-hide";
import { stripParentheses } from "@/lib/chat-utils";

/** The one hide copy, shared with the details panel. */
export const HIDE_CHAT_COPY = {
  title: "Hide this chat?",
  description:
    "It moves to Hidden chats at the bottom of your list and stops sending notifications. You can unhide it any time.",
  confirmLabel: "Hide chat",
} as const;

/**
 * Conversation list. Shown beside the open room on md and up, and as the
 * full page below md (/app/discussions).
 *
 * @param activeCourseId - The open room, highlighted (null on the list page)
 * @param onChatSelect - Opens a room (courseId, courseName)
 */
interface ChatSidebarProps {
  activeCourseId: string | null;
  onChatSelect: (courseId: string, courseName: string) => void;
}

export default function ChatSidebar({ activeCourseId, onChatSelect }: ChatSidebarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { boards, loading, error, refetch } = useDiscussionBoards();
  const { mutedIds, pinnedIds, isUnread } = useChatListPrefs(boards);

  const [contextMenu, setContextMenu] = useState<{ board: DiscussionBoard; position: { x: number; y: number } } | null>(null);
  const [hideTarget, setHideTarget] = useState<DiscussionBoard | null>(null);
  const [hiding, setHiding] = useState(false);
  const [unhidingId, setUnhidingId] = useState<string | null>(null);

  // Mark the active chat as read whenever it changes
  useEffect(() => {
    if (activeCourseId) markAsRead(activeCourseId);
  }, [activeCourseId]);

  // Three groups: current rooms (system first, then pinned), past classes, hidden.
  const { current, past, hidden } = useMemo(() => {
    const current: DiscussionBoard[] = [];
    const past: DiscussionBoard[] = [];
    const hidden: DiscussionBoard[] = [];
    for (const board of boards) {
      if (isBoardHidden(board)) hidden.push(board);
      else if (board.past) past.push(board);
      else current.push(board);
    }
    current.sort((a, b) => {
      const aSystem = a.course.source === "system" ? 0 : 1;
      const bSystem = b.course.source === "system" ? 0 : 1;
      if (aSystem !== bSystem) return aSystem - bSystem;
      const aPinned = pinnedIds.has(a.course.id) ? 0 : 1;
      const bPinned = pinnedIds.has(b.course.id) ? 0 : 1;
      return aPinned - bPinned;
    });
    return { current, past, hidden };
  }, [boards, pinnedIds]);

  /**
   * Hides the confirmed room. If it was the open room, go back to the list
   * (the list page picks a fresh target now that calchat_last_course is
   * cleared and the boards cache is invalidated).
   */
  const handleHideConfirm = useCallback(async () => {
    if (!hideTarget) return;
    const courseId = hideTarget.course.id;
    setHiding(true);
    const ok = await hideChat(courseId, hideTarget.course.source === "system");
    setHiding(false);
    if (!ok) {
      showToast("We couldn't hide that chat. Try again.", { variant: "error" });
      return;
    }
    setHideTarget(null);
    if (courseId === activeCourseId) router.push("/app/discussions");
  }, [hideTarget, activeCourseId, router, showToast]);

  /** Unhides a room from the Hidden chats group. */
  const handleUnhide = useCallback(async (board: DiscussionBoard) => {
    setUnhidingId(board.course.id);
    const ok = await unhideChat(board.course.id, board.course.source === "system");
    setUnhidingId(null);
    if (!ok) showToast("We couldn't unhide that chat. Try again.", { variant: "error" });
  }, [showToast]);

  const renderRow = (board: DiscussionBoard) => (
    <ChatRow
      key={board.course.id}
      board={board}
      isActive={board.course.id === activeCourseId}
      isMuted={mutedIds.has(board.course.id)}
      isPinned={pinnedIds.has(board.course.id)}
      isUnread={isUnread(board)}
      onSelect={onChatSelect}
      onOpenMenu={(pos) => setContextMenu({ board, position: pos })}
    />
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 shrink-0">
        <h2 className="text-base font-semibold text-foreground">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1.5 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-1.5">
        {loading && boards.length === 0 ? (
          <ChatListSkeleton rows={5} />
        ) : error && boards.length === 0 ? (
          <div className="px-4 py-8 text-center space-y-3" role="alert">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : boards.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No chats yet. Your class chats appear here after your first sync.</p>
          </div>
        ) : (
          <>
            {current.map(renderRow)}
            {current.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No current chats. Check the groups below.</p>
            )}
            {past.length > 0 && (
              <ChatListGroup label="Past classes" count={past.length}>
                {past.map(renderRow)}
              </ChatListGroup>
            )}
            {hidden.length > 0 && (
              <ChatListGroup label="Hidden chats" count={hidden.length}>
                {hidden.map((board) => (
                  <div key={board.course.id} className="flex items-center gap-2 px-3 py-2">
                    <span className="flex-1 min-w-0 text-[13px] text-foreground truncate">
                      {stripParentheses(board.course.name)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUnhide(board)}
                      disabled={unhidingId === board.course.id}
                      className="px-3 py-1.5 text-xs rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {unhidingId === board.course.id ? "Unhiding" : "Unhide"}
                    </button>
                  </div>
                ))}
              </ChatListGroup>
            )}
          </>
        )}
      </div>

      {contextMenu && (
        <ChatContextMenu
          position={contextMenu.position}
          isMuted={mutedIds.has(contextMenu.board.course.id)}
          isPinned={pinnedIds.has(contextMenu.board.course.id)}
          onMute={() => toggleMute(contextMenu.board.course.id, mutedIds.has(contextMenu.board.course.id))}
          onMarkUnread={() => markAsUnread(contextMenu.board.course.id)}
          onPin={() => togglePin(contextMenu.board.course.id, pinnedIds.has(contextMenu.board.course.id))}
          onHide={() => setHideTarget(contextMenu.board)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ChatConfirmDialog
        open={hideTarget !== null}
        title={HIDE_CHAT_COPY.title}
        description={HIDE_CHAT_COPY.description}
        confirmLabel={HIDE_CHAT_COPY.confirmLabel}
        loading={hiding}
        onConfirm={handleHideConfirm}
        onCancel={() => setHideTarget(null)}
      />
    </div>
  );
}
