/**
 * Pure layout math for the message list: which bubbles show a timestamp,
 * an author line, a group tail, and the anonymous numbering (#N).
 * Everything keys on author_key; author ids never reach the client.
 *
 * @module chat-message-layout
 */

import type { ChatMessage } from "@/lib/types";

/** Minimum time gap (ms) between messages to show a centered timestamp. */
export const TIMESTAMP_GAP = 15 * 60 * 1000;

/** Per-message layout flags. */
export interface MessageLayout {
  showTimestamp: boolean;
  showAuthor: boolean;
  isLastInGroup: boolean;
  isLastMessage: boolean;
}

/** Whether two ISO timestamps fall on the same calendar day. */
export function sameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/**
 * Computes layout flags for every message in O(N).
 *
 * @param messages - Oldest-first messages
 * @returns One entry per message
 */
export function computeMessageLayout(messages: readonly ChatMessage[]): MessageLayout[] {
  const n = messages.length;
  const layout: MessageLayout[] = new Array(n);
  const times = messages.map((m) => Date.parse(m.created_at));

  for (let i = 0; i < n; i++) {
    const msg = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;
    const dayChanged = !prev || !sameDay(prev.created_at, msg.created_at);
    const timeGap = prev ? times[i] - times[i - 1] : Infinity;
    const showTimestamp = dayChanged || timeGap >= TIMESTAMP_GAP;
    const showAuthor = !prev || showTimestamp || prev.author_key !== msg.author_key;
    layout[i] = { showTimestamp, showAuthor, isLastInGroup: false, isLastMessage: i === n - 1 };
  }

  for (let i = 0; i < n; i++) {
    const msg = messages[i];
    const next = i + 1 < n ? messages[i + 1] : null;
    const nextDayChanged = !next || !sameDay(msg.created_at, next.created_at);
    const nextGap = next ? times[i + 1] - times[i] : Infinity;
    const nextHasTimestamp = nextDayChanged || nextGap >= TIMESTAMP_GAP;
    layout[i].isLastInGroup = !next || nextHasTimestamp || next.author_key !== msg.author_key;
  }

  return layout;
}

/**
 * Numbers anonymous authors in order of first appearance: the first
 * anonymous author is #1, the second #2, and so on. The same author_key
 * always gets the same number within the loaded list.
 *
 * @param messages - Oldest-first messages
 * @returns author_key to number
 */
export function computeAnonymousNumbers(messages: readonly ChatMessage[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const msg of messages) {
    if (!msg.author_name && !map.has(msg.author_key)) map.set(msg.author_key, map.size + 1);
  }
  return map;
}
