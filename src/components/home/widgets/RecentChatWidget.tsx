"use client";

/**
 * Widget showing the latest messages from a course's CalChat.
 * Uses useDiscussionBoards to fetch available boards.
 * Picks the first board by default, or uses config.courseId if set.
 */

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";

interface RecentChatWidgetProps {
  config: Record<string, string>;
}

export default function RecentChatWidget({ config }: RecentChatWidgetProps) {
  const { boards, loading } = useDiscussionBoards();

  const board = useMemo(() => {
    if (!boards.length) return null;
    if (config.courseId) {
      return boards.find((b) => b.course.id === config.courseId) || boards[0];
    }
    return boards[0];
  }, [boards, config.courseId]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
        <MessageSquare size={24} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No chats yet</p>
        <p className="text-xs text-subtle-foreground mt-1">
          Join a course to see messages
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-4 overflow-hidden">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground truncate">
          {board.course.name}
        </h3>
      </div>

      {board.last_message_body ? (
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

          <p className="text-xs text-secondary-foreground line-clamp-3 mt-1">
            <span className="font-medium">{board.last_message_author}: </span>
            {board.last_message_body}
          </p>

          {board.last_message_at && (
            <span className="text-[10px] text-subtle-foreground mt-auto pt-1">
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
