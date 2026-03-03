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
import { useCompactMode } from "@/hooks/useCompactMode";

interface CalChatWidgetProps {
  config?: Record<string, string>;
}

export default function CalChatWidget({ config }: CalChatWidgetProps) {
  const { boards, loading } = useDiscussionBoards();
  const { containerRef, compact } = useCompactMode(160);

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
        <MessageSquare size={24} className="text-foreground mb-2" />
        <p className="text-sm text-foreground">No new messages</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Cal Chat</h3>
        {compact && (
          <span className="text-xs text-muted-foreground">
            {sortedBoards.length} active
          </span>
        )}
      </div>

      {compact ? null : (
        <ul className="flex-1 space-y-1.5 overflow-y-auto">
          {sortedBoards.slice(0, 8).map((board) => (
            <li key={board.course.id} className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-foreground truncate">
                  {board.course.name}
                </span>
                {board.last_message_at && (
                  <span className="text-[10px] text-foreground/60 shrink-0">
                    {formatRelativeTime(board.last_message_at)}
                  </span>
                )}
              </div>
              {board.last_message_body && (
                <p className="text-[11px] text-foreground/70 line-clamp-1">
                  <span className="font-medium">{board.last_message_author}: </span>
                  {board.last_message_body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
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
