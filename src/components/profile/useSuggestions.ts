"use client";

/**
 * "People you may know" suggestions with a short localStorage cache.
 *
 * When a cache exists it is shown as is and only refreshed in the background
 * for the next load, so the visible list never reshuffles mid-session. A
 * failed fetch with nothing cached is reported as an error.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { SUGGESTIONS_CACHE_KEY, type SearchUser } from "./profile-utils";

/** How long a cached suggestion list is trusted without a refetch. */
export const SUGGESTIONS_TTL_MS = 5 * 60_000;

interface SuggestionsCache {
  suggestions: SearchUser[];
  ts: number;
}

/** What the suggestions block renders from. */
export interface Suggestions {
  people: SearchUser[];
  /** True until the first fetch (or a fresh cache) has landed. */
  loading: boolean;
  /** Message when the last fetch failed and nothing is cached. */
  error: string | null;
  /** Refetches; replaces the visible list only when nothing was cached. */
  refresh: () => Promise<void>;
}

/**
 * Whether a cache entry is still fresh.
 *
 * @param cache - The stored entry, or null
 * @param now - Current time in ms
 * @returns True when the entry has a timestamp inside the TTL
 */
export function isFreshCache(cache: SuggestionsCache | null, now: number): boolean {
  return !!cache?.ts && now - cache.ts < SUGGESTIONS_TTL_MS;
}

/**
 * Loads friend suggestions.
 *
 * @returns The list, its load state, and a refresh action
 */
export function useSuggestions(): Suggestions {
  const [people, setPeople] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Tracks the visible list for stale-closure-safe comparison in refresh. */
  const peopleRef = useRef<SearchUser[]>([]);

  const refresh = useCallback(async () => {
    const hadCache = peopleRef.current.length > 0;
    try {
      const res = await fetch("/api/friends/suggestions");
      if (!res.ok) throw new Error(`Suggestions request failed: ${res.status}`);
      const data = await res.json();
      const suggestions: SearchUser[] = data.suggestions ?? [];
      try {
        localStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify({ suggestions, ts: Date.now() }));
      } catch { /* quota exceeded; the fetched state is still shown */ }
      setError(null);
      if (!hadCache) {
        peopleRef.current = suggestions;
        setPeople(suggestions);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("useSuggestions: fetch failed", { error: message, impact: "suggestions may be stale or empty" });
      if (!hadCache) setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cached: SuggestionsCache | null = null;
    try {
      const raw = localStorage.getItem(SUGGESTIONS_CACHE_KEY);
      if (raw) cached = JSON.parse(raw) as SuggestionsCache;
    } catch (err) {
      console.warn("useSuggestions: corrupt cache ignored", { error: err instanceof Error ? err.message : String(err) });
    }
    if (cached?.suggestions?.length) {
      peopleRef.current = cached.suggestions;
      setPeople(cached.suggestions);
    }
    if (isFreshCache(cached, Date.now())) setLoading(false);
    else void refresh();
  }, [refresh]);

  return { people, loading, error, refresh };
}
