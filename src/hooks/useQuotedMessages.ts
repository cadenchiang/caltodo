"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

/**
 * Resolves the messages that replies quote.
 *
 * A quoted message is usually in the loaded window; when it is older than
 * that (or the room opened from cache), it is fetched once by id through
 * GET /api/discussions/messages?messageId=. A quote that no longer exists
 * is remembered as null so it is not refetched.
 *
 * @param courseId - The room
 * @param messages - Loaded messages
 * @returns Map from message id to the quoted message (null when deleted)
 */
export function useQuotedMessages(courseId: string, messages: readonly ChatMessage[]): Map<string, ChatMessage | null> {
  const [fetched, setFetched] = useState<Map<string, ChatMessage | null>>(new Map());
  const inFlightRef = useRef<Set<string>>(new Set());

  // Reset when the room changes
  const prevCourseRef = useRef(courseId);
  if (prevCourseRef.current !== courseId) {
    prevCourseRef.current = courseId;
    inFlightRef.current.clear();
    setFetched(new Map());
  }

  useEffect(() => {
    const loaded = new Set(messages.map((m) => m.id));
    const missing = messages
      .map((m) => m.reply_to_id)
      .filter((id): id is string => !!id && !loaded.has(id) && !fetched.has(id) && !inFlightRef.current.has(id));
    if (missing.length === 0) return;

    for (const id of Array.from(new Set(missing))) {
      inFlightRef.current.add(id);
      fetch(`/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&messageId=${encodeURIComponent(id)}`)
        .then(async (res) => {
          if (!res.ok) return null;
          const rows: ChatMessage[] = await res.json();
          return rows[0] ?? null;
        })
        .catch(() => null)
        .then((msg) => {
          inFlightRef.current.delete(id);
          setFetched((prev) => {
            const next = new Map(prev);
            next.set(id, msg);
            return next;
          });
        });
    }
  }, [courseId, messages, fetched]);

  return fetched;
}
