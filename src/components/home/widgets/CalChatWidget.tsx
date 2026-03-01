"use client";

/**
 * Cal Chat widget showing recent messages across all course chats.
 * Lists the most recently active courses with their last messages.
 * Shows "No new messages" when there are no discussions.
 *
 * @param config - Widget configuration (unused for now)
 */

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";

interface CalChatWidgetProps {
  config?: Record<string, string>;
}

export default function CalChatWidget({ config }: CalChatWidgetProps) {
  const { boards, loading } = useDiscussionBoards();

  /** Boards sorted by most recent message first. */
  const sortedBoards = useMemo(() => {
    return [...boards]
      .filter((b) => b.last_message_at)
      .sort((a, b) => {
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bTime - aTime;
      });
  }, [boards]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sortedBoards.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
        <MessageSquare size={24} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No new messages</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} className="text-blue-500 shrink-0" />
        <h3 className="text-sm font-semibold text-foreground">Cal Chat</h3>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto">
        {sortedBoards.slice(0, 5).map((board) => (
          <li key={board.course.id} className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground truncate">
                {board.course.name}
              </span>
              {board.last_message_at && (
                <span className="text-[10px] text-subtle-foreground shrink-0 ml-2">
                  {formatRelativeTime(board.last_message_at)}
                </span>
              )}
            </div>
            {board.last_message_body && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                <span className="font-medium">{board.last_message_author}: </span>
                {board.last_message_body}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Formats a timestamp into a short relative time string.
 *
 * @param isoStr - ISO 8601 timestamp string
 * @returns Human-readable relative time (e.g. "2h", "3d", "Jan 5")
 */
function formatRelativeTime(isoStr: string): string {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;

  return new Date(isoStr).toLocaleDateString([], { month: "short", day: "numeric" });
}
