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
import { WidgetShell, WidgetHeader, WidgetEmptyState } from "./WidgetPrimitives";

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
      <WidgetShell>
        <div className="h-full w-full p-3 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 rounded bg-muted" />
                <div className="h-2.5 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </WidgetShell>
    );
  }

  if (sortedBoards.length === 0) {
    return (
      <WidgetEmptyState
        icon={<MessageSquare size={24} />}
        message="No new messages"
      />
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col p-3 overflow-hidden">
      <WidgetHeader
        title="Cal Chat"
        right={
          compact ? (
            <span className="text-xs text-foreground">
              {sortedBoards.length} active
            </span>
          ) : undefined
        }
      />

      {compact ? null : (
        <ul className="flex-1 space-y-1.5 overflow-y-auto">
          {sortedBoards.slice(0, 8).map((board) => (
            <li key={board.course.id} className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-foreground truncate">
                  {board.course.name}
                </span>
                {board.last_message_at && (
                  <span className="text-xs text-foreground shrink-0">
                    {formatRelativeTime(board.last_message_at)}
                  </span>
                )}
              </div>
              {board.last_message_body && (
                <p className="text-xs text-foreground line-clamp-1">
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
