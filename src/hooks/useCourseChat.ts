"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { readCache, writeCache, readAuthorKey, writeAuthorKey } from "./chatCache";
import { subscribeRoomEvents } from "@/lib/chat-realtime";
import { mergeIncoming, prependOlder, replaceWithFetched, removeMessage } from "@/lib/chat-message-merge";
import { friendlyChatError } from "@/lib/chat-errors";
import { AUTHOR_KEY_HEADER } from "@/lib/chat-message-shape";
import { useChatSender } from "./useChatSender";
import { useOnlineStatus } from "./useOnlineStatus";

const PAGE_SIZE = 50;

/**
 * Core hook for a course group chat.
 * Fetches history (cache first), subscribes to the room's private
 * broadcast channel for inserts and deletes, paginates with an in-flight
 * guard and id dedupe (M19), keeps the newest 200 messages in the
 * sessionStorage cache on every change (M21), and exposes the viewer's own
 * author key so the UI can tell its messages apart without author ids.
 *
 * @param courseId - The course UUID to chat in
 * @param options.initialMessages - Server-prefetched page for the initial SSR room
 * @param options.initialAuthorKey - Viewer's author key from the server page
 * @param options.currentUserId - The viewer's auth id (for upload paths)
 * @param options.currentUserName - The viewer's display name (optimistic bubbles)
 */
export function useCourseChat(
  courseId: string,
  options: {
    initialMessages?: ChatMessage[];
    initialAuthorKey?: string | null;
    currentUserId: string;
    currentUserName: string | null;
  },
) {
  const { initialMessages, initialAuthorKey, currentUserId, currentUserName } = options;
  const hasSeed = !!initialMessages && initialMessages.length > 0;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (hasSeed) writeCache(courseId, initialMessages!);
    return initialMessages ?? [];
  });
  const [loading, setLoading] = useState(!hasSeed);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(hasSeed);
  const [notMember, setNotMember] = useState(false);
  const [myAuthorKey, setMyAuthorKey] = useState<string | null>(initialAuthorKey ?? null);
  const loadingMoreRef = useRef(false);
  const prevCourseIdRef = useRef(courseId);
  /** Always the current courseId so async callbacks can detect staleness. */
  const activeCourseIdRef = useRef(courseId);
  activeCourseIdRef.current = courseId;
  const online = useOnlineStatus();

  // Synchronously reset state when the room changes (no stale frame)
  if (prevCourseIdRef.current !== courseId) {
    prevCourseIdRef.current = courseId;
    const cached = readCache(courseId);
    setMessages(cached ?? []);
    setLoading(!cached);
    setError(null);
    setHasMore(false);
    setInitialFetchDone(false);
    setNotMember(false);
    setMyAuthorKey(readAuthorKey(courseId));
  }

  /** Records the viewer's author key from a response header. */
  const noteAuthorKey = useCallback((res: Response) => {
    const key = res.headers.get(AUTHOR_KEY_HEADER);
    if (key) {
      writeAuthorKey(courseId, key);
      setMyAuthorKey(key);
    }
  }, [courseId]);

  /**
   * Fetches the latest page (stale-while-revalidate over the cache).
   * A 403 means the viewer is not (or no longer) a member.
   */
  const fetchMessages = useCallback(async () => {
    setError(null);
    const cached = readCache(courseId);
    if (cached && cached.length > 0) {
      setMessages((prev) => replaceWithFetched(prev, cached));
      setLoading(false);
    }

    try {
      const res = await fetch(`/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=${PAGE_SIZE}`);
      if (activeCourseIdRef.current !== courseId) return;
      if (res.status === 403) {
        setNotMember(true);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(friendlyChatError(res.status, data.error, "load this chat"));
      }
      noteAuthorKey(res);
      const data: ChatMessage[] = await res.json();
      if (activeCourseIdRef.current !== courseId) return;
      const sorted = [...data].reverse();
      setMessages((prev) => {
        const next = replaceWithFetched(prev, sorted);
        writeCache(courseId, next);
        return next;
      });
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err) {
      if (activeCourseIdRef.current !== courseId) return;
      setError(err instanceof Error ? err.message : friendlyChatError(0, null, "load this chat"));
    } finally {
      if (activeCourseIdRef.current === courseId) {
        setLoading(false);
        setInitialFetchDone(true);
      }
    }
  }, [courseId, noteAuthorKey]);

  /**
   * Loads the page before the earliest loaded message. Guarded so scroll
   * events cannot start a second request while one is in flight.
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || messages.length === 0 || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    const oldest = messages[0];
    try {
      const res = await fetch(
        `/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=${PAGE_SIZE}&before=${encodeURIComponent(oldest.created_at)}`,
      );
      if (!res.ok || activeCourseIdRef.current !== courseId) return;
      const data: ChatMessage[] = await res.json();
      if (activeCourseIdRef.current !== courseId) return;
      const sorted = [...data].reverse();
      setMessages((prev) => {
        const next = prependOlder(prev, sorted);
        writeCache(courseId, next);
        return next;
      });
      setHasMore(data.length >= PAGE_SIZE);
    } catch {
      setError(friendlyChatError(0, null, "load older messages"));
    } finally {
      loadingMoreRef.current = false;
    }
  }, [courseId, hasMore, messages]);

  const { sending, sendMessage, retryMessage } = useChatSender({
    courseId,
    currentUserId,
    currentUserName,
    myAuthorKey,
    setMessages,
    setError,
    onResponse: noteAuthorKey,
  });

  /**
   * Unsends a message: removes it locally, then asks the API. A failure
   * refetches so the list matches the server.
   */
  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages((prev) => {
      const next = removeMessage(prev, messageId);
      writeCache(courseId, next);
      return next;
    });
    try {
      const res = await fetch("/api/discussions/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(friendlyChatError(res.status, data.error, "unsend that message"));
        fetchMessages();
      }
    } catch {
      setError(friendlyChatError(0, null, "unsend that message"));
      fetchMessages();
    }
  }, [courseId, fetchMessages]);

  // Fetch and subscribe per room
  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeRoomEvents(courseId, {
      onInserted: (msg) => {
        if (msg.course_id !== courseId) return;
        setMessages((prev) => {
          const next = mergeIncoming(prev, msg);
          if (next !== prev) writeCache(courseId, next);
          return next;
        });
      },
      onDeleted: ({ id }) => {
        setMessages((prev) => {
          const next = removeMessage(prev, id);
          writeCache(courseId, next);
          return next;
        });
      },
    });
    return unsubscribe;
  }, [courseId, fetchMessages]);

  // Reconnect: refetch when the browser comes back online
  const wasOnlineRef = useRef(online);
  useEffect(() => {
    if (online && !wasOnlineRef.current) fetchMessages();
    wasOnlineRef.current = online;
  }, [online, fetchMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    initialFetchDone,
    sending,
    notMember,
    online,
    myAuthorKey,
    sendMessage,
    retryMessage,
    deleteMessage,
    loadMore,
    refetch: fetchMessages,
  };
}
