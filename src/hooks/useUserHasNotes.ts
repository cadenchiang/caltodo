"use client";

/**
 * Returns true when the signed-in user has at least one non-deleted note
 * in the database. Used to gate the Notes nav item so brand-new users don't
 * see it, while users who already created notes keep their access.
 *
 * The check is cached in localStorage so it doesn't refetch on every render
 * or page navigation. Once we know the user has notes, the answer is sticky
 * (deleting all notes does not hide the nav item again — they explicitly
 * went looking for it).
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CACHE_KEY = "caltodo_user_has_notes";

/**
 * Reads the cached has-notes flag from localStorage.
 *
 * @returns true if the cache says the user has notes, false if "no",
 *   undefined if no cache entry yet (caller should treat as "unknown").
 */
function readCache(): boolean | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Writes the has-notes flag to localStorage. Only writes when the value
 * has actually changed to avoid storage churn.
 *
 * @param value - true when the user has at least one note.
 */
function writeCache(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, String(value));
  } catch {
    /* quota / private mode — non-critical */
  }
}

/**
 * Hook: whether the current user owns at least one note. Returns a stable
 * boolean once the first check completes; defaults to the cached value
 * during initial render (or `false` if no cache exists) so the sidebar
 * paints without flicker.
 */
export function useUserHasNotes(): boolean {
  const [hasNotes, setHasNotes] = useState<boolean>(() => readCache() ?? false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled || error || !data.user) return;
      // count: "exact", head: true returns just a row count without payload.
      supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", data.user!.id)
        .is("deleted_at", null)
        .then(({ count, error: countErr }) => {
          if (cancelled || countErr) return;
          const next = (count ?? 0) > 0;
          // Sticky: once true, stay true even if a later check shows 0.
          const cached = readCache();
          if (cached === true) return;
          if (next !== hasNotes) {
            setHasNotes(next);
            writeCache(next);
          } else if (cached === undefined) {
            writeCache(next);
          }
        });
    }).catch(() => {
      /* offline / auth error — keep cached value */
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return hasNotes;
}
