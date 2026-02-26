"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, ChatPresence } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

const CACHE_PREFIX = "chat_messages_cache_";
const PAGE_SIZE = 50;

/**
 * Reads cached messages for a course from sessionStorage.
 *
 * @param courseId - The course UUID
 * @returns Cached messages or null if missing/expired
 */
function readCache(courseId: string): ChatMessage[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > 5 * 60_000) return null;
    return entry.messages;
  } catch {
    return null;
  }
}

/**
 * Writes messages to sessionStorage cache.
 *
 * @param courseId - The course UUID
 * @param messages - Messages to cache
 */
function writeCache(courseId: string, messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + courseId,
      JSON.stringify({ messages: messages.slice(0, 200), timestamp: Date.now() })
    );
  } catch { /* ignore */ }
}

/**
 * Core hook for course group chat.
 * Fetches message history, subscribes to Realtime for live messages,
 * tracks Presence for online users, and provides sendMessage/loadMore.
 *
 * @param courseId - The course UUID to chat in
 * @returns Messages, online users, loading state, and action functions
 */
export function useCourseChat(courseId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ChatPresence[]>([]);
  const [sending, setSending] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const prevCourseIdRef = useRef(courseId);
  const supabase = createClient();

  // Synchronously reset state when courseId changes (prevents stale frame)
  if (prevCourseIdRef.current !== courseId) {
    prevCourseIdRef.current = courseId;
    const cached = readCache(courseId);
    if (cached && cached.length > 0) {
      setMessages(cached);
      setLoading(false);
    } else {
      setMessages([]);
      setLoading(true);
    }
    setError(null);
    setHasMore(false);
    setOnlineUsers([]);
    setInitialFetchDone(false);
  }

  /**
   * Fetches initial message history from the API.
   * Shows cached data first (stale-while-revalidate).
   */
  const fetchMessages = useCallback(async () => {
    setError(null);

    // Show cached data first
    const cached = readCache(courseId);
    if (cached && cached.length > 0) {
      setMessages(cached);
      setLoading(false);
    }

    try {
      const res = await fetch(
        `/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=${PAGE_SIZE}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch messages (${res.status})`);
      }
      const data: ChatMessage[] = await res.json();
      // API returns newest first; reverse for display (oldest at top)
      const sorted = [...data].reverse();
      setMessages(sorted);
      writeCache(courseId, sorted);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
      setInitialFetchDone(true);
    }
  }, [courseId]);

  /**
   * Loads older messages before the earliest current message.
   * Prepends to existing messages array.
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || messages.length === 0) return;

    const oldest = messages[0];
    try {
      const res = await fetch(
        `/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=${PAGE_SIZE}&before=${encodeURIComponent(oldest.created_at)}`
      );
      if (!res.ok) return;
      const data: ChatMessage[] = await res.json();
      const sorted = [...data].reverse();
      setMessages((prev) => {
        const updated = [...sorted, ...prev];
        writeCache(courseId, updated);
        return updated;
      });
      setHasMore(data.length >= PAGE_SIZE);
    } catch {
      // Silent failure for pagination
    }
  }, [courseId, hasMore, messages]);

  /**
   * Uploads files to Supabase Storage and returns their public URLs.
   *
   * @param files - Array of File objects to upload
   * @returns Array of public URLs for the uploaded files
   */
  const uploadFiles = useCallback(async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${courseId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      const { data: urlData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  }, [courseId, supabase.storage]);

  /**
   * Sends a new message via the API, optionally with file attachments.
   * Files are uploaded to Supabase Storage, URLs appended to message body.
   *
   * @param body - The message text
   * @param files - Optional array of files to attach
   */
  const sendMessage = useCallback(async (body: string, files?: File[]) => {
    if ((!body.trim() && (!files || files.length === 0)) || sending) return;

    setSending(true);
    setError(null);

    try {
      let finalBody = body.trim();

      // Upload attachments if any
      if (files && files.length > 0) {
        const urls = await uploadFiles(files);
        const attachmentText = urls.join("\n");
        finalBody = finalBody ? `${finalBody}\n${attachmentText}` : attachmentText;
      }

      const res = await fetch("/api/discussions/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, body: finalBody }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }
      // Message will arrive via Realtime subscription
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setSending(false);
    }
  }, [courseId, sending, uploadFiles]);

  // Subscribe to Realtime for new messages and presence
  useEffect(() => {
    fetchMessages();

    const channel = supabase.channel(`chat:${courseId}`, {
      config: { presence: { key: "user_id" } },
    });

    // Listen for new messages via postgres_changes
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `course_id=eq.${courseId}`,
      },
      (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const updated = [...prev, newMsg];
          writeCache(courseId, updated);
          return updated;
        });
      }
    );

    // Track presence
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<ChatPresence>();
      const users: ChatPresence[] = [];
      for (const key of Object.keys(state)) {
        const presences = state[key];
        if (presences && presences.length > 0) {
          users.push(presences[0]);
        }
      }
      setOnlineUsers(users);
    });

    // Join channel and track own presence
    async function joinPresence() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await channel.subscribe();
        await channel.track({
          user_id: user.id,
          user_name: user.user_metadata?.full_name ?? null,
          user_avatar: user.user_metadata?.avatar_url ?? null,
          online_at: new Date().toISOString(),
        });
      } else {
        await channel.subscribe();
      }
    }

    joinPresence();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    initialFetchDone,
    onlineUsers,
    sending,
    sendMessage,
    loadMore,
  };
}
