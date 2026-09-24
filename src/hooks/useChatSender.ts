"use client";

import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { ChatMessage } from "@/lib/types";
import { writeCache } from "./chatCache";
import { uploadChatFiles } from "@/lib/chat-upload";
import { friendlyChatError } from "@/lib/chat-errors";
import { markFailed, settleOptimistic, TEMP_ID_PREFIX } from "@/lib/chat-message-merge";
import { LAST_SENT_PREFIX, markAsRead } from "@/lib/chat-actions";
import { playMessageSent } from "@/lib/sounds";
import { getChatNotificationPrefs } from "@/lib/chat-notification-prefs";

/** What is needed to send (or resend) one message. */
interface PendingSend {
  body: string;
  anonymous: boolean;
  replyToId?: string;
  nonce: string;
}

interface UseChatSenderArgs {
  courseId: string;
  currentUserId: string;
  currentUserName: string | null;
  myAuthorKey: string | null;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setError: (message: string | null) => void;
  /** Called with every API response so the caller can read headers. */
  onResponse: (res: Response) => void;
}

/**
 * Sending side of the room: optimistic bubble, upload, POST, and retry.
 *
 * Every send carries a client nonce. The API stores it on the row and the
 * broadcast trigger echoes it, so the optimistic bubble is matched by nonce
 * rather than by author (which the client no longer knows). A failed send
 * stays in the list as "failed" with its payload remembered, so tapping it
 * resends the same message instead of dropping it.
 */
export function useChatSender({ courseId, currentUserId, currentUserName, myAuthorKey, setMessages, setError, onResponse }: UseChatSenderArgs) {
  const [sending, setSending] = useState(false);
  /** tempId -> payload, kept until the send is acknowledged. */
  const pendingRef = useRef<Map<string, PendingSend>>(new Map());

  /** Posts one payload for the given optimistic id. */
  const post = useCallback(async (tempId: string, pending: PendingSend) => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/discussions/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          body: pending.body,
          anonymous: pending.anonymous,
          replyToId: pending.replyToId,
          clientNonce: pending.nonce,
        }),
      });
      onResponse(res);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const retryAfter = res.status === 429 && typeof data.retryAfter === "number" ? data.retryAfter : null;
        throw new Error(
          retryAfter ? `You're sending too quickly. Try again in ${retryAfter}s.` : friendlyChatError(res.status, data.error, "send your message"),
        );
      }
      const serverMsg: ChatMessage = await res.json();
      pendingRef.current.delete(tempId);
      setMessages((prev) => {
        const next = settleOptimistic(prev, tempId, serverMsg);
        writeCache(courseId, next);
        return next;
      });
      if (getChatNotificationPrefs().sound) playMessageSent();
      try {
        localStorage.setItem(LAST_SENT_PREFIX + courseId, String(Date.now()));
      } catch { /* non-critical */ }
      markAsRead(courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : friendlyChatError(0, null, "send your message"));
      setMessages((prev) => markFailed(prev, tempId));
    } finally {
      setSending(false);
    }
  }, [courseId, onResponse, setError, setMessages]);

  /**
   * Sends a new message with optional attachments. The bubble appears
   * immediately; uploads happen before the POST.
   *
   * @param body - Message text
   * @param files - Attachments
   * @param anonymous - Send without a name
   * @param replyToId - Message being replied to
   */
  const sendMessage = useCallback(async (body: string, files?: File[], anonymous?: boolean, replyToId?: string) => {
    const text = body.trim();
    if (!text && (!files || files.length === 0)) return;

    const nonce = crypto.randomUUID();
    const tempId = `${TEMP_ID_PREFIX}${nonce}`;
    const now = new Date().toISOString();
    const optimistic: ChatMessage = {
      id: tempId,
      course_id: courseId,
      author_key: myAuthorKey ?? "self",
      author_name: anonymous ? null : (currentUserName ?? "You"),
      author_avatar: null,
      body: text || "Uploading attachment",
      created_at: now,
      updated_at: now,
      reply_to_id: replyToId ?? null,
      client_nonce: nonce,
      _status: "sending",
    };
    setMessages((prev) => [...prev, optimistic]);

    let finalBody = text;
    if (files && files.length > 0) {
      setSending(true);
      try {
        const urls = await uploadChatFiles(currentUserId, courseId, files);
        finalBody = finalBody ? `${finalBody}\n${urls.join("\n")}` : urls.join("\n");
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, body: finalBody } : m)));
      } catch (err) {
        setSending(false);
        setError(err instanceof Error ? err.message : "We couldn't upload that file.");
        // Uploads are not retried automatically; drop the placeholder.
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
    }

    const pending: PendingSend = { body: finalBody, anonymous: anonymous ?? false, replyToId, nonce };
    pendingRef.current.set(tempId, pending);
    await post(tempId, pending);
  }, [courseId, currentUserId, currentUserName, myAuthorKey, post, setError, setMessages]);

  /**
   * Resends a failed message.
   *
   * @param tempId - The failed bubble's id
   */
  const retryMessage = useCallback(async (tempId: string) => {
    const pending = pendingRef.current.get(tempId);
    if (!pending || sending) return;
    setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, _status: "sending" as const } : m)));
    await post(tempId, pending);
  }, [post, sending, setMessages]);

  return { sending, sendMessage, retryMessage };
}
