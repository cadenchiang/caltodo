"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureRealtimeAuth } from "@/lib/supabase/realtime-auth";

/**
 * A single emoji reaction with the list of users who reacted.
 */
export interface ReactionGroup {
  emoji: string;
  userIds: string[];
}

/** Maps message_id → array of ReactionGroups. */
export type ReactionsMap = Map<string, ReactionGroup[]>;

/**
 * Hook for managing iMessage-style tapback reactions on chat messages.
 * Fetches reactions for a course, subscribes to Realtime for live updates,
 * and provides an optimistic toggle function.
 *
 * @param courseId - The course UUID
 * @returns reactionsMap, fetchReactions, toggleReaction
 */
export function useMessageReactions(courseId: string) {
  const [reactionsMap, setReactionsMap] = useState<ReactionsMap>(new Map());
  const supabaseRef = useRef(createClient());
  const prevCourseIdRef = useRef(courseId);

  // Reset when courseId changes
  if (prevCourseIdRef.current !== courseId) {
    prevCourseIdRef.current = courseId;
    setReactionsMap(new Map());
  }

  /**
   * Fetches all reactions for the current course and builds the map.
   */
  const fetchReactions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/discussions/reactions?courseId=${encodeURIComponent(courseId)}`
      );
      if (!res.ok) return;
      const data: { message_id: string; emoji: string; user_id: string }[] = await res.json();

      const map: ReactionsMap = new Map();
      for (const row of data) {
        const groups = map.get(row.message_id) ?? [];
        const group = groups.find((g) => g.emoji === row.emoji);
        if (group) {
          group.userIds.push(row.user_id);
        } else {
          groups.push({ emoji: row.emoji, userIds: [row.user_id] });
        }
        map.set(row.message_id, groups);
      }
      setReactionsMap(map);
    } catch {
      // Silent failure
    }
  }, [courseId]);

  /**
   * Toggles a reaction on a message. Optimistically updates local state.
   *
   * @param messageId - The message UUID
   * @param emoji - The tapback emoji
   * @param userId - The current user's ID (for optimistic update)
   */
  const toggleReaction = useCallback(async (
    messageId: string,
    emoji: string,
    userId: string,
  ) => {
    // Optimistic update — one reaction per user per message
    setReactionsMap((prev) => {
      const next = new Map(prev);
      let groups = [...(next.get(messageId) ?? [])];
      const existingGroup = groups.find((g) => g.userIds.includes(userId));

      if (existingGroup && existingGroup.emoji === emoji) {
        // Same emoji → toggle off (remove)
        existingGroup.userIds = existingGroup.userIds.filter((id) => id !== userId);
        if (existingGroup.userIds.length === 0) {
          groups = groups.filter((g) => g.emoji !== emoji);
        }
        next.set(messageId, groups);
        return next;
      }

      // Remove user from any existing reaction group first
      if (existingGroup) {
        existingGroup.userIds = existingGroup.userIds.filter((id) => id !== userId);
        if (existingGroup.userIds.length === 0) {
          groups = groups.filter((g) => g.emoji !== existingGroup.emoji);
        }
      }

      // Add user to the new emoji group
      const targetGroup = groups.find((g) => g.emoji === emoji);
      if (targetGroup) {
        targetGroup.userIds = [...targetGroup.userIds, userId];
      } else {
        groups.push({ emoji, userIds: [userId] });
      }

      next.set(messageId, groups);
      return next;
    });

    // Fire API call (toggle)
    try {
      await fetch("/api/discussions/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji, courseId }),
      });
    } catch {
      // Refetch on failure to correct state
      fetchReactions();
    }
  }, [courseId, fetchReactions]);

  // Subscribe to Realtime for reaction changes
  useEffect(() => {
    fetchReactions();

    const supabase = supabaseRef.current;
    const channel = supabase.channel(`reactions:${courseId}`);

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "message_reactions",
        filter: `course_id=eq.${courseId}`,
      },
      (payload) => {
        const row = payload.new as { message_id: string; emoji: string; user_id: string };
        setReactionsMap((prev) => {
          const next = new Map(prev);
          const groups = [...(next.get(row.message_id) ?? [])];
          const group = groups.find((g) => g.emoji === row.emoji);
          if (group) {
            if (!group.userIds.includes(row.user_id)) {
              group.userIds = [...group.userIds, row.user_id];
            }
          } else {
            groups.push({ emoji: row.emoji, userIds: [row.user_id] });
          }
          next.set(row.message_id, groups);
          return next;
        });
      }
    );

    channel.on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "message_reactions",
        filter: `course_id=eq.${courseId}`,
      },
      (payload) => {
        const old = payload.old as { message_id: string; emoji: string; user_id: string };
        setReactionsMap((prev) => {
          const next = new Map(prev);
          const groups = [...(next.get(old.message_id) ?? [])];
          const group = groups.find((g) => g.emoji === old.emoji);
          if (group) {
            group.userIds = group.userIds.filter((id) => id !== old.user_id);
            if (group.userIds.length === 0) {
              next.set(old.message_id, groups.filter((g) => g.emoji !== old.emoji));
            } else {
              next.set(old.message_id, groups);
            }
          }
          return next;
        });
      }
    );

    let cancelled = false;
    (async () => {
      await ensureRealtimeAuth(supabase);
      if (cancelled) return;
      channel.subscribe();
    })();

    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, [courseId, fetchReactions]);

  return { reactionsMap, fetchReactions, toggleReaction };
}
