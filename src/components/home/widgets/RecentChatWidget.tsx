"use client";

/**
 * Widget showing the latest messages from a course's CalChat.
 * Uses useDiscussionBoards to fetch available boards.
 * Picks the first board by default, or uses config.courseId if set.
 */

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import { useCompactMode } from "@/hooks/useCompactMode";
import { WidgetShell, WidgetHeader, WidgetEmptyState } from "./WidgetPrimitives";

interface RecentChatWidgetProps {
  config: Record<string, string>;
}

export default function RecentChatWidget({ config }: RecentChatWidgetProps) {
  const { boards, loading } = useDiscussionBoards();
  const { containerRef, compact } = useCompactMode(160);

  const board = useMemo(() => {
    if (!boards.length) return null;
    if (config.courseId) {
      return boards.find((b) => b.course.id === config.courseId) || boards[0];
    }
    return boards[0];
  }, [boards, config.courseId]);

  if (loading) {
    return (
      <WidgetShell centered>
        <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </WidgetShell>
    );
  }

  if (!board) {
    return (
      <WidgetEmptyState
        icon={<MessageSquare size={24} />}
        message="No chats yet"
      />
    );
  }

  const messageCount = board.member_count || 0;

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col p-4 overflow-hidden">
      <WidgetHeader title={board.course.name} />

      {compact ? (
        <div className="flex-1 flex items-center">
          <span className="text-xs text-muted-foreground">
            {messageCount} members
          </span>
        </div>
      ) : board.last_message_body ? (
        <div className="flex-1 flex flex-col justify-start overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1">
            {/* Member avatars */}
            <div className="flex -space-x-1.5">
              {board.member_avatars.slice(0, 3).map((m, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-muted border border-card overflow-hidden"
                >
                  {m.avatar ? (
                    <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                      {m.name?.[0] || "?"}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {board.member_count} members
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
            <span className="font-medium text-foreground">{board.last_message_author}: </span>
            {board.last_message_body}
          </p>

          {board.last_message_at && (
            <span className="text-[10px] text-muted-foreground mt-auto pt-1">
              {new Date(board.last_message_at).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">No messages yet</p>
        </div>
      )}
    </div>
  );
}
