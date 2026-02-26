"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, ChatPresence } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSystemEvent, fetchUserName } from "./chatSystemEvents";
import { readCache, writeCache } from "./chatCache";

const PAGE_SIZE = 50;

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
  /** Maps temporary optimistic IDs to server-assigned IDs for deduplication. */
  const tempToServerIdRef = useRef<Map<string, string>>(new Map());
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
      if (uploadError) {
        const isBucketMissing = uploadError.message?.includes("Bucket not found");
        throw new Error(
          isBucketMissing
            ? "File uploads are not configured yet. Please run 'supabase db push' to set up storage."
            : `Upload failed: ${uploadError.message}`
        );
      }
      const { data: urlData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  }, [courseId, supabase.storage]);

  /**
   * Sends a new message via the API, optionally with file attachments.
   * Uses optimistic UI: message appears instantly with "sending" status,
   * then updates to "delivered" or "failed" based on API response.
   *
   * @param body - The message text
   * @param files - Optional array of files to attach
   * @param anonymous - Whether to send the message anonymously (no name/avatar stored)
   * @param replyToId - Optional ID of the message being replied to
   */
  const sendMessage = useCallback(async (body: string, files?: File[], anonymous?: boolean, replyToId?: string) => {
    if ((!body.trim() && (!files || files.length === 0)) || sending) return;

    setSending(true);
    setError(null);

    // Generate a temporary ID for optimistic display
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      let finalBody = body.trim();

      // Upload attachments if any
      if (files && files.length > 0) {
        const urls = await uploadFiles(files);
        const attachmentText = urls.join("\n");
        finalBody = finalBody ? `${finalBody}\n${attachmentText}` : attachmentText;
      }

      // Get current user info for optimistic message
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      // Create optimistic message and append immediately
      const optimisticMsg: ChatMessage = {
        id: tempId,
        course_id: courseId,
        author_id: user?.id ?? "",
        author_name: anonymous ? null : (user?.user_metadata?.full_name ?? null),
        author_avatar: anonymous ? null : (user?.user_metadata?.avatar_url ?? null),
        body: finalBody,
        created_at: now,
        updated_at: now,
        reply_to_id: replyToId ?? null,
        _status: "sending",
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      const res = await fetch("/api/discussions/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, body: finalBody, anonymous: anonymous ?? false, replyToId: replyToId ?? undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      // API returns the created message with real ID
      const serverMsg: ChatMessage = await res.json();

      // Map tempId → serverId for Realtime deduplication
      tempToServerIdRef.current.set(tempId, serverMsg.id);

      // Replace optimistic message with server version
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...serverMsg, _status: "delivered" as const }
            : m
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);

      // Mark optimistic message as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, _status: "failed" as const } : m
        )
      );
    } finally {
      setSending(false);
    }
  }, [courseId, sending, uploadFiles, supabase.auth]);

  /**
   * Unsends a message by ID via the API and removes it from local state.
   * Shows a system event: "Name unsent a message" or "Anonymous #N unsent a message".
   *
   * @param messageId - The ID of the message to unsend
   */
  const deleteMessage = useCallback(async (messageId: string) => {
    // Compute label before removing, then remove + add system event atomically
    setMessages((prev) => {
      const msg = prev.find((m) => m.id === messageId);
      if (!msg) return prev;

      let label: string;
      if (msg.author_name) {
        label = msg.author_name;
      } else {
        // Compute anonymous number from current message order
        const anonMap = new Map<string, number>();
        let counter = 0;
        for (const m of prev) {
          if (!m.author_name && !m._systemText && !anonMap.has(m.author_id)) {
            counter++;
            anonMap.set(m.author_id, counter);
          }
        }
        const num = anonMap.get(msg.author_id);
        label = `Anonymous${num ? ` #${num}` : ""}`;
      }

      const filtered = prev.filter((m) => m.id !== messageId);
      return [...filtered, createSystemEvent(courseId, `sys-unsend-${messageId}`, `${label} unsent a message`)];
    });

    try {
      const res = await fetch("/api/discussions/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Failed to unsend message:", data.error ?? res.statusText);
        fetchMessages();
      }
    } catch (err) {
      console.error("Unsend message error:", err);
      fetchMessages();
    }
  }, [courseId, fetchMessages]);

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
          // Check if this server message matches an optimistic message
          const tempEntry = Array.from(tempToServerIdRef.current.entries())
            .find(([, serverId]) => serverId === newMsg.id);

          if (tempEntry) {
            // Already replaced by optimistic flow — skip Realtime duplicate
            tempToServerIdRef.current.delete(tempEntry[0]);
            return prev;
          }

          // Avoid duplicates from normal flow
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const updated = [...prev, newMsg];
          writeCache(courseId, updated);
          return updated;
        });
      }
    );

    // Listen for deleted messages via postgres_changes
    channel.on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "chat_messages",
        filter: `course_id=eq.${courseId}`,
      },
      (payload) => {
        const old = payload.old as ChatMessage | undefined;
        if (!old?.id) return;
        setMessages((prev) => {
          // Skip if this was our own unsend (system event already added locally)
          if (prev.some((m) => m.id === `sys-unsend-${old.id}`)) {
            return prev.filter((m) => m.id !== old.id);
          }

          let label: string;
          if (old.author_name) {
            label = old.author_name;
          } else {
            // Compute anonymous number from current messages
            const anonMap = new Map<string, number>();
            let counter = 0;
            for (const m of prev) {
              if (!m.author_name && !m._systemText && !anonMap.has(m.author_id)) {
                counter++;
                anonMap.set(m.author_id, counter);
              }
            }
            const num = old.author_id ? anonMap.get(old.author_id) : undefined;
            label = `Anonymous${num ? ` #${num}` : ""}`;
          }

          const filtered = prev.filter((m) => m.id !== old.id);
          return [...filtered, createSystemEvent(courseId, `sys-unsend-${old.id}`, `${label} unsent a message`)];
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

    // Subscribe to membership changes for join/leave system events
    const memberChannel = supabase.channel(`members:${courseId}`);

    memberChannel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "course_memberships",
        filter: `course_id=eq.${courseId}`,
      },
      async (payload) => {
        const newMember = payload.new as { user_id: string };
        const name = await fetchUserName(newMember.user_id);
        setMessages((prev) => [...prev, createSystemEvent(courseId, `sys-join-${Date.now()}`, `${name} joined the group`)]);
      }
    );

    memberChannel.on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "course_memberships",
        filter: `course_id=eq.${courseId}`,
      },
      async (payload) => {
        const old = payload.old as { user_id?: string };
        if (!old.user_id) return;
        const name = await fetchUserName(old.user_id);
        setMessages((prev) => [...prev, createSystemEvent(courseId, `sys-leave-${Date.now()}`, `${name} left the group`)]);
      }
    );

    memberChannel.subscribe();

    // Listen for local group name change events
    function handleNameChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.courseId !== courseId) return;
      setMessages((prev) => [...prev, createSystemEvent(courseId, `sys-name-${Date.now()}`, `Group name changed to "${detail.newName}"`)]);
    }
    window.addEventListener("calchat-name-changed", handleNameChange);

    return () => {
      channel.unsubscribe();
      memberChannel.unsubscribe();
      window.removeEventListener("calchat-name-changed", handleNameChange);
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
    deleteMessage,
    loadMore,
  };
}
