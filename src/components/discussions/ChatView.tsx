"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ChatMessage } from "@/lib/types";
import type { ReactionsMap } from "@/hooks/useMessageReactions";
import type { TypingUser } from "@/hooks/useTypingIndicator";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import DateSeparator from "./DateSeparator";
import TypingIndicator from "./TypingIndicator";
import UnsendConfirmModal from "./UnsendConfirmModal";
import ReactionsDetailModal, { type ReactionDetail } from "./ReactionsDetailModal";
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
  /** Message ID pending unsend confirmation (null = modal closed). */
  const [unsendTargetId, setUnsendTargetId] = useState<string | null>(null);
  /** Message ID whose reactions detail modal is open (null = closed). */
  const [reactionDetailMessageId, setReactionDetailMessageId] = useState<string | null>(null);
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
  // Observe the scroll container once (empty deps) — observing all children
  // and recreating on every messages.length change wasted observers and CPU.
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

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Initial scroll to bottom — runs synchronously before paint so the user
  // never sees the list at the top. The scroll container is visibility:hidden
  // until this fires, then revealed. Tracks the first-message id so that
  // switching chats re-anchors to the bottom of the new conversation.
  const anchoredFirstMsgIdRef = useRef<string | null>(null);
  const [scrollReady, setScrollReady] = useState(false);
  useLayoutEffect(() => {
    const firstId = messages[0]?.id ?? null;
    if (messages.length === 0) {
      anchoredFirstMsgIdRef.current = null;
      setScrollReady(false);
      return;
    }
    if (anchoredFirstMsgIdRef.current !== firstId && scrollRef.current) {
      anchoredFirstMsgIdRef.current = firstId;
      // Force instant (non-smooth) anchoring so the container doesn't visibly
      // scroll from top to bottom when the scroll-smooth class is active.
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "instant" as ScrollBehavior });
      setScrollReady(true);
    }
  }, [messages]);

  // After the initial API fetch completes, re-anchor to bottom in case
  // server returned different message count than cache.
  useLayoutEffect(() => {
    if (initialFetchDone && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "instant" as ScrollBehavior });
    }
  }, [initialFetchDone]);

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
   * Opens the unsend confirmation modal for a given message.
   *
   * @param messageId - The ID of the message the user wants to unsend
   */
  const handleUnsendRequest = useCallback((messageId: string) => {
    setUnsendTargetId(messageId);
  }, []);

  /**
   * Confirms the unsend action — deletes the message and closes the modal.
   */
  const handleUnsendConfirm = useCallback(() => {
    if (unsendTargetId) {
      onDelete(unsendTargetId);
    }
    setUnsendTargetId(null);
  }, [unsendTargetId, onDelete]);

  /**
   * Cancels the unsend action and closes the modal.
   */
  const handleUnsendCancel = useCallback(() => {
    setUnsendTargetId(null);
  }, []);

  /**
   * Opens the reactions detail modal for a message.
   *
   * @param messageId - The ID of the message whose reactions to display
   */
  const handleViewReactions = useCallback((messageId: string) => {
    setReactionDetailMessageId(messageId);
  }, []);

  /**
   * Builds a lookup map of userId → { name, avatar } from all messages.
   * Used to display reactor names in the reactions detail modal.
   * Users who only sent anonymous messages won't have entries.
   */
  const userInfoMap = useMemo(() => {
    const map = new Map<string, { name: string | null; avatar: string | null }>();
    for (const msg of messages) {
      if (msg.author_name && !map.has(msg.author_id)) {
        map.set(msg.author_id, { name: msg.author_name, avatar: msg.author_avatar ?? null });
      }
    }
    return map;
  }, [messages]);

  /**
   * Flat list of reaction details for the currently open reactions modal.
   * Resolves user IDs to names/avatars via userInfoMap.
   */
  const reactionDetails: ReactionDetail[] = useMemo(() => {
    if (!reactionDetailMessageId || !reactionsMap) return [];
    const groups = reactionsMap.get(reactionDetailMessageId) ?? [];
    const details: ReactionDetail[] = [];
    for (const group of groups) {
      for (const userId of group.userIds) {
        const info = userInfoMap.get(userId);
        details.push({
          userId,
          emoji: group.emoji,
          userName: info?.name ?? null,
          userAvatar: info?.avatar ?? null,
        });
      }
    }
    return details;
  }, [reactionDetailMessageId, reactionsMap, userInfoMap]);

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
   * O(1) lookup map for reply targets. Replaces an O(N) messages.find() that
   * ran once per rendered bubble — turning every message-list render into
   * O(N²). Built once per messages array reference.
   */
  const messagesById = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

  /**
   * Stable handler the memoized MessageBubble can receive without breaking
   * memo equality. MessageBubble passes (messageId, emoji) — we close over
   * currentUserId here so the bubble's prop reference stays stable across
   * renders that don't change toggle dependencies.
   */
  const handleToggleReactionStable = useCallback(
    (messageId: string, emoji: string) => {
      onToggleReaction?.(messageId, emoji, currentUserId);
    },
    [onToggleReaction, currentUserId],
  );

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
   * Pre-computes layout data for each message in O(N):
   *  - showTimestamp / showAuthor — derived from a single forward pass that
   *    tracks the previous non-system message.
   *  - isLastInGroup — derived from a single backward pass that tracks the
   *    next non-system message.
   *  - isLastMessage — the last non-system index, recorded during the back pass.
   *
   * The previous version did nested scans per message (O(N²)) and called
   * `new Date(...)` four times per pair, which became noticeable after the
   * user loaded older messages via loadMore.
   */
  const messageLayout = useMemo(() => {
    const n = displayMessages.length;
    const layout: Array<{
      showTimestamp: boolean;
      showAuthor: boolean;
      isLastInGroup: boolean;
      isLastMessage: boolean;
    }> = new Array(n);

    // Cache parsed timestamps so we never construct the same Date twice.
    const times = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      times[i] = displayMessages[i]._systemText
        ? 0
        : Date.parse(displayMessages[i].created_at);
    }

    // Forward pass: showTimestamp + showAuthor (need prev non-system message).
    let prevIdx = -1;
    for (let i = 0; i < n; i++) {
      const msg = displayMessages[i];
      if (msg._systemText) {
        layout[i] = { showTimestamp: false, showAuthor: false, isLastInGroup: false, isLastMessage: false };
        continue;
      }
      const prev = prevIdx >= 0 ? displayMessages[prevIdx] : null;
      const dayChanged = !prev || !sameDay(prev.created_at, msg.created_at);
      const timeGap = prev ? times[i] - times[prevIdx] : Infinity;
      const showTimestamp = dayChanged || timeGap >= TIMESTAMP_GAP;
      const showAuthor = !prev || showTimestamp || prev.author_id !== msg.author_id;
      layout[i] = { showTimestamp, showAuthor, isLastInGroup: false, isLastMessage: false };
      prevIdx = i;
    }

    // Backward pass: isLastInGroup + isLastMessage (need next non-system message).
    let nextIdx = -1;
    let lastNonSystemIdx = -1;
    for (let i = n - 1; i >= 0; i--) {
      const msg = displayMessages[i];
      if (msg._systemText) continue;
      if (lastNonSystemIdx === -1) lastNonSystemIdx = i;
      const next = nextIdx >= 0 ? displayMessages[nextIdx] : null;
      const nextDayChanged = !next || !sameDay(msg.created_at, next.created_at);
      const nextTimeGap = next ? times[nextIdx] - times[i] : Infinity;
      const nextHasTimestamp = nextDayChanged || nextTimeGap >= TIMESTAMP_GAP;
      const isLastInGroup = !next || nextHasTimestamp || next.author_id !== msg.author_id;
      layout[i] = {
        ...layout[i],
        isLastInGroup,
        isLastMessage: i === lastNonSystemIdx,
      };
      nextIdx = i;
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
        style={{ visibility: scrollReady || messages.length === 0 ? "visible" : "hidden" }}
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
                role="status"
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
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className="transition-colors duration-500 rounded-lg"
              // content-visibility lets the browser skip layout + paint for
              // off-screen bubbles (the closest CSS-native equivalent to the
              // cell-reuse pattern iMessage gets from UICollectionView).
              // containIntrinsicSize reserves vertical space so scrollbar
              // height stays correct before a bubble has been painted.
              style={{ contentVisibility: "auto", containIntrinsicSize: "auto 60px" }}
            >
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
                replyTo={msg.reply_to_id ? messagesById.get(msg.reply_to_id) ?? null : null}
                onDelete={isOwn ? handleUnsendRequest : undefined}
                onReport={!isOwn ? handleReport : undefined}
                onReply={setReplyTarget}
                onToggleReaction={onToggleReaction ? handleToggleReactionStable : undefined}
                onViewReactions={handleViewReactions}
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

      {/* Glass bottom bar: typing indicator + input — overlays scroll area.
          Hidden in reply mode; the reply modal renders its own input below. */}
      {!replyTarget && (
        <div ref={bottomBarRef} className="absolute bottom-0 left-0 right-0 z-10">
          <ChatInput
            onSend={(body, files, anonymous) => {
              onSend(body, files, anonymous);
              onSendComplete?.();
            }}
            disabled={sending}
            error={error}
            onTyping={onTyping}
          />
        </div>
      )}

      {/* Reply mode: backdrop + highlighted message + dedicated input.
          Click backdrop to dismiss. Backdrop blocks scroll on the chat below. */}
      {replyTarget && (
        <div
          className="absolute inset-0 z-30 flex flex-col justify-center items-center px-4 bg-black/30 dark:bg-black/50 backdrop-blur-md"
          onClick={() => setReplyTarget(null)}
          role="dialog"
          aria-label="Reply to message"
        >
          {/* Highlighted target message — stop click propagation so clicks
              inside the bubble don't dismiss the modal */}
          <div
            className="max-w-md w-full mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <span className="text-[11px] font-medium text-white/80">
                Replying to {replyTarget.author_name ?? "Anonymous"}
              </span>
            </div>
            <div className="rounded-2xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-xl ring-1 ring-white/30 dark:ring-white/10">
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                {replyTarget.body}
              </p>
            </div>
          </div>

          {/* Reply composer */}
          <div
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatInput
              onSend={(body, files, anonymous) => {
                onSend(body, files, anonymous, replyTarget.id);
                setReplyTarget(null);
                onSendComplete?.();
              }}
              disabled={sending}
              error={error}
              onTyping={onTyping}
            />
          </div>
        </div>
      )}

      {/* Unsend confirmation modal */}
      <UnsendConfirmModal
        open={unsendTargetId !== null}
        onConfirm={handleUnsendConfirm}
        onCancel={handleUnsendCancel}
      />

      {/* Reactions detail modal */}
      <ReactionsDetailModal
        open={reactionDetailMessageId !== null}
        reactions={reactionDetails}
        onClose={() => setReactionDetailMessageId(null)}
      />
    </div>
  );
}
