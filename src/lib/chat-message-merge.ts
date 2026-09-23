/**
 * Pure list operations for the room's message state.
 *
 * Every path that changes the list goes through here so the same rules
 * apply everywhere: an incoming server row replaces the optimistic bubble
 * that carries the same client nonce, a row already in the list is never
 * added twice (M19), and older pages are deduped by id as they are
 * prepended. Nothing here touches author identity.
 *
 * @module chat-message-merge
 */

import type { ChatMessage } from "@/lib/types";

/** Prefix of optimistic (not yet acknowledged) message ids. */
export const TEMP_ID_PREFIX = "temp-";

/** Whether a message is an optimistic placeholder. */
export function isTempMessage(message: Pick<ChatMessage, "id">): boolean {
  return message.id.startsWith(TEMP_ID_PREFIX);
}

/**
 * Merges a server row (from the API response or a broadcast) into the list.
 *
 * @param prev - Current oldest-first list
 * @param incoming - The server row
 * @returns The new list. If an optimistic message shares the nonce it is
 *          replaced in place (status delivered); if the id already exists
 *          the list is returned unchanged; otherwise the row is appended.
 */
export function mergeIncoming(prev: readonly ChatMessage[], incoming: ChatMessage): ChatMessage[] {
  if (prev.some((m) => m.id === incoming.id)) return prev as ChatMessage[];
  const delivered: ChatMessage = { ...incoming, _status: "delivered" };
  if (incoming.client_nonce) {
    const idx = prev.findIndex((m) => isTempMessage(m) && m.client_nonce === incoming.client_nonce);
    if (idx >= 0) {
      const next = [...prev];
      next[idx] = delivered;
      return next;
    }
  }
  return [...prev, delivered];
}

/**
 * Replaces the optimistic message `tempId` with the server row. If the row
 * already arrived by broadcast (matched by nonce), the temp is simply
 * dropped so nothing is duplicated.
 *
 * @param prev - Current list
 * @param tempId - The optimistic id
 * @param server - The API's row
 */
export function settleOptimistic(prev: readonly ChatMessage[], tempId: string, server: ChatMessage): ChatMessage[] {
  const delivered: ChatMessage = { ...server, _status: "delivered" };
  if (prev.some((m) => m.id === server.id)) {
    return prev.filter((m) => m.id !== tempId);
  }
  return prev.map((m) => (m.id === tempId ? delivered : m));
}

/**
 * Marks an optimistic message as failed so it can be retried.
 *
 * @param prev - Current list
 * @param tempId - The optimistic id
 */
export function markFailed(prev: readonly ChatMessage[], tempId: string): ChatMessage[] {
  return prev.map((m) => (m.id === tempId ? { ...m, _status: "failed" as const } : m));
}

/**
 * Prepends an older page, skipping rows already present (M19).
 *
 * @param prev - Current list
 * @param older - Oldest-first page that precedes `prev`
 */
export function prependOlder(prev: readonly ChatMessage[], older: readonly ChatMessage[]): ChatMessage[] {
  const seen = new Set(prev.map((m) => m.id));
  const fresh = older.filter((m) => !seen.has(m.id));
  return [...fresh, ...prev];
}

/**
 * Replaces the list with a fresh server page while keeping in-flight
 * optimistic bubbles (a fetch that lands mid-send must not drop them).
 *
 * @param prev - Current list
 * @param fresh - Oldest-first page from the server
 */
export function replaceWithFetched(prev: readonly ChatMessage[], fresh: readonly ChatMessage[]): ChatMessage[] {
  const ids = new Set(fresh.map((m) => m.id));
  const pending = prev.filter((m) => isTempMessage(m) && !ids.has(m.id));
  return [...fresh, ...pending];
}

/**
 * Removes a message by id.
 *
 * @param prev - Current list
 * @param id - The id to drop
 */
export function removeMessage(prev: readonly ChatMessage[], id: string): ChatMessage[] {
  return prev.filter((m) => m.id !== id);
}
