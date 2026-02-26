"use client";

import type { ChatMessage } from "@/lib/types";

/**
 * iMessage-style chat bubble.
 * Own messages: right-aligned, blue background, white text.
 * Others' messages: left-aligned, gray background.
 * Shows avatar/name only for the first message in a consecutive group.
 *
 * @param message - The chat message to display
 * @param isOwn - Whether the current user sent this message
 * @param showAuthor - Whether to show avatar/name (first in group)
 * @param isLastInGroup - Whether this is the last message in a consecutive group
 */
interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAuthor: boolean;
  isLastInGroup: boolean;
}

/**
 * Formats a timestamp as a short time string (e.g. "2:30 PM").
 *
 * @param dateStr - ISO date string
 * @returns Formatted time string
 */
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message, isOwn, showAuthor, isLastInGroup }: MessageBubbleProps) {
  return (
    <div
      className={`flex gap-2 ${
        isOwn ? "flex-row-reverse" : "flex-row"
      } ${showAuthor ? "mt-3" : "mt-0.5"}`}
    >
      {/* Avatar spacer / avatar — only for others' messages */}
      {!isOwn && <div className="w-7 shrink-0 flex flex-col justify-end">
        {showAuthor && isLastInGroup && (
          message.author_avatar ? (
            <img
              src={message.author_avatar}
              alt=""
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              {(message.author_name ?? "?")[0]?.toUpperCase()}
            </div>
          )
        )}
      </div>}

      {/* Bubble */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
        {/* Author name - only shown for others' first message in group */}
        {!isOwn && showAuthor && (
          <span className="text-[11px] font-medium text-muted-foreground mb-0.5 ml-1">
            {message.author_name ?? "Unknown"}
          </span>
        )}

        <div
          className={`px-3.5 py-2 text-[14.5px] leading-[1.35] break-words whitespace-pre-wrap ${
            isOwn
              ? `bg-[#007AFF] text-white ${
                  isLastInGroup
                    ? "rounded-[20px] rounded-br-[6px]"
                    : "rounded-[20px] rounded-br-[6px]"
                }`
              : `bg-[#E9E9EB] dark:bg-[#303030] text-black dark:text-white ${
                  isLastInGroup
                    ? "rounded-[20px] rounded-bl-[6px]"
                    : "rounded-[20px] rounded-bl-[6px]"
                }`
          } ${showAuthor ? "" : ""}`}
        >
          {message.body}
        </div>

        {/* Timestamp - show on last message in group */}
        {isLastInGroup && (
          <span className={`text-[10px] text-muted-foreground/60 mt-0.5 ${isOwn ? "mr-1" : "ml-1"}`}>
            {formatTime(message.created_at)}
          </span>
        )}
      </div>
    </div>
  );
}
