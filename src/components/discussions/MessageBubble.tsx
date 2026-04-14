"use client";

import { useState, useRef, useEffect } from "react";
import { EyeOff, MoreVertical, Undo2, Smile, CornerUpLeft, Flag } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import type { ReactionGroup } from "@/hooks/useMessageReactions";
import ImageLightbox from "./ImageLightbox";
import SensitiveImageOverlay from "@/components/ui/SensitiveImageOverlay";

/**
 * iMessage-style chat bubble with hover action toolbar and tapback reactions.
 *
 * @param message - The chat message to display
 * @param isOwn - Whether the current user sent this message
 * @param showAuthor - Whether to show avatar/name (first in visual group)
 * @param isLastInGroup - Whether this is the last message in a consecutive group
 * @param isLastMessage - Whether this is the very last message in the conversation
 * @param anonymousNumber - Sequential number for anonymous users
 * @param reactions - Aggregated reactions on this message
 * @param currentUserId - Current user ID (for highlighting own reactions)
 * @param onDelete - Callback to unsend a message (own messages only)
 * @param onReply - Callback to reply to a message
 * @param onToggleReaction - Callback to toggle a reaction emoji
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
  /** Whether the current user is an admin (can reveal anonymous identities). */
  isAdmin?: boolean;
  /** Pre-revealed identity for this message's author (lifted from ChatView). */
  revealedIdentity?: { name: string; avatar: string | null };
  /** Callback to record a revealed identity in the parent so all messages from the user update. */
  onRevealIdentity?: (userId: string, name: string, avatar: string | null) => void;
  /** The message being replied to (null if not found or not a reply). */
  replyTo?: ChatMessage | null;
  onDelete?: (messageId: string) => void;
  /** Callback to report another user's message. Only shown for non-own messages. */
  onReport?: (messageId: string) => void;
  onReply?: (message: ChatMessage) => void;
  onToggleReaction?: (emoji: string) => void;
  /** Callback to open the reactions detail modal for this message. */
  onViewReactions?: (messageId: string) => void;
  /** Callback to scroll to a specific message (for reply quote clicks). */
  onScrollToMessage?: (messageId: string) => void;
}

/** Image file extensions to detect in URLs. */
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

/** iMessage tapback emoji options. */
const TAPBACK_EMOJI = ["❤️", "👍", "👎", "😂", "‼️", "❓"];

/**
 * Checks if a string is a URL pointing to an image file.
 * Strips [sensitive] prefix before URL validation.
 *
 * @param text - A single line of message text
 * @returns true if the line is an image URL (with or without [sensitive] prefix)
 */
function isImageUrl(text: string): boolean {
  let trimmed = text.trim();
  if (trimmed.startsWith("[sensitive]")) trimmed = trimmed.slice("[sensitive]".length);
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  try {
    const url = new URL(trimmed);
    return IMAGE_EXTENSIONS.test(url.pathname);
  } catch {
    return false;
  }
}

/**
 * Parses an image line, extracting the URL and sensitivity flag.
 *
 * @param line - A single line of message text (may have [sensitive] prefix)
 * @returns Object with the clean URL and whether it's sensitive
 */
function parseImageLine(line: string): { url: string; isSensitive: boolean } {
  const trimmed = line.trim();
  if (trimmed.startsWith("[sensitive]")) {
    return { url: trimmed.slice("[sensitive]".length), isSensitive: true };
  }
  return { url: trimmed, isSensitive: false };
}

/**
 * Checks if a message was sent anonymously.
 *
 * @param message - The chat message
 * @returns true if the message has no author identity
 */
function isAnonymous(message: ChatMessage): boolean {
  return !message.author_name;
}

export default function MessageBubble({
  message, isOwn, showAuthor, isLastInGroup, isLastMessage,
  anonymousNumber, reactions, currentUserId, isAdmin, revealedIdentity, onRevealIdentity, replyTo, onDelete, onReport, onReply, onToggleReaction, onViewReactions, onScrollToMessage,
}: MessageBubbleProps) {
  const anonymous = isAnonymous(message);
  const isSending = message._status === "sending";
  const isFailed = message._status === "failed";
  const [showMenu, setShowMenu] = useState(false);
  const [showReactPicker, setShowReactPicker] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  /** Real name and avatar from lifted reveal state (shared across all messages from same user). */
  const revealedName = revealedIdentity?.name ?? null;
  const revealedAvatar = revealedIdentity?.avatar ?? null;
  const [revealing, setRevealing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reactPickerRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  // Close reaction picker on outside click
  useEffect(() => {
    if (!showReactPicker) return;
    function handleClick(e: MouseEvent) {
      if (reactPickerRef.current && !reactPickerRef.current.contains(e.target as Node)) {
        setShowReactPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showReactPicker]);

  const showStatus = isOwn && (isSending || isFailed || (isLastMessage && !isSending && !isFailed));
  const hasReactions = reactions && reactions.length > 0;
  /** Set of emojis the current user has reacted with (for picker highlighting). */
  const myReactions = new Set(
    reactions?.filter((g) => currentUserId && g.userIds.includes(currentUserId)).map((g) => g.emoji) ?? [],
  );
  /** Total number of reactions across all emojis. */
  const totalReactionCount = reactions?.reduce((sum, g) => sum + g.userIds.length, 0) ?? 0;

  return (
    <div
      className={`flex gap-1.5 group/msg ${
        isOwn ? "flex-row-reverse" : "flex-row"
      } ${showAuthor ? "mt-3" : "mt-0.5"} ${isSending ? "animate-[fadeInUp_200ms_ease-out]" : "animate-[msgFadeIn_150ms_ease-out]"}`}
    >
      {/* Avatar spacer / avatar — only for others' messages */}
      {!isOwn && <div className="w-6 shrink-0 flex flex-col justify-end">
        {isLastInGroup && (
          anonymous && !revealedAvatar ? (
            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <EyeOff size={12} className="text-zinc-500 dark:text-zinc-400" />
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
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              {(message.author_name ?? "?")[0]?.toUpperCase()}
            </div>
          )
        )}
      </div>}

      {/* Bubble column */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
        {/* Author name */}
        {!isOwn && showAuthor && (
          <span className={`text-[11px] font-medium mb-0.5 ml-1 flex items-center gap-1 ${
            anonymous ? "text-zinc-400 dark:text-zinc-500 italic" : "text-muted-foreground"
          }`}>
            {anonymous
              ? `#${anonymousNumber ?? "?"}`
              : (message.author_name ?? "Unknown")}
            {/* Admin: reveal anonymous identity */}
            {isAdmin && anonymous && !revealedName && (
              <button
                onClick={async () => {
                  setRevealing(true);
                  try {
                    const res = await fetch(`/api/discussions/admin/reveal?userId=${message.author_id}`);
                    if (res.ok) {
                      const data = await res.json();
                      const name = data.userName ?? "Unknown";
                      const avatar = data.userAvatar ?? null;
                      onRevealIdentity?.(message.author_id, name, avatar);
                    }
                  } catch { /* silent */ }
                  setRevealing(false);
                }}
                disabled={revealing}
                className="text-[9px] text-blue-400 hover:text-blue-500 cursor-pointer opacity-0 group-hover/msg:opacity-100 transition-opacity"
              >
                {revealing ? "…" : "reveal"}
              </button>
            )}
            {isAdmin && revealedName && (
              <span className="text-[9px] text-blue-400 not-italic">({revealedName})</span>
            )}
          </span>
        )}

        {/* Reply quote — shown above the bubble when this message is a reply */}
        {replyTo && (
          <button
            type="button"
            onClick={() => onScrollToMessage?.(replyTo.id)}
            className={`flex items-center gap-1.5 mb-0.5 cursor-pointer hover:opacity-80 transition-opacity ${isOwn ? "mr-1" : "ml-1"}`}
          >
            <div className="w-0.5 h-full min-h-[20px] bg-muted-foreground/30 rounded-full shrink-0" />
            <div className="min-w-0 text-left">
              <span className="text-[10px] font-medium text-muted-foreground/70">
                {replyTo.author_name ?? "Anonymous"}
              </span>
              <p className="text-[11px] text-muted-foreground/50 truncate max-w-[200px]">
                {replyTo.body.slice(0, 60)}
              </p>
            </div>
          </button>
        )}
        {message.reply_to_id && !replyTo && (
          <div className={`text-[10px] text-muted-foreground/40 italic mb-0.5 ${isOwn ? "mr-1" : "ml-1"}`}>
            Replied to a deleted message
          </div>
        )}

        {/* Bubble content + hover toolbar in a row */}
        <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"} ${hasReactions ? "mb-2" : ""}`}>
          {/* Bubble content with reaction badge overlay */}
          <div className={`relative flex flex-col ${isOwn ? "items-end" : "items-start"} min-w-0`}>
            {(() => {
              const lines = message.body.split("\n");
              const textLines = lines.filter((l) => !isImageUrl(l));
              const imageEntries = lines.filter((l) => isImageUrl(l)).map((l) => parseImageLine(l));
              const imageUrls = imageEntries.map((e) => e.url);
              const hasText = textLines.some((l) => l.trim().length > 0);

              return (
                <>
                  {hasText && (
                    <div
                      className={`px-3.5 py-2 text-[14.5px] leading-[1.35] break-words whitespace-pre-wrap ${
                        isOwn
                          ? `${anonymous ? "bg-[#1C1C1E] dark:bg-[#2C2C2E]" : "bg-[#007AFF]"} text-white ${
                              isLastInGroup && imageUrls.length === 0
                                ? "rounded-[20px] rounded-br-[6px]"
                                : "rounded-[20px]"
                            }${isSending ? " opacity-70" : ""}`
                          : `bg-[#E9E9EB] dark:bg-[#303030] text-black dark:text-white ${
                              isLastInGroup && imageUrls.length === 0
                                ? "rounded-[20px] rounded-bl-[6px]"
                                : "rounded-[20px]"
                            }`
                      }`}
                    >
                      {textLines.join("\n")}
                    </div>
                  )}

                  {imageEntries.map((entry, i) => (
                    entry.isSensitive ? (
                      <SensitiveImageOverlay
                        key={i}
                        src={entry.url}
                        alt="Attachment"
                        onImageClick={() => setLightboxSrc(entry.url)}
                        className={`mt-1 ${
                          isLastInGroup && i === imageEntries.length - 1
                            ? isOwn ? "rounded-br-[6px]" : "rounded-bl-[6px]"
                            : ""
                        }${isSending ? " opacity-70" : ""}`}
                      />
                    ) : (
                      <img
                        key={i}
                        src={entry.url}
                        alt="Attachment"
                        onClick={() => setLightboxSrc(entry.url)}
                        className={`max-w-[240px] max-h-[320px] object-cover rounded-2xl mt-1 cursor-zoom-in ${
                          isLastInGroup && i === imageEntries.length - 1
                            ? isOwn ? "rounded-br-[6px]" : "rounded-bl-[6px]"
                            : ""
                        }${isSending ? " opacity-70" : ""}`}
                        loading="lazy"
                      />
                    )
                  ))}

                  {!hasText && imageUrls.length === 0 && (
                    <div
                      className={`px-3.5 py-2 text-[14.5px] leading-[1.35] break-words whitespace-pre-wrap ${
                        isOwn
                          ? `${anonymous ? "bg-[#1C1C1E] dark:bg-[#2C2C2E]" : "bg-[#007AFF]"} text-white rounded-[20px] rounded-br-[6px]${isSending ? " opacity-70" : ""}`
                          : "bg-[#E9E9EB] dark:bg-[#303030] text-black dark:text-white rounded-[20px] rounded-bl-[6px]"
                      }`}
                    >
                      {message.body}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Compact reaction badge — overlaps the bottom corner of the bubble */}
            {hasReactions && (
              <div
                className={`absolute -bottom-2 flex items-center gap-[2px] px-1 py-[1px] rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 ${
                  isOwn ? "right-1" : "left-1"
                }`}
              >
                {reactions.slice(0, 3).map(({ emoji }) => (
                  <span key={emoji} className="text-[9px] leading-none">{emoji}</span>
                ))}
                {totalReactionCount > 1 && (
                  <span className="text-[9px] font-medium text-muted-foreground leading-none ml-[1px]">
                    {totalReactionCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hover toolbar — react, reply, more (unsend) */}
          {!isSending && (
            <div
              className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
                showMenu || showReactPicker ? "opacity-100" : "opacity-0 group-hover/msg:opacity-100"
              }`}
            >
              {/* React button with tapback picker */}
              <div className="relative" ref={reactPickerRef}>
                <button
                  onClick={() => setShowReactPicker((v) => !v)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-all cursor-pointer"
                  aria-label="React"
                >
                  <Smile size={14} />
                </button>
                {showReactPicker && (
                  <div className={`absolute bottom-8 z-30 bg-popover border border-border rounded-full shadow-lg px-1.5 py-1 flex items-center gap-0.5 ${
                    isOwn ? "right-0" : "left-0"
                  }`}>
                    {TAPBACK_EMOJI.map((emoji) => {
                      const isActive = myReactions.has(emoji);
                      return (
                        <button
                          key={emoji}
                          onClick={() => {
                            onToggleReaction?.(emoji);
                            setShowReactPicker(false);
                          }}
                          aria-label={`React with ${emoji}`}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-base ${
                            isActive
                              ? "bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700"
                              : "hover:bg-muted"
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => onReply?.(message)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-all cursor-pointer"
                aria-label="Reply"
              >
                <CornerUpLeft size={14} />
              </button>

              {((isOwn && onDelete) || (!isOwn && onReport)) && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu((v) => !v)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-all cursor-pointer"
                    aria-label="More options"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {showMenu && (
                    <div className="absolute top-7 right-0 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                      {isOwn && onDelete && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onDelete(message.id);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-red-500 hover:bg-accent transition-colors cursor-pointer"
                        >
                          <Undo2 size={13} />
                          Unsend
                        </button>
                      )}
                      {!isOwn && onReport && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onReport(message.id);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-red-500 hover:bg-accent transition-colors cursor-pointer"
                        >
                          <Flag size={13} />
                          Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delivery status */}
        {showStatus && (
          <span className={`flex items-center gap-1 text-[10px] mt-0.5 ${isOwn ? "mr-1" : "ml-1"} ${
            isFailed ? "text-red-400" : "text-muted-foreground/60"
          }`}>
            {isOwn && anonymous && (
              <EyeOff size={10} className="text-muted-foreground/50" />
            )}
            {isOwn && anonymous
              ? (isSending ? "Anonymous · Sending…" : isFailed ? "Anonymous · Failed" : "Anonymous · Delivered")
              : (isSending ? "Sending…" : isFailed ? "Failed" : "Delivered")
            }
          </span>
        )}
      </div>

      {/* Image lightbox overlay */}
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
