"use client";

/**
 * SWR provider with localStorage-backed cache persistence.
 * Wraps the app with SWRConfig so all useSWR hooks share a single cache.
 * On page unload the in-memory cache is serialized to localStorage.
 * On next load SWR reads from it and returns stale data instantly.
 *
 * @param children - React children to wrap
 */

import { SWRConfig } from "swr";
import type { Cache, State } from "swr";
import type { ReactNode } from "react";

const STORAGE_KEY = "caltodo_swr_cache";

/**
 * Creates an SWR cache provider backed by localStorage.
 * Reads existing entries from localStorage on init, writes back on page unload.
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
        stored = JSON.parse(raw);
      }
    } catch {
      // Corrupted or unavailable localStorage — start fresh
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = new Map<string, State<any, any>>(stored);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      try {
        const entries = Array.from(map.entries());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch {
        // localStorage full or unavailable — silently skip
      }
    });
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
    <SWRConfig value={{ provider: localStorageProvider }}>
      {children}
    </SWRConfig>
  );
}
