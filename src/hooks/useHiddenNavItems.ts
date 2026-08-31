"use client";

/**
 * Hook for reading/writing which sidebar nav items the user has chosen
 * to hide (e.g. "/app/home"). Stored in Supabase auth user_metadata so
 * preferences sync across devices, with localStorage as a fast cache
 * (also used by the pre-paint inline script in layout.tsx to prevent
 * a flash of un-hidden items).
 */

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/current-user";

const STORAGE_KEY = "caltodo_hidden_nav_items";
const CHANGE_EVENT = "caltodo-hidden-nav-change";
/** auth.user_metadata key for the hidden-nav-href list. */
const META_KEY = "hidden_nav_items";

/**
 * Reads the hidden-href set from localStorage (the fast cache). Returns
 * an empty set if unavailable or malformed.
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
 * Persists the hidden-href set to localStorage and notifies in-tab
 * listeners via CHANGE_EVENT. Cross-tab sync is handled by the native
 * "storage" event.
 */
function writeLocal(next: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // Non-critical (quota, private mode, etc.)
  }
}

/**
 * Compares two sets for equal membership.
 */
function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

/**
 * Returns the set of currently hidden nav item hrefs and helpers to
 * toggle visibility. State is mirrored to Supabase auth user_metadata
 * so it follows the user across devices.
 */
export function useHiddenNavItems() {
  // Starts empty so the first client render matches the server's, which has
  // no localStorage to read. Seeding this from readHidden() in a lazy
  // initializer ran during render and produced a hydration mismatch: the
  // server emitted every nav item while the client dropped the hidden ones,
  // shifting each remaining item up a slot. The pre-paint <style> tag keeps
  // hidden items invisible until the effect below adopts the cached value,
  // so nothing flashes in the meantime.
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  /** True once the localStorage cache has been adopted after mount. */
  const [hydrated, setHydrated] = useState(false);

  // On mount: adopt the local cache, then hydrate from Supabase
  // user_metadata (source of truth across devices) and reconcile.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHidden(readHidden());
    setHydrated(true);

    let cancelled = false;
    getCurrentUser().then((user) => {
      if (cancelled) return;
      if (!user) return;
      const meta = user.user_metadata as { [META_KEY]?: unknown } | null;
      const remoteRaw = meta?.[META_KEY];
      if (!Array.isArray(remoteRaw)) return;
      const remote = new Set(remoteRaw.filter((v): v is string => typeof v === "string"));
      const local = readHidden();
      if (!setsEqual(remote, local)) {
        writeLocal(remote);
        setHidden(remote);
      }
    }).catch(() => {
      // Network/auth failure: localStorage cache is fine to keep using.
    });

    function refresh() {
      setHidden(readHidden());
    }
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) refresh();
    }
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Drop the pre-paint style tag only once React's own filter is
  // authoritative. Removing it in the mount effect above would uncover every
  // hidden item for the frame between that removal and the re-render that
  // applies `hidden`.
  useEffect(() => {
    if (!hydrated) return;
    const style = document.getElementById("caltodo-hidden-nav-style");
    if (style) style.remove();
  }, [hydrated]);

  const toggle = useCallback((href: string) => {
    const next = readHidden();
    if (next.has(href)) next.delete(href);
    else next.add(href);
    writeLocal(next);
    setHidden(next);

    // Mirror to Supabase user_metadata. Fire-and-forget — local cache
    // already reflects the change, and the next mount will reconcile if
    // this fails.
    const supabase = createClient();
    supabase.auth.updateUser({
      data: { [META_KEY]: [...next] },
    }).catch(() => {
      // Non-critical: localStorage is the immediate source of truth.
    });
  }, []);

  const isHidden = useCallback(
    (href: string) => hidden.has(href),
    [hidden]
  );

  return { hidden, isHidden, toggle };
}
