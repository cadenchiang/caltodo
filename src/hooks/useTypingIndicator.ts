"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/** Shape tracked in Supabase Presence for typing state. */
interface TypingPresence {
  user_id: string;
  user_name: string | null;
}

/** A user currently typing (excludes the local user). */
export interface TypingUser {
  userId: string;
  userName: string | null;
}

/** Auto-untrack delay in milliseconds after last keystroke. */
const IDLE_TIMEOUT_MS = 500;

/** Delay before broadcasting typing to others (avoids single-keystroke flicker). */
const START_DEBOUNCE_MS = 50;

/**
 * Subscribes to a Supabase Presence channel for typing indicators.
 * Exposes the list of other users currently typing, plus start/stop helpers.
 *
 * @param courseId - The course channel to track typing in
 * @param currentUserId - The local user's ID (excluded from typingUsers)
 * @returns typingUsers array, startTyping callback, stopTyping callback
 */
export function useTypingIndicator(
  courseId: string,
  currentUserId: string,
): {
  typingUsers: TypingUser[];
  startTyping: () => void;
  stopTyping: () => void;
} {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTrackingRef = useRef(false);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!courseId || !currentUserId) return;

    const supabase = supabaseRef.current;
    const channel = supabase.channel(`typing:${courseId}`, {
      config: { presence: { key: "user_id" } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<TypingPresence>();
      const users: TypingUser[] = [];
      for (const key of Object.keys(state)) {
        const presences = state[key];
        if (presences && presences.length > 0) {
          const p = presences[0];
          if (p.user_id !== currentUserId) {
            users.push({ userId: p.user_id, userName: p.user_name });
          }
        }
      }
      setTypingUsers(users);
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
      channel.untrack();
      channel.unsubscribe();
      channelRef.current = null;
      isTrackingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, currentUserId]);

  /**
   * Signals that the local user started typing.
   * Debounces the first broadcast by START_DEBOUNCE_MS to avoid single-keystroke flicker.
   * Resets the idle timer on every keystroke.
   */
  const startTyping = useCallback(async () => {
    const channel = channelRef.current;
    if (!channel || !currentUserId) return;

    // Reset idle timer on every keystroke
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      channel.untrack();
      isTrackingRef.current = false;
    }, IDLE_TIMEOUT_MS);

    if (!isTrackingRef.current) {
      // Debounce: wait START_DEBOUNCE_MS of sustained typing before broadcasting
      if (startDebounceRef.current) return; // already waiting
      startDebounceRef.current = setTimeout(async () => {
        startDebounceRef.current = null;
        // Only broadcast if user is still typing (idle timer hasn't fired)
        if (idleTimerRef.current) {
          isTrackingRef.current = true;
          const { data: { user } } = await supabaseRef.current.auth.getUser();
          await channel.track({
            user_id: currentUserId,
            user_name: user?.user_metadata?.full_name ?? null,
          });
        }
      }, START_DEBOUNCE_MS);
    }
  }, [currentUserId]);

  /**
   * Immediately signals that the local user stopped typing (e.g. on send).
   * Clears both the idle timer and any pending start debounce.
   */
  const stopTyping = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (startDebounceRef.current) {
      clearTimeout(startDebounceRef.current);
      startDebounceRef.current = null;
    }
    channelRef.current?.untrack();
    isTrackingRef.current = false;
  }, []);

  return { typingUsers, startTyping, stopTyping };
}
