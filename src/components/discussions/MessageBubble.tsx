"use client";

import { memo, useState } from "react";
import { EyeOff, RotateCcw } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import type { ReactionGroup } from "@/hooks/useMessageReactions";
import MessageBody from "./MessageBody";
import MessageToolbar from "./MessageToolbar";

/**
 * Props for a chat bubble.
 *
 * @param message - The chat message to display
 * @param isOwn - Whether the current user sent this message
 * @param showAuthor - Whether to show the avatar and name (first in a visual group)
 * @param isLastInGroup - Whether this is the last message in a consecutive group
 * @param isLastMessage - Whether this is the very last message in the conversation
 * @param anonymousNumber - Sequential number for the anonymous author (#N)
 * @param reactions - Aggregated reactions on this message
 * @param currentUserId - Current user id (for highlighting own reactions)
 * @param isAdmin - Whether the viewer may reveal anonymous identities
 * @param revealedIdentity - Identity already revealed for this author key
 * @param onRevealIdentity - Records a revealed identity (authorKey, name, avatar)
 * @param replyTo - The quoted message, or null when not a reply / not found
 * @param replyToAnonymousNumber - #N for the quoted message when anonymous
 * @param onDelete - Unsend (own messages only)
 * @param onReport - Report (others' messages only)
 * @param onReply - Start a reply
 * @param onRetry - Resend a failed message
 * @param onToggleReaction - (messageId, emoji), stable so memo works
 * @param onViewReactions - Open the reactions detail modal
 * @param onScrollToMessage - Scroll to the quoted message
 */
interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAuthor: boolean;
  isLastInGroup: boolean;
  isLastMessage?: boolean;
  anonymousNumber?: number;
  reactions?: ReactionGroup[];
  currentUserId?: string;
  isAdmin?: boolean;
  revealedIdentity?: { name: string; avatar: string | null };
  onRevealIdentity?: (authorKey: string, name: string, avatar: string | null) => void;
  replyTo?: ChatMessage | null;
  replyToAnonymousNumber?: number;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  onReply?: (message: ChatMessage) => void;
  onRetry?: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onViewReactions?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
}

/** A message with no author name was sent anonymously. */
function isAnonymous(message: ChatMessage): boolean {
  return !message.author_name;
}

function MessageBubble({
  message, isOwn, showAuthor, isLastInGroup, isLastMessage,
  anonymousNumber, reactions, currentUserId, isAdmin, revealedIdentity, onRevealIdentity,
  replyTo, replyToAnonymousNumber, onDelete, onReport, onReply, onRetry, onToggleReaction, onViewReactions, onScrollToMessage,
}: MessageBubbleProps) {
  const anonymous = isAnonymous(message);
  const isSending = message._status === "sending";
  const isFailed = message._status === "failed";
  const [revealing, setRevealing] = useState(false);
  const revealedName = revealedIdentity?.name ?? null;
  const revealedAvatar = revealedIdentity?.avatar ?? null;

  const showStatus = isOwn && (isSending || isFailed || (isLastMessage && !isSending && !isFailed));
  const hasReactions = !!reactions && reactions.length > 0;
  const myReactions = new Set(
    reactions?.filter((g) => currentUserId && g.userIds.includes(currentUserId)).map((g) => g.emoji) ?? [],
  );
  const totalReactionCount = reactions?.reduce((sum, g) => sum + g.userIds.length, 0) ?? 0;

  const bubbleClass = `px-3.5 py-2 text-[14.5px] leading-[1.35] break-words whitespace-pre-wrap rounded-[20px] ${
    isOwn
      ? anonymous ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-blue-500 text-white"
      : "bg-muted text-foreground"
  }`;
  const cornerClass = isLastInGroup ? (isOwn ? "rounded-br-[6px]" : "rounded-bl-[6px]") : "";

  /** Admin: reveal the identity behind this anonymous message. */
  async function handleReveal() {
    setRevealing(true);
    try {
      const res = await fetch(`/api/discussions/admin/reveal?messageId=${encodeURIComponent(message.id)}`);
      if (res.ok) {
        const data = await res.json();
        onRevealIdentity?.(message.author_key, data.userName ?? "Unknown", data.userAvatar ?? null);
      }
    } finally {
      setRevealing(false);
    }
  }

  return (
    <div
      className={`flex gap-1.5 group/msg ${isOwn ? "flex-row-reverse" : "flex-row"} ${showAuthor ? "mt-3" : "mt-0.5"} ${
        isSending ? "animate-[fadeInUp_200ms_ease-out]" : "animate-[msgFadeIn_150ms_ease-out]"
      } motion-reduce:animate-none`}
    >
      {!isOwn && (
        <div className="w-6 shrink-0 flex flex-col justify-end">
          {isLastInGroup && (
            anonymous && !revealedAvatar ? (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center" aria-hidden="true">
                <EyeOff size={12} className="text-muted-foreground" />
              </div>
            ) : (revealedAvatar || message.author_avatar) ? (
              <img
                src={revealedAvatar ?? message.author_avatar ?? undefined}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground" aria-hidden="true">
                {(message.author_name ?? "?")[0]?.toUpperCase()}
              </div>
            )
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
        {!isOwn && showAuthor && (
          <span className={`text-[11px] font-medium mb-0.5 ml-1 flex items-center gap-1.5 text-muted-foreground ${anonymous ? "italic" : ""}`}>
            {anonymous ? `#${anonymousNumber ?? "?"}` : message.author_name}
            {isAdmin && anonymous && !revealedName && (
              <button
                type="button"
                onClick={handleReveal}
                disabled={revealing}
                aria-label={`Reveal who sent this (#${anonymousNumber ?? "?"})`}
                className="text-[10px] not-italic text-blue-500 hover:text-blue-600 cursor-pointer disabled:opacity-50 opacity-0 group-hover/msg:opacity-100 group-focus-within/msg:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
              >
                {revealing ? "Revealing" : "Reveal"}
              </button>
            )}
            {isAdmin && revealedName && <span className="text-[10px] not-italic text-blue-500">({revealedName})</span>}
          </span>
        )}

        {replyTo && (
          <button
            type="button"
            onClick={() => onScrollToMessage?.(replyTo.id)}
            aria-label="Go to the quoted message"
            className={`flex items-center gap-1.5 mb-0.5 cursor-pointer hover:opacity-80 transition-opacity ${isOwn ? "mr-1" : "ml-1"}`}
          >
            <div className="w-0.5 min-h-[20px] self-stretch bg-input-border rounded-full shrink-0" aria-hidden="true" />
            <div className="min-w-0 text-left">
              <span className="text-[10px] font-medium text-muted-foreground">
                {replyTo.author_name ?? `#${replyToAnonymousNumber ?? "?"}`}
              </span>
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{replyTo.body.slice(0, 60)}</p>
            </div>
          </button>
        )}
        {message.reply_to_id && !replyTo && (
          <div className={`text-[10px] text-muted-foreground italic mb-0.5 ${isOwn ? "mr-1" : "ml-1"}`}>Replied to a deleted message</div>
        )}

        <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"} ${hasReactions ? "mb-2" : ""}`}>
          <div className={`relative flex flex-col ${isOwn ? "items-end" : "items-start"} min-w-0`}>
            <MessageBody body={message.body} bubbleClass={bubbleClass} cornerClass={cornerClass} dimmed={isSending} />

            {hasReactions && (
              <button
                type="button"
                onClick={() => onViewReactions?.(message.id)}
                aria-label={`${totalReactionCount} reaction${totalReactionCount === 1 ? "" : "s"}, see who reacted`}
                className={`absolute -bottom-2 flex items-center gap-[2px] px-1 py-[1px] rounded-full bg-popover border border-border cursor-pointer ${isOwn ? "right-1" : "left-1"}`}
              >
                {reactions!.slice(0, 3).map(({ emoji }) => (
                  <span key={emoji} className="text-[9px] leading-none">{emoji}</span>
                ))}
                {totalReactionCount > 1 && (
                  <span className="text-[9px] font-medium text-muted-foreground leading-none ml-[1px]">{totalReactionCount}</span>
                )}
              </button>
            )}
          </div>

          {!isSending && !isFailed && (
            <div className="transition-opacity opacity-0 group-hover/msg:opacity-100 group-focus-within/msg:opacity-100 pointer-coarse:opacity-100">
              <MessageToolbar
                isOwn={isOwn}
                myReactions={myReactions}
                onReact={onToggleReaction ? (emoji) => onToggleReaction(message.id, emoji) : undefined}
                onReply={onReply ? () => onReply(message) : undefined}
                onDelete={isOwn && onDelete ? () => onDelete(message.id) : undefined}
                onReport={!isOwn && onReport ? () => onReport(message.id) : undefined}
              />
            </div>
          )}
        </div>

        {showStatus && (
          isFailed ? (
            <button
              type="button"
              onClick={() => onRetry?.(message.id)}
              className="flex items-center gap-1 text-[11px] mt-0.5 mr-1 text-red-500 hover:text-red-600 cursor-pointer"
            >
              <RotateCcw size={11} aria-hidden="true" />
              Not sent. Tap to retry
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[10px] mt-0.5 mr-1 text-muted-foreground">
              {anonymous && <EyeOff size={10} aria-hidden="true" />}
              {anonymous ? "Anonymous" : ""}
              {anonymous ? " " : ""}
              {isSending ? "Sending" : "Delivered"}
            </span>
          )
        )}
      </div>
    </div>
  );
}

/**
 * Memoized so realtime inserts and unrelated state changes don't re-render
 * every bubble. ChatView passes stable handler refs and per-message data
 * via discrete props, so the default shallow comparison skips nearly all
 * re-renders.
 */
export default memo(MessageBubble);
