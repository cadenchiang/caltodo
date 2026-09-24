"use client";

import { useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";
import { usePendingInvites } from "@/hooks/usePendingInvites";
import type { PendingInvite } from "@/lib/types";

/** Delay before refetching so the admin-inserted row propagates through RLS. */
const ACCEPT_SETTLE_MS = 300;

/**
 * Posts one invite response.
 *
 * @param shareId - The share to respond to
 * @param action - "accept" or "decline"
 * @throws When the request fails or the server rejects it
 */
async function postResponse(shareId: string, action: "accept" | "decline"): Promise<void> {
  const res = await fetch(`/api/tasks/invite/${shareId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/**
 * Accept/decline handlers for pending task invites. Rows stay in the list
 * until the server confirms; a failure logs, toasts an error with Retry, and
 * leaves the row where it was.
 *
 * @param fetchTasks - Refetches the task list after an accept
 * @returns The invite list and the two response handlers
 */
export function useInviteResponses(fetchTasks: () => Promise<unknown>) {
  const { invites, setInvites } = usePendingInvites();
  const { showToast } = useToast();

  const respond = useCallback(
    async (shareId: string, action: "accept" | "decline") => {
      try {
        await postResponse(shareId, action);
        setInvites((prev) => prev.filter((i) => i.shareId !== shareId));
        if (action === "accept") {
          await new Promise((r) => setTimeout(r, ACCEPT_SETTLE_MS));
          await fetchTasks();
        }
      } catch (err) {
        console.error("[useInviteResponses] response failed", {
          shareId,
          action,
          error: err instanceof Error ? err.message : String(err),
          impact: "invite kept in the list",
        });
        showToast(action === "accept" ? "Couldn't accept the invite." : "Couldn't decline the invite.", {
          variant: "error",
          action: { label: "Retry", onClick: () => { respond(shareId, action); } },
        });
      }
    },
    [setInvites, fetchTasks, showToast]
  );

  const acceptAll = useCallback(async () => {
    const pending: PendingInvite[] = [...invites];
    if (pending.length === 0) return;
    const results = await Promise.allSettled(pending.map((invite) => postResponse(invite.shareId, "accept")));
    const accepted = new Set(pending.filter((_, i) => results[i].status === "fulfilled").map((i) => i.shareId));
    const failed = pending.length - accepted.size;
    if (accepted.size > 0) {
      setInvites((prev) => prev.filter((i) => !accepted.has(i.shareId)));
      await new Promise((r) => setTimeout(r, ACCEPT_SETTLE_MS));
      await fetchTasks();
    }
    if (failed > 0) {
      console.error("[useInviteResponses] accept all: some responses failed", {
        failed,
        accepted: accepted.size,
        impact: "failed invites kept in the list",
      });
      showToast(failed === 1 ? "Couldn't accept 1 invite." : `Couldn't accept ${failed} invites.`, {
        variant: "error",
        action: { label: "Retry", onClick: () => { acceptAll(); } },
      });
    }
  }, [invites, setInvites, fetchTasks, showToast]);

  return { invites, respond, acceptAll };
}
