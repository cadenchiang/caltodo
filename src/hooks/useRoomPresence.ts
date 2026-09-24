"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureRealtimeAuth } from "@/lib/supabase/realtime-auth";
import type { RealtimeChannel } from "@supabase/supabase-js";

/** Presence payload tracked in a room channel. */
interface RoomPresence {
  user_id: string;
}

/** Realtime topic for a room's presence channel. Must match the RLS policy. */
export function roomPresenceTopic(courseId: string): string {
  return `room:${courseId}`;
}

/**
 * Who is in this room right now ("N here"), scoped to the open room rather
 * than the site-wide presence list.
 *
 * The channel is private, so Realtime checks RLS on realtime.messages:
 * only members of the course can join or read it (migration
 * 20260923000003). Presence keys are client-chosen; entries whose key does
 * not match the payload's user_id are dropped as inconsistent, which is the
 * strongest client-side check available for Realtime presence.
 *
 * @param courseId - The open room
 * @param currentUserId - The local user (tracked, counted among "here")
 * @returns Set of user ids present in the room
 */
export function useRoomPresence(courseId: string, currentUserId: string): Set<string> {
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!courseId || !currentUserId) return;
    const supabase = supabaseRef.current;
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      await ensureRealtimeAuth(supabase);
      if (cancelled) return;
      channel = supabase.channel(roomPresenceTopic(courseId), {
        config: { private: true, presence: { key: currentUserId } },
      });
      channel.on("presence", { event: "sync" }, () => {
        if (!channel) return;
        const state = channel.presenceState<RoomPresence>();
        const ids = new Set<string>();
        for (const key of Object.keys(state)) {
          const entries = state[key];
          if (entries?.some((p) => p.user_id === key)) ids.add(key);
        }
        setPresentIds(ids);
      });
      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || cancelled || !channel) return;
        await channel.track({ user_id: currentUserId });
      });
    })();

    return () => {
      cancelled = true;
      if (channel) {
        if (channel.state === "joined") channel.untrack();
        channel.unsubscribe();
      }
      setPresentIds(new Set());
    };
  }, [courseId, currentUserId]);

  return presentIds;
}
