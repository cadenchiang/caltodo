"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSystemEvent, fetchUserName } from "./chatSystemEvents";
import { readCache, writeCache } from "./chatCache";
import { obfuscateAuthorId } from "@/lib/author-obfuscate";
import { compressImage } from "@/lib/compress-image";
import { classifyImage } from "@/lib/nsfw-check";
import { playMessageSent } from "@/lib/sounds";

const PAGE_SIZE = 50;

/**
 * Core hook for course group chat.
 * Fetches message history, subscribes to Realtime for live messages,
 * tracks Presence for online users, and provides sendMessage/loadMore.
 *
 * @param courseId - The course UUID to chat in
 * @returns Messages, online users, loading state, and action functions
 */
/** Interval for flushing batched join events in system courses. */
const JOIN_BATCH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export function useCourseChat(courseId: string, options?: { isSystemCourse?: boolean; isAdmin?: boolean }) {
  const isSystemCourse = options?.isSystemCourse ?? false;
  const isAdminUser = options?.isAdmin ?? false;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [spamCooldownEnd, setSpamCooldownEnd] = useState<number>(0);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCourseIdRef = useRef(courseId);
  /** Accumulates join names for system courses to batch into one notification. */
  const pendingJoinsRef = useRef<string[]>([]);
  const joinTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
      // Merge: preserve any in-flight optimistic messages (temp-ID) so they
      // don't vanish when the server fetch returns before the send completes.
      setMessages((prev) => {
        const optimistic = prev.filter((m) => m.id.startsWith("temp-"));
        if (optimistic.length === 0) return sorted;
        return [...sorted, ...optimistic];
      });
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
      const processedFile = await compressImage(file);

      // Classify image files for NSFW content before upload
      let isSensitive = false;
      if (processedFile.type.startsWith("image/")) {
        const result = await classifyImage(processedFile);
        isSensitive = result.isSensitive;
      }

      const ext = processedFile.name.split(".").pop() ?? "bin";
      const path = `${courseId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(path, processedFile, { cacheControl: "3600", upsert: false });
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
      // Prefix sensitive image URLs with [sensitive] marker
      const publicUrl = isSensitive
        ? `[sensitive]${urlData.publicUrl}`
        : urlData.publicUrl;
      urls.push(publicUrl);
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
      playMessageSent();

      // Register pending sentinel so the Realtime handler can detect
      // that this tempId is awaiting a server ID, even if the INSERT
      // event fires before the API response arrives.
      tempToServerIdRef.current.set(tempId, "pending");

      const res = await fetch("/api/discussions/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, body: finalBody, anonymous: anonymous ?? false, replyToId: replyToId ?? undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        // Handle spam detection 429 with retryAfter countdown
        if (res.status === 429 && data.retryAfter) {
          const endTime = Date.now() + data.retryAfter * 1000;
          setSpamCooldownEnd(endTime);

          // Clear any existing countdown timer
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
          }

          const updateCountdown = () => {
            const remaining = Math.ceil((endTime - Date.now()) / 1000);
            if (remaining <= 0) {
              setError(null);
              setSpamCooldownEnd(0);
              if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current);
                cooldownTimerRef.current = null;
              }
            } else {
              setError(`Sending too fast. Try again in ${remaining}s.`);
            }
          };

          updateCountdown();
          cooldownTimerRef.current = setInterval(updateCountdown, 1000);

          // Remove the optimistic message and clean up sentinel
          tempToServerIdRef.current.delete(tempId);
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          setSending(false);
          return;
        }

        throw new Error(data.error || "Failed to send message");
      }

      // API returns the created message with real ID
      const serverMsg: ChatMessage = await res.json();

      // Update the mapping with the real server ID for Realtime dedup
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

      // Clean up the pending sentinel on failure
      tempToServerIdRef.current.delete(tempId);

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
        label = `#${num ?? "?"}`;
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

    const channel = supabase.channel(`chat:${courseId}`);

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

          // If any temp message is still "pending" (API hasn't responded yet)
          // and the author matches, this Realtime event is likely for our
          // in-flight send. Replace the optimistic message with the real one.
          const pendingEntry = Array.from(tempToServerIdRef.current.entries())
            .find(([, serverId]) => serverId === "pending");
          if (pendingEntry) {
            const [pendingTempId] = pendingEntry;
            const optimistic = prev.find((m) => m.id === pendingTempId);
            if (optimistic && optimistic.author_id === newMsg.author_id) {
              tempToServerIdRef.current.set(pendingTempId, newMsg.id);
              return prev.map((m) =>
                m.id === pendingTempId
                  ? { ...newMsg, _status: "delivered" as const }
                  : m
              );
            }
          }

          // Avoid duplicates from normal flow
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          // Obfuscate anonymous messages from other users (non-admin)
          const finalMsg = (!isAdminUser && !newMsg.author_name)
            ? { ...newMsg, author_id: obfuscateAuthorId(newMsg.author_id, courseId) }
            : newMsg;
          const updated = [...prev, finalMsg];
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
            label = `#${num ?? "?"}`;
          }

          const filtered = prev.filter((m) => m.id !== old.id);
          return [...filtered, createSystemEvent(courseId, `sys-unsend-${old.id}`, `${label} unsent a message`)];
        });
      }
    );

    // Subscribe to channel for message Realtime events
    channel.subscribe();
    channelRef.current = channel;

    // Subscribe to membership changes for join/leave system events
    const memberChannel = supabase.channel(`members:${courseId}`);

    /** localStorage key for persisting pending join names across navigation. */
    const JOIN_STORAGE_KEY = `calchat_pending_joins_${courseId}`;

    /** Reads persisted pending joins from localStorage. */
    function loadPendingJoins(): string[] {
      try {
        const raw = localStorage.getItem(JOIN_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch { return []; }
    }

    /** Persists pending joins to localStorage. */
    function savePendingJoins(names: string[]): void {
      try {
        if (names.length === 0) {
          localStorage.removeItem(JOIN_STORAGE_KEY);
        } else {
          localStorage.setItem(JOIN_STORAGE_KEY, JSON.stringify(names));
        }
      } catch { /* localStorage unavailable */ }
    }

    // Restore any pending joins from a previous session
    if (isSystemCourse) {
      const persisted = loadPendingJoins();
      if (persisted.length > 0) {
        pendingJoinsRef.current = persisted;
      }
    }

    /**
     * Flushes accumulated join names into a single batched system event.
     * Called on an interval for system courses (calfam).
     */
    function flushJoinBatch() {
      const names = pendingJoinsRef.current.splice(0);
      savePendingJoins([]);
      if (names.length === 0) return;
      const text = names.length === 1
        ? `${names[0]} joined the group`
        : `${names.length} new members joined the group`;
      setMessages((prev) => [...prev, createSystemEvent(courseId, `sys-join-batch-${Date.now()}`, text)]);
    }

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
        if (isSystemCourse) {
          pendingJoinsRef.current.push(name);
          savePendingJoins(pendingJoinsRef.current);
        } else {
          setMessages((prev) => [...prev, createSystemEvent(courseId, `sys-join-${newMember.user_id}-${Date.now()}`, `${name} joined the group`)]);
        }
      }
    );

    // For system courses, flush batched joins every hour
    if (isSystemCourse) {
      joinTimerRef.current = setInterval(flushJoinBatch, JOIN_BATCH_INTERVAL_MS);
    }

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
        setMessages((prev) => [...prev, createSystemEvent(courseId, `sys-leave-${old.user_id}-${Date.now()}`, `${name} left the group`)]);
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
      if (joinTimerRef.current) {
        clearInterval(joinTimerRef.current);
        joinTimerRef.current = null;
      }
      // Persist any remaining pending joins so they survive navigation
      savePendingJoins(pendingJoinsRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Clean up cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, []);

  return {
    messages,
    loading,
    error,
    hasMore,
    initialFetchDone,
    sending,
    /** Unix timestamp (ms) when the spam cooldown expires. 0 = no cooldown. */
    spamCooldownEnd,
    sendMessage,
    deleteMessage,
    loadMore,
  };
}
