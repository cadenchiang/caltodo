"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatMessage } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import DateSeparator from "./DateSeparator";
import { ChevronDown } from "lucide-react";

/**
 * Full-height iMessage-style chat view with scrollable messages and input.
 * Auto-scrolls to bottom for new messages when user is near bottom.
 * Shows "New messages" pill when new messages arrive while scrolled up.
 * Groups consecutive messages by the same author within 5 minutes.
 *
 * @param messages - Array of chat messages (oldest first)
 * @param loading - Whether initial data is loading
 * @param hasMore - Whether older messages exist for pagination
 * @param sending - Whether a message is being sent
 * @param error - Error message to display
 * @param currentUserId - The logged-in user's ID
 * @param onSend - Callback to send a new message
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
  onSend: (body: string, files?: File[]) => void;
  onLoadMore: () => void;
}

/**
 * Checks if two messages are in the same date group.
 *
 * @param a - First ISO date string
 * @param b - Second ISO date string
 * @returns true if both dates fall on the same calendar day
 */
function sameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/**
 * Checks if two messages should be grouped (same author, within 5 minutes).
 *
 * @param prev - Previous message
 * @param curr - Current message
 * @returns true if messages should be grouped together
 */
function shouldGroup(prev: ChatMessage, curr: ChatMessage): boolean {
  if (prev.author_id !== curr.author_id) return false;
  const diff = new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime();
  return diff < 5 * 60 * 1000;
}

export default function ChatView({
  messages,
  loading,
  hasMore,
  initialFetchDone,
  sending,
  error,
  currentUserId,
  onSend,
  onLoadMore,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const prevMessageCountRef = useRef(0);
  const isNearBottomRef = useRef(true);

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
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
    setShowNewBadge(false);
  }, []);

  // Auto-scroll on new messages when near bottom
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      if (isNearBottomRef.current) {
        // Small delay to let DOM update
        requestAnimationFrame(() => scrollToBottom(true));
      } else {
        setShowNewBadge(true);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [loading, scrollToBottom, messages.length]);

  /**
   * Handles scroll events to track position and trigger pagination.
   */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottomRef.current = checkNearBottom();
    if (isNearBottomRef.current) {
      setShowNewBadge(false);
    }
    // Load more when scrolled near top
    if (el.scrollTop < 100 && hasMore) {
      onLoadMore();
    }
  }, [checkNearBottom, hasMore, onLoadMore]);

  // Loading skeleton
  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4">
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
        <ChatInput onSend={() => {}} disabled />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Message area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-3 scroll-smooth"
      >
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

        {/* Messages with date separators and grouping */}
        {messages.map((msg, i) => {
          const prev = i > 0 ? messages[i - 1] : null;
          const next = i < messages.length - 1 ? messages[i + 1] : null;
          const showDate = !prev || !sameDay(prev.created_at, msg.created_at);
          const isGrouped = prev ? shouldGroup(prev, msg) : false;
          const isLastInGroup = !next || !shouldGroup(msg, next);
          const isOwn = msg.author_id === currentUserId;

          return (
            <div key={msg.id}>
              {showDate && <DateSeparator date={msg.created_at} />}
              <MessageBubble
                message={msg}
                isOwn={isOwn}
                showAuthor={!isGrouped}
                isLastInGroup={isLastInGroup}
              />
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* New messages badge */}
      {showNewBadge && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#007AFF] text-white text-xs font-medium shadow-lg cursor-pointer hover:bg-[#0066D6] transition-all z-10"
        >
          <ChevronDown size={14} />
          New messages
        </button>
      )}

      {/* Input */}
      <ChatInput onSend={onSend} disabled={sending} error={error} />
    </div>
  );
}
