"use client";

/**
 * Shared hook that fetches the user's pending task-share invitations.
 *
 * Backed by SWR so multiple concurrent consumers (the Inbox page and the
 * Calendar header for example) dedupe onto a single in-flight request and
 * share a single cached result. Previously both routes fired independent
 * fetches on mount.
 *
 * The hook mirrors the existing page-level state shape so call sites only
 * have to swap the useEffect+useState pair for this hook.
 *
 * @returns `{ invites, setInvites, refresh }` — `setInvites` accepts a
 *          direct array or an updater and writes into the SWR cache so all
 *          consumers see the change immediately.
 */

import { useCallback } from "react";
import useSWR from "swr";
import type { PendingInvite } from "@/lib/types";

const INVITES_KEY = "/api/tasks/invites/pending";

/** Fetcher that tolerates network errors so consumers never see a throw. */
async function fetcher(url: string): Promise<PendingInvite[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { invites?: PendingInvite[] };
    return data.invites ?? [];
  } catch {
    return [];
  }
}

export function usePendingInvites(): {
  invites: PendingInvite[];
  /** Replace the cached list (also accepts an updater fn). */
  setInvites: (next: PendingInvite[] | ((prev: PendingInvite[]) => PendingInvite[])) => void;
  /** Force a fresh network fetch. */
  refresh: () => void;
} {
  const { data, mutate } = useSWR<PendingInvite[]>(INVITES_KEY, fetcher, {
    // Dedupe aggressively — the invite list changes rarely and we already
    // mutate the cache locally when the user accepts/declines.
    dedupingInterval: 30_000,
    revalidateOnFocus: false,
    fallbackData: [],
  });

  const setInvites = useCallback(
    (next: PendingInvite[] | ((prev: PendingInvite[]) => PendingInvite[])) => {
      mutate((prev) => (typeof next === "function" ? next(prev ?? []) : next), {
        revalidate: false,
      });
    },
    [mutate]
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return { invites: data ?? [], setInvites, refresh };
}
