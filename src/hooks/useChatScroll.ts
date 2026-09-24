"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

/**
 * Scroll behaviour for the message list: bottom anchoring on open, auto
 * scroll on new messages while near the bottom, a "N new messages" count
 * otherwise, pagination when scrolled to the top, and scroll-to-message
 * for reply quotes.
 *
 * @param messages - Oldest-first messages
 * @param initialFetchDone - Whether the first server page has landed
 * @param hasMore - Whether older pages exist
 * @param onLoadMore - Loads the next older page (guarded by the caller)
 */
export function useChatScroll(
  messages: readonly ChatMessage[],
  initialFetchDone: boolean,
  hasMore: boolean,
  onLoadMore: () => void,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [bottomBarHeight, setBottomBarHeight] = useState(72);
  const [scrollReady, setScrollReady] = useState(false);
  const isNearBottomRef = useRef(true);
  const prevCountRef = useRef(0);
  const prevFirstIdRef = useRef<string | null>(null);
  const anchoredFirstIdRef = useRef<string | null>(null);
  const prevScrollHeightRef = useRef(0);

  const checkNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setNewMessageCount(0);
  }, []);

  // Reset counters when the list is replaced (room switch)
  useEffect(() => {
    const firstId = messages.length > 0 ? messages[0].id : null;
    if (prevFirstIdRef.current !== null && firstId !== prevFirstIdRef.current) {
      setNewMessageCount(0);
      setShowScrollBtn(false);
      isNearBottomRef.current = true;
      prevCountRef.current = messages.length;
    }
    prevFirstIdRef.current = firstId;
  }, [messages]);

  // Auto-scroll on append when near the bottom, else count new messages
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const added = messages.length - prevCountRef.current;
      if (isNearBottomRef.current) {
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToBottom(true)));
      } else {
        setNewMessageCount((c) => c + added);
      }
    }
    prevCountRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Follow content growth (images loading) while locked to the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const h = el.scrollHeight;
      if (h > prevScrollHeightRef.current && isNearBottomRef.current) el.scrollTo({ top: h, behavior: "smooth" });
      prevScrollHeightRef.current = h;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track the composer's height so the list never hides behind it
  useEffect(() => {
    const bar = bottomBarRef.current;
    if (!bar) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setBottomBarHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // Anchor to the bottom before paint on first content and on room switch
  useLayoutEffect(() => {
    const firstId = messages[0]?.id ?? null;
    if (messages.length === 0) {
      anchoredFirstIdRef.current = null;
      setScrollReady(false);
      return;
    }
    if (anchoredFirstIdRef.current !== firstId && scrollRef.current) {
      anchoredFirstIdRef.current = firstId;
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "instant" as ScrollBehavior });
      setScrollReady(true);
    }
  }, [messages]);

  useLayoutEffect(() => {
    if (initialFetchDone && scrollRef.current && isNearBottomRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "instant" as ScrollBehavior });
    }
  }, [initialFetchDone]);

  /** Scroll handler: tracks position, toggles the button, paginates at the top. */
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
    if (el.scrollTop < 100 && hasMore) onLoadMore();
  }, [checkNearBottom, hasMore, onLoadMore]);

  /** Scrolls to a message and flashes it. */
  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("bg-blue-500/10");
    setTimeout(() => el.classList.remove("bg-blue-500/10"), 1500);
  }, []);

  return {
    scrollRef,
    bottomBarRef,
    newMessageCount,
    showScrollBtn,
    bottomBarHeight,
    scrollReady,
    handleScroll,
    scrollToBottom,
    scrollToMessage,
  };
}
