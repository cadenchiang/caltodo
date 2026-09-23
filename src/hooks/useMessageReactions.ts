"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureRealtimeAuth } from "@/lib/supabase/realtime-auth";
import type { ChatMessage } from "@/lib/types";

/** A single emoji reaction with the list of users who reacted. */
export interface ReactionGroup {
  emoji: string;
  userIds: string[];
}

/** Maps message_id to its ReactionGroups. */
export type ReactionsMap = Map<string, ReactionGroup[]>;

/** Ids per reactions request; matches the route's cap. */
const BATCH = 100;

/** Adds one (message, emoji, user) to a map, in place on a copy. */
function addReaction(map: ReactionsMap, row: { message_id: string; emoji: string; user_id: string }): ReactionsMap {
  const next = new Map(map);
  const groups = [...(next.get(row.message_id) ?? [])].map((g) => ({ ...g, userIds: [...g.userIds] }));
  const group = groups.find((g) => g.emoji === row.emoji);
  if (group) {
    if (!group.userIds.includes(row.user_id)) group.userIds.push(row.user_id);
  } else {
    groups.push({ emoji: row.emoji, userIds: [row.user_id] });
  }
  next.set(row.message_id, groups);
  return next;
}

/** Removes one (message, emoji, user) from a map, on a copy. */
function removeReaction(map: ReactionsMap, row: { message_id: string; emoji: string; user_id: string }): ReactionsMap {
  const next = new Map(map);
  const groups = (next.get(row.message_id) ?? [])
    .map((g) => (g.emoji === row.emoji ? { ...g, userIds: g.userIds.filter((id) => id !== row.user_id) } : g))
    .filter((g) => g.userIds.length > 0);
  next.set(row.message_id, groups);
  return next;
}

/**
 * Tapback reactions for the messages currently loaded in a room.
 *
 * Reactions are fetched for message ids in view, in batches of 100, as
 * pages load; never for the whole room. Realtime keeps the map current
 * and toggling is optimistic (one reaction per user per message).
 *
 * @param courseId - The room
 * @param messages - The loaded messages (drives which ids are fetched)
 */
export function useMessageReactions(courseId: string, messages: readonly ChatMessage[]) {
  const [reactionsMap, setReactionsMap] = useState<ReactionsMap>(new Map());
  const supabaseRef = useRef(createClient());
  const fetchedIdsRef = useRef<Set<string>>(new Set());
  const prevCourseIdRef = useRef(courseId);

  if (prevCourseIdRef.current !== courseId) {
    prevCourseIdRef.current = courseId;
    fetchedIdsRef.current = new Set();
    setReactionsMap(new Map());
  }

  /** Fetches reactions for the given ids and merges them in. */
  const fetchFor = useCallback(async (ids: string[]) => {
    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH);
      try {
        const res = await fetch(
          `/api/discussions/reactions?courseId=${encodeURIComponent(courseId)}&messageIds=${encodeURIComponent(batch.join(","))}`,
        );
        if (!res.ok) continue;
        const rows: { message_id: string; emoji: string; user_id: string }[] = await res.json();
        setReactionsMap((prev) => {
          let next = new Map(prev);
          for (const id of batch) next.set(id, []);
          for (const row of rows) next = addReaction(next, row);
          return next;
        });
      } catch {
        // Leave these ids unfetched so a later pass retries them.
        for (const id of batch) fetchedIdsRef.current.delete(id);
      }
    }
  }, [courseId]);

  // Fetch reactions for newly loaded (server) message ids
  useEffect(() => {
    const missing = messages.map((m) => m.id).filter((id) => !id.startsWith("temp-") && !fetchedIdsRef.current.has(id));
    if (missing.length === 0) return;
    for (const id of missing) fetchedIdsRef.current.add(id);
    fetchFor(missing);
  }, [messages, fetchFor]);

  /**
   * Toggles a reaction on a message with an optimistic update.
   *
   * @param messageId - The message
   * @param emoji - The tapback emoji
   * @param userId - The current user's id
   */
  const toggleReaction = useCallback(async (messageId: string, emoji: string, userId: string) => {
    setReactionsMap((prev) => {
      const groups = prev.get(messageId) ?? [];
      const existing = groups.find((g) => g.userIds.includes(userId));
      let next = prev;
      if (existing) next = removeReaction(next, { message_id: messageId, emoji: existing.emoji, user_id: userId });
      if (!existing || existing.emoji !== emoji) next = addReaction(next, { message_id: messageId, emoji, user_id: userId });
      return next;
    });
    try {
      const res = await fetch("/api/discussions/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji, courseId }),
      });
      if (!res.ok) {
        fetchedIdsRef.current.delete(messageId);
        fetchFor([messageId]);
      }
    } catch {
      fetchedIdsRef.current.delete(messageId);
      fetchFor([messageId]);
    }
  }, [courseId, fetchFor]);

  // Realtime: reaction rows carry no author identity, so postgres_changes is fine here.
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase.channel(`reactions:${courseId}`);
    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "message_reactions", filter: `course_id=eq.${courseId}` }, (payload) => {
      setReactionsMap((prev) => addReaction(prev, payload.new as { message_id: string; emoji: string; user_id: string }));
    });
    channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "message_reactions", filter: `course_id=eq.${courseId}` }, (payload) => {
      setReactionsMap((prev) => removeReaction(prev, payload.old as { message_id: string; emoji: string; user_id: string }));
    });
    let cancelled = false;
    (async () => {
      await ensureRealtimeAuth(supabase);
      if (!cancelled) channel.subscribe();
    })();
    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, [courseId]);

  return { reactionsMap, toggleReaction };
}
