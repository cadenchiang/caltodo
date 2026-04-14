"use client";

/**
 * Hook for reading/writing which sidebar nav items the user has chosen
 * to hide (e.g. "/app/home"). Backed by localStorage, synced across
 * components in the same tab via a custom event.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "caltodo_hidden_nav_items";
const CHANGE_EVENT = "caltodo-hidden-nav-change";

/**
 * Reads the hidden-href set from localStorage. Returns an empty set if
 * unavailable or malformed.
 */
function readHidden(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

/**
 * Persists the hidden-href set to localStorage and notifies listeners.
 */
function writeHidden(next: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // Non-critical
  }
}

/**
 * Returns the set of currently hidden nav item hrefs and helpers to
 * toggle visibility. Stays in sync across Sidebar, MobileTabBar, and
 * the settings toggle list through the CHANGE_EVENT.
 */
export function useHiddenNavItems() {
  const [hidden, setHidden] = useState<Set<string>>(() => readHidden());

  useEffect(() => {
    function refresh() {
      setHidden(readHidden());
    }
    window.addEventListener(CHANGE_EVENT, refresh);
    // Sync across tabs
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) refresh();
    });
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, []);

  const toggle = useCallback((href: string) => {
    const next = readHidden();
    if (next.has(href)) next.delete(href);
    else next.add(href);
    writeHidden(next);
    setHidden(next);
  }, []);

  const isHidden = useCallback(
    (href: string) => hidden.has(href),
    [hidden]
  );

  return { hidden, isHidden, toggle };
}
