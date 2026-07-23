"use client";

/**
 * SWR provider with localStorage-backed cache persistence — a lightweight
 * take on Notion's "RecordCache": render from a persisted local cache
 * synchronously on boot, then let SWR revalidate in the background
 * (stale-while-revalidate). This is what makes repeat loads feel instant.
 *
 * Hardening over the naive version:
 *  - Flush on `pagehide` / `visibilitychange:hidden` instead of `beforeunload`
 *    so the page stays eligible for the browser back/forward cache and the
 *    flush actually fires on mobile (where `beforeunload` often doesn't).
 *  - Don't persist error or empty states — only settled data is worth
 *    replaying, and it keeps the blob small.
 *  - Clear the persisted cache on sign-out (see `clearSWRCache`) so a shared
 *    computer never flashes one user's data to the next.
 *
 * @param children - React children to wrap
 */

import { SWRConfig } from "swr";
import type { Cache, State } from "swr";
import type { ReactNode } from "react";

const STORAGE_KEY = "caltodo_swr_cache";

/** Removes the persisted SWR cache. Call on sign-out to avoid leaking one
 *  user's cached data to the next person on a shared device. */
export function clearSWRCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage unavailable — nothing to clear */
  }
}

/**
 * Creates an SWR cache provider backed by localStorage.
 * Reads existing entries on init, writes settled entries back when the page
 * is hidden/unloaded.
 *
 * @param _parentCache - Parent cache from SWR (unused, we replace entirely)
 * @returns Map-based cache provider for SWR
 */
function localStorageProvider(_parentCache: Readonly<Cache>): Cache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stored: [string, State<any, any>][] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Must be an array of [key, value] entries for `new Map(...)`. A valid
        // JSON value of the wrong shape (e.g. {} or a number from a stale/other
        // version) parses fine but throws "not iterable" in the Map ctor below,
        // crashing the whole app on mount — guard the shape here.
        if (Array.isArray(parsed)) stored = parsed;
      }
    } catch {
      // Corrupted or unavailable localStorage — start fresh
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = new Map<string, State<any, any>>(stored);

  if (typeof window !== "undefined") {
    const flush = () => {
      try {
        // Persist only settled, successful entries: skip anything still
        // erroring or without data so we never replay a failure as if it
        // were real content, and keep the serialized blob lean.
        const entries = Array.from(map.entries()).filter(
          ([, value]) => value && value.error === undefined && value.data !== undefined,
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch {
        // localStorage full or unavailable — silently skip
      }
    };

    // `visibilitychange:hidden` is the reliable "page is going away" signal on
    // mobile; `pagehide` covers bfcache navigations. Neither blocks bfcache the
    // way `beforeunload` does.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    window.addEventListener("pagehide", flush);
  }

  return {
    keys: () => map.keys(),
    get: (key: string) => map.get(key),
    set: (key: string, value: State) => map.set(key, value),
    delete: (key: string) => map.delete(key),
  };
}

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: localStorageProvider,
        // Cache-first, stale-while-revalidate defaults (Notion's model):
        // keep the previous view's data on screen while the next loads
        // (no skeleton flash between filtered views), dedupe rapid repeat
        // requests for the same key across widgets, and refresh on focus /
        // reconnect so stale cached data self-heals.
        keepPreviousData: true,
        dedupingInterval: 5000,
        revalidateOnFocus: true,
        // Cap focus-revalidation to once per key per minute so alt-tabbing back
        // doesn't re-fire every widget's fetch (gcal events, weather, invites)
        // on each focus — a big contributor to the "feels slow on return" lag.
        focusThrottleInterval: 60_000,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
