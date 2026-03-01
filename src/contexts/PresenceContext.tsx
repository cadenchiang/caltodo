"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureRealtimeAuth } from "@/lib/supabase/realtime-auth";
import type { ChatPresence } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceContextValue {
  /** All currently online users with their profile info. */
  onlineUsers: ChatPresence[];
  /** Set of user IDs currently online, for O(1) membership checks. */
  onlineUserIds: Set<string>;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);

/**
 * Global presence provider that tracks online users site-wide.
 * Subscribes to a single Supabase Realtime channel ("presence:global")
 * so users remain visible as online regardless of which page they're on.
 *
 * @param children - React children to render inside the provider
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<ChatPresence[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const mounted = { current: true };
    let channel: RealtimeChannel | null = null;

    async function joinPresence() {
      await ensureRealtimeAuth(supabase);
      if (!mounted.current) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted.current) return;

      // Use the actual user ID as presence key so each user gets a unique slot
      channel = supabase.channel("presence:global", {
        config: { presence: { key: user.id } },
      });

      channel.on("presence", { event: "sync" }, () => {
        if (!channel) return;
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

      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !mounted.current) return;
        await channel!.track({
          user_id: user.id,
          user_name: user.user_metadata?.full_name ?? null,
          user_avatar: user.user_metadata?.avatar_url ?? null,
          online_at: new Date().toISOString(),
        });
      });

      channelRef.current = channel;
    }

    joinPresence();

    return () => {
      mounted.current = false;
      if (channel) {
        // Only untrack if the channel has finished subscribing
        if (channel.state === "joined") {
          channel.untrack();
        }
        channel.unsubscribe();
      }
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.user_id)),
    [onlineUsers],
  );

  return (
    <PresenceContext.Provider value={{ onlineUsers, onlineUserIds }}>
      {children}
    </PresenceContext.Provider>
  );
}

/**
 * Hook to access global presence state.
 * Must be used within a PresenceProvider.
 *
 * @returns PresenceContextValue with onlineUsers list and onlineUserIds set
 * @throws Error if used outside PresenceProvider
 */
export function usePresence(): PresenceContextValue {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return ctx;
}
