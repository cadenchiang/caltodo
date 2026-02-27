"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ChatMessage } from "@/lib/types";
import type { ReactionsMap } from "@/hooks/useMessageReactions";
import type { TypingUser } from "@/hooks/useTypingIndicator";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import DateSeparator from "./DateSeparator";
import TypingIndicator from "./TypingIndicator";
import { ChevronDown, X } from "lucide-react";

/**
 * Full-height iMessage-style chat view with scrollable messages and input.
 * Auto-scrolls to bottom for new messages when user is near bottom.
 * Shows centered timestamps between message groups when there's a 15+ min gap.
 * Last own message shows "Delivered" status.
 *
 * @param messages - Array of chat messages (oldest first)
 * @param loading - Whether initial data is loading
 * @param hasMore - Whether older messages exist for pagination
 * @param sending - Whether a message is being sent
 * @param error - Error message to display
 * @param currentUserId - The logged-in user's ID
 * @param onSend - Callback to send a new message
 * @param onDelete - Callback to unsend a message
 * @param onLoadMore - Callback to load older messages
 */
interface ChatViewProps {
  messages: ChatMessage[];
  loading: boolean;
  hasMore: boolean;
  initialFetchDone: boolean;
  sending: boolean;
  error: string | null;
  currentUserId: string;
  /** Whether the current user is an admin (can reveal anonymous identities). */
  isAdmin?: boolean;
  reactionsMap?: ReactionsMap;
  onSend: (body: string, files?: File[], anonymous?: boolean, replyToId?: string) => void;
  onDelete: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string, userId: string) => void;
  onLoadMore: () => void;
  /** Users currently typing in this channel (self excluded). */
  typingUsers?: TypingUser[];
  /** Called on each keystroke in the input to signal typing presence. */
  onTyping?: () => void;
  /** Called after a message is sent to immediately clear typing state. */
  onSendComplete?: () => void;
}

/**
 * Checks if two dates fall on the same calendar day.
 *
 * @param a - First ISO date string
 * @param b - Second ISO date string
 * @returns true if both dates are on the same day
 */
function sameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/** Minimum time gap (ms) between messages to show a centered timestamp. */
const TIMESTAMP_GAP = 15 * 60 * 1000;

export default function ChatView({
  messages,
  loading,
  hasMore,
  initialFetchDone,
  sending,
  error,
  currentUserId,
  isAdmin,
  onSend,
  onDelete,
  onToggleReaction,
  onLoadMore,
  reactionsMap,
  typingUsers,
  onTyping,
  onSendComplete,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  /** Map of anonymous userId → revealed identity. Shared across all MessageBubbles. */
  const [revealedIdentities, setRevealedIdentities] = useState<Map<string, { name: string; avatar: string | null }>>(new Map());
  const prevMessageCountRef = useRef(0);
  const isNearBottomRef = useRef(true);
  /** Tracks the first message ID to detect when the chat is switched (full replace vs append). */
  const prevFirstMessageIdRef = useRef<string | null>(null);

  /**
   * Checks if the scroll position is near the bottom (within 100px).
   */
  const checkNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  /**
   * Scrolls to the bottom of the message list.
   */
  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (el) {
      if (smooth) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }
    setNewMessageCount(0);
  }, []);

  // Reset stale count when switching chats (messages array fully replaced)
  useEffect(() => {
    const firstId = messages.length > 0 ? messages[0].id : null;
    if (prevFirstMessageIdRef.current !== null && firstId !== prevFirstMessageIdRef.current) {
      setNewMessageCount(0);
      setShowScrollBtn(false);
      isNearBottomRef.current = true;
      prevMessageCountRef.current = messages.length;
      hasInitialScrolled.current = false;
    }
    prevFirstMessageIdRef.current = firstId;
  }, [messages]);

  // Auto-scroll on new messages when near bottom
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const newCount = messages.length - prevMessageCountRef.current;
      if (isNearBottomRef.current) {
        // Double rAF ensures DOM has fully laid out the new message before scrolling
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToBottom(true)));
      } else {
        setNewMessageCount((prev) => prev + newCount);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Auto-scroll when content height grows (e.g. images loading, typing indicator)
  // while locked to bottom. Uses smooth scroll for a subtle feel.
  const prevScrollHeightRef = useRef(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const newHeight = el.scrollHeight;
      if (newHeight > prevScrollHeightRef.current && isNearBottomRef.current) {
        el.scrollTo({ top: newHeight, behavior: "smooth" });
      }
      prevScrollHeightRef.current = newHeight;
    });

    // Observe all children so images, typing indicator, etc. trigger re-check
    for (const child of Array.from(el.children)) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, [messages.length]);

  // Dynamically size the bottom padding to match the bottom bar's actual height.
  // Adapts automatically when the input grows (multi-line, attachments, reply bar).
  const [bottomBarHeight, setBottomBarHeight] = useState(72);
  useEffect(() => {
    const barEl = bottomBarRef.current;
    if (!barEl) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        setBottomBarHeight(height);
      }
    });

    observer.observe(barEl);
    return () => observer.disconnect();
  }, []);

  // Initial scroll to bottom — only once when loading finishes
  const hasInitialScrolled = useRef(false);
  useEffect(() => {
    if (!loading && messages.length > 0 && !hasInitialScrolled.current) {
      hasInitialScrolled.current = true;
      scrollToBottom();
    }
  }, [loading, scrollToBottom, messages.length]);

  /**
   * Scrolls to a specific message by ID with smooth animation and flash highlight.
   *
   * @param messageId - The UUID of the message to scroll to
   */
  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Flash highlight
    el.style.backgroundColor = "rgba(0, 122, 255, 0.1)";
    setTimeout(() => { el.style.backgroundColor = ""; }, 1500);
  }, []);

  /**
   * Records a revealed anonymous identity so all messages from that user update.
   *
   * @param userId - The anonymous user's auth ID
   * @param name - Their real display name
   * @param avatar - Their avatar URL (or null)
   */
  const onRevealIdentity = useCallback((userId: string, name: string, avatar: string | null) => {
    setRevealedIdentities((prev) => {
      const next = new Map(prev);
      next.set(userId, { name, avatar });
      return next;
    });
  }, []);

  /**
   * Reports another user's message to admins via the API.
   * Shows confirmation/error via window.alert (lightweight, no toast dependency).
   *
   * @param messageId - The ID of the message being reported
   */
  const handleReport = useCallback(async (messageId: string) => {
    const confirmed = window.confirm("Report this message to admins?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/discussions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      if (res.ok) {
        window.alert("Report submitted. An admin will review this message.");
      } else {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        window.alert(data.error ?? "Failed to submit report.");
      }
    } catch {
      window.alert("Network error. Please try again.");
    }
  }, []);

  /**
   * Handles scroll events to track position and trigger pagination.
   */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottomRef.current = checkNearBottom();
    if (isNearBottomRef.current) {
      setNewMessageCount(0);
      setShowScrollBtn(false);
    } else {
      setShowScrollBtn(true);
    }
    if (el.scrollTop < 100 && hasMore) {
      onLoadMore();
    }
  }, [checkNearBottom, hasMore, onLoadMore]);

  /**
   * Maps anonymous author_id → sequential number (order of first appearance).
   * Only includes authors who sent at least one anonymous message.
   */
  const anonymousNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let counter = 0;
    for (const msg of messages) {
      if (!msg.author_name && !msg._systemText && !map.has(msg.author_id)) {
        counter += 1;
        map.set(msg.author_id, counter);
      }
    }
    return map;
  }, [messages]);

  /**
   * Merges consecutive "X unsent a message" system events from the same author
   * into a single "X unsent N messages" entry for cleaner display.
   */
  const displayMessages = useMemo(() => {
    const result: ChatMessage[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg._systemText && msg._systemText.endsWith("unsent a message")) {
        // Count consecutive unsend events from the same author
        let count = 1;
        const authorPrefix = msg._systemText.replace(" unsent a message", "");
        while (
          i + count < messages.length &&
          messages[i + count]._systemText === msg._systemText
        ) {
          count++;
        }
        if (count > 1) {
          // Create a merged event using the first message's ID
          result.push({
            ...msg,
            _systemText: `${authorPrefix} unsent ${count} messages`,
          });
          i += count - 1; // skip the merged messages
        } else {
          result.push(msg);
        }
      } else {
        result.push(msg);
      }
    }
    return result;
  }, [messages]);

  /**
   * Pre-computes layout data for each message:
   * - showTimestamp: whether to show a centered timestamp before this message
   * - showAuthor: whether to show the author name/avatar
   * - isLastInGroup: whether this is the last message before a visual break
   * - isLastMessage: whether this is the very last non-system message
   */
  const messageLayout = useMemo(() => {
    const layout: Array<{
      showTimestamp: boolean;
      showAuthor: boolean;
      isLastInGroup: boolean;
      isLastMessage: boolean;
    }> = [];

    // Find index of last non-system message
    let lastNonSystemIdx = -1;
    for (let i = displayMessages.length - 1; i >= 0; i--) {
      if (!displayMessages[i]._systemText) { lastNonSystemIdx = i; break; }
    }

    for (let i = 0; i < displayMessages.length; i++) {
      const msg = displayMessages[i];

      // System events get default layout (not rendered via MessageBubble)
      if (msg._systemText) {
        layout.push({ showTimestamp: false, showAuthor: false, isLastInGroup: false, isLastMessage: false });
        continue;
      }

      // Find previous non-system message
      let prevNS: ChatMessage | null = null;
      for (let j = i - 1; j >= 0; j--) {
        if (!displayMessages[j]._systemText) { prevNS = displayMessages[j]; break; }
      }

      // Find next non-system message
      let nextNS: ChatMessage | null = null;
      for (let j = i + 1; j < displayMessages.length; j++) {
        if (!displayMessages[j]._systemText) { nextNS = displayMessages[j]; break; }
      }

      // Show timestamp if: first message, different day, or gap >= 15 min
      const dayChanged = !prevNS || !sameDay(prevNS.created_at, msg.created_at);
      const timeGap = prevNS
        ? new Date(msg.created_at).getTime() - new Date(prevNS.created_at).getTime()
        : Infinity;
      const showTimestamp = dayChanged || timeGap >= TIMESTAMP_GAP;

      // Show author if: timestamp break or different author
      const showAuthor = !prevNS || showTimestamp || prevNS.author_id !== msg.author_id;

      // Last in group if: no next message, next has timestamp, or different author
      const nextDayChanged = !nextNS || !sameDay(msg.created_at, nextNS.created_at);
      const nextTimeGap = nextNS
        ? new Date(nextNS.created_at).getTime() - new Date(msg.created_at).getTime()
        : Infinity;
      const nextHasTimestamp = nextDayChanged || nextTimeGap >= TIMESTAMP_GAP;
      const isLastInGroup = !nextNS || nextHasTimestamp || nextNS.author_id !== msg.author_id;

      layout.push({
        showTimestamp,
        showAuthor,
        isLastInGroup,
        isLastMessage: i === lastNonSystemIdx,
      });
    }

    return layout;
  }, [displayMessages]);

  // Loading skeleton
  if (loading && messages.length === 0) {
    return (
      <div className="relative h-full overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto p-4 space-y-4 pb-24">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex gap-2 animate-pulse ${i % 3 === 0 ? "flex-row-reverse" : ""}`}
            >
              <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
              <div
                className={`rounded-2xl bg-muted ${
                  i % 3 === 0 ? "w-40" : i % 2 === 0 ? "w-52" : "w-32"
                } h-9`}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <ChatInput onSend={() => {}} disabled />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Message area — fills full height; paddingBottom keeps last messages above the glass input */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto px-3 pt-3 pb-0 scroll-smooth"
      >
        <div className="flex flex-col">

        {/* Chat creation date — always visible at top */}
        <div className="flex justify-center py-4 h-[44px]">
          {!hasMore && (
            <span className="text-[11px] text-muted-foreground">
              {new Date(
                messages.length > 0 ? messages[0].created_at : Date.now()
              ).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Messages with timestamp separators and grouping */}
        {displayMessages.map((msg, i) => {
          // System events (unsend notice, join/leave) — render as centered label
          if (msg._systemText) {
            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className="flex justify-center py-2"
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 32px" }}
              >
                <span className="text-[11px] text-muted-foreground/60 italic">
                  {msg._systemText}
                </span>
              </div>
            );
          }

          const { showTimestamp, showAuthor, isLastInGroup, isLastMessage } = messageLayout[i];
          const isOwn = msg.author_id === currentUserId;

          return (
            <div key={msg.id} id={`msg-${msg.id}`} className="transition-colors duration-500 rounded-lg">
              {showTimestamp && <DateSeparator date={msg.created_at} />}
              <MessageBubble
                message={msg}
                isOwn={isOwn}
                showAuthor={showAuthor}
                isLastInGroup={isLastInGroup}
                isLastMessage={isLastMessage}
                anonymousNumber={!msg.author_name ? anonymousNumberMap.get(msg.author_id) : undefined}
                reactions={reactionsMap?.get(msg.id)}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                revealedIdentity={revealedIdentities.get(msg.author_id)}
                onRevealIdentity={onRevealIdentity}
                replyTo={msg.reply_to_id ? messages.find((m) => m.id === msg.reply_to_id) ?? null : null}
                onDelete={isOwn ? onDelete : undefined}
                onReport={!isOwn ? handleReport : undefined}
                onReply={setReplyTarget}
                onToggleReaction={onToggleReaction ? (emoji) => onToggleReaction(msg.id, emoji, currentUserId) : undefined}
                onScrollToMessage={scrollToMessage}
              />
            </div>
          );
        })}

        {/* Typing indicator — inside scroll area, below the last message */}
        <TypingIndicator typingUsers={typingUsers ?? []} />
        </div>

        {/* Spacer — guarantees messages never overlap the input bar.
            Uses max of measured height and 100px floor so it works even before ResizeObserver fires. */}
        <div style={{ height: Math.max(bottomBarHeight + 20, 100) }} />
      </div>

      {/* Scroll-to-bottom button — appears when scrolled up */}
      {showScrollBtn && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5" style={{ bottom: bottomBarHeight + 12 }}>
          <button
            onClick={() => scrollToBottom(true)}
            className={`px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 text-muted-foreground border border-black/10 dark:border-white/10 shadow-sm text-[11px] font-normal whitespace-nowrap transition-all duration-300 ease-out cursor-pointer ${newMessageCount > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
          >
            {newMessageCount === 1 ? "1 new message" : `${newMessageCount} new messages`}
          </button>
          <button
            onClick={() => scrollToBottom(true)}
            className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/15 shadow-md flex items-center justify-center text-muted-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            aria-label="Scroll to bottom"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      )}

      {/* Glass bottom bar: typing indicator + reply + input — overlays scroll area */}
      <div ref={bottomBarRef} className="absolute bottom-0 left-0 right-0 z-10">
        {/* Reply preview bar */}
        {replyTarget && (
          <div className="flex items-center gap-2 px-5 py-2 border-t border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-xl">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground">
                Replying to {replyTarget.author_name ?? "Anonymous"}
              </span>
              <p className="text-[12px] text-muted-foreground/70 truncate">
                {replyTarget.body.slice(0, 80)}
              </p>
            </div>
            <button
              onClick={() => setReplyTarget(null)}
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors cursor-pointer shrink-0"
              aria-label="Cancel reply"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Input */}
        <ChatInput
          onSend={(body, files, anonymous) => {
            onSend(body, files, anonymous, replyTarget?.id);
            setReplyTarget(null);
            onSendComplete?.();
          }}
          disabled={sending}
          error={error}
          onTyping={onTyping}
        />
      </div>
    </div>
  );
}
