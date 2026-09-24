"use client";

/**
 * Friend lists and the writes over them: send, accept, decline, remove.
 *
 * Hydrates from localStorage after mount (never during render, to avoid a
 * hydration mismatch), then refetches. A failed fetch is reported as an
 * error rather than rendered as "No friends yet".
 */

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { FRIENDS_CACHE_KEY, type FriendEntry, type FriendLists } from "./profile-utils";

/** Everything the profile needs to show and change friendships. */
export interface Friends extends FriendLists {
  /** True until the first fetch (or cache) has landed. */
  loading: boolean;
  /** Message when the last fetch failed and nothing is cached. */
  error: string | null;
  /** Refetches the lists. */
  refresh: () => Promise<void>;
  /** Sends a request to a user. Returns the new friendship id, if the API gave one. */
  sendRequest: (userId: string) => Promise<string | undefined>;
  /** Accepts or declines a received request. */
  respond: (friendshipId: string, action: "accept" | "decline") => Promise<void>;
  /** Removes a friend or cancels a sent request. */
  remove: (friendshipId: string) => Promise<void>;
  /** Friendship id currently being responded to, for spinners. */
  respondingId: string | null;
  /** Friendship id currently being removed, for spinners. */
  removingId: string | null;
  /** True while a request is being sent. */
  sending: boolean;
}

const EMPTY: FriendLists = { friends: [], pendingReceived: [], pendingSent: [] };

/**
 * Loads and manages the signed-in user's friend lists.
 *
 * @returns The lists, their load state, and the write actions
 * @remarks Every failure toasts with the error variant and is logged with
 *          cause and impact; nothing is swallowed.
 */
export function useFriends(): Friends {
  const { showToast } = useToast();
  const [lists, setLists] = useState<FriendLists>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(FRIENDS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<FriendLists>;
        setLists({
          friends: parsed.friends ?? [],
          pendingReceived: parsed.pendingReceived ?? [],
          pendingSent: parsed.pendingSent ?? [],
        });
        setLoading(false);
      }
    } catch (err) {
      console.warn("useFriends: corrupt cache ignored", { error: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/friends");
      if (!res.ok) throw new Error(`Friends request failed: ${res.status}`);
      const data = await res.json();
      const next: FriendLists = {
        friends: data.friends ?? [],
        pendingReceived: data.pendingReceived ?? [],
        pendingSent: data.pendingSent ?? [],
      };
      setLists(next);
      setError(null);
      try {
        localStorage.setItem(FRIENDS_CACHE_KEY, JSON.stringify(next));
      } catch { /* quota exceeded; the fetched state is still shown */ }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("useFriends: fetch failed", { error: message, impact: "friend lists may be stale or empty" });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sendRequest = useCallback(
    async (userId: string): Promise<string | undefined> => {
      setSending(true);
      try {
        const res = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (res.status === 409) {
          showToast("Request already sent.", { variant: "error" });
          return undefined;
        }
        if (!res.ok) throw new Error(`Send failed: ${res.status}`);
        const data = await res.json();
        await refresh();
        return data.friendship?.id as string | undefined;
      } catch (err) {
        console.error("useFriends: send request failed", {
          userId,
          error: err instanceof Error ? err.message : String(err),
          impact: "no request was sent",
        });
        showToast("Failed to send request.", { variant: "error" });
        return undefined;
      } finally {
        setSending(false);
      }
    },
    [refresh, showToast]
  );

  const respond = useCallback(
    async (friendshipId: string, action: "accept" | "decline") => {
      setRespondingId(friendshipId);
      try {
        const res = await fetch(`/api/friends/${friendshipId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) throw new Error(`${action} failed: ${res.status}`);
        await refresh();
        showToast(action === "accept" ? "Friend request accepted." : "Request declined.");
      } catch (err) {
        console.error("useFriends: respond failed", {
          friendshipId,
          action,
          error: err instanceof Error ? err.message : String(err),
          impact: "the request is still pending",
        });
        showToast(`Failed to ${action} request.`, { variant: "error" });
      } finally {
        setRespondingId(null);
      }
    },
    [refresh, showToast]
  );

  const remove = useCallback(
    async (friendshipId: string) => {
      setRemovingId(friendshipId);
      try {
        const res = await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`Remove failed: ${res.status}`);
        await refresh();
        showToast("Removed.");
      } catch (err) {
        console.error("useFriends: remove failed", {
          friendshipId,
          error: err instanceof Error ? err.message : String(err),
          impact: "the friendship or request still exists",
        });
        showToast("Failed to remove.", { variant: "error" });
      } finally {
        setRemovingId(null);
      }
    },
    [refresh, showToast]
  );

  return { ...lists, loading, error, refresh, sendRequest, respond, remove, respondingId, removingId, sending };
}
