/**
 * Tests for the pure message-list operations (M19, M21, finding 20).
 *
 * Optimistic bubbles are matched by client nonce, never by author; ids are
 * never duplicated across pages or broadcasts; the cache keeps the newest
 * 200 settled messages.
 */

import { describe, it, expect } from "vitest";
import {
  mergeIncoming, settleOptimistic, markFailed, prependOlder, replaceWithFetched, removeMessage, TEMP_ID_PREFIX,
} from "@/lib/chat-message-merge";
import { trimForCache, CACHE_LIMIT } from "@/hooks/chatCache";
import { computeMessageLayout, computeAnonymousNumbers } from "@/lib/chat-message-layout";
import type { ChatMessage } from "@/lib/types";

const msg = (id: string, extra: Partial<ChatMessage> = {}): ChatMessage => ({
  id,
  course_id: "c",
  author_key: "k1",
  author_name: "A",
  body: "hi",
  created_at: "2026-09-23T10:00:00Z",
  updated_at: "2026-09-23T10:00:00Z",
  ...extra,
});

describe("mergeIncoming", () => {
  it("replaces the optimistic bubble that carries the same nonce", () => {
    const temp = msg(`${TEMP_ID_PREFIX}1`, { client_nonce: "n1", _status: "sending" });
    const next = mergeIncoming([temp], msg("real", { client_nonce: "n1" }));
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe("real");
    expect(next[0]._status).toBe("delivered");
  });

  it("does not match by author: a different nonce is a new message", () => {
    const temp = msg(`${TEMP_ID_PREFIX}1`, { client_nonce: "n1", _status: "sending" });
    const next = mergeIncoming([temp], msg("real", { client_nonce: "n2", author_key: "k1" }));
    expect(next.map((m) => m.id)).toEqual([`${TEMP_ID_PREFIX}1`, "real"]);
  });

  it("returns the same list when the id already exists", () => {
    const prev = [msg("a")];
    expect(mergeIncoming(prev, msg("a"))).toBe(prev);
  });
});

describe("settleOptimistic", () => {
  it("swaps the temp for the server row", () => {
    const next = settleOptimistic([msg("t1"), msg("x")], "t1", msg("s1"));
    expect(next.map((m) => m.id)).toEqual(["s1", "x"]);
  });

  it("drops the temp when the broadcast already landed the row", () => {
    const next = settleOptimistic([msg("s1"), msg("t1")], "t1", msg("s1"));
    expect(next.map((m) => m.id)).toEqual(["s1"]);
  });
});

describe("markFailed / removeMessage", () => {
  it("marks and removes by id", () => {
    expect(markFailed([msg("t1")], "t1")[0]._status).toBe("failed");
    expect(removeMessage([msg("a"), msg("b")], "a").map((m) => m.id)).toEqual(["b"]);
  });
});

describe("prependOlder", () => {
  it("dedupes by id so a repeated page never duplicates messages (M19)", () => {
    const prev = [msg("c"), msg("d")];
    const next = prependOlder(prev, [msg("a"), msg("b"), msg("c")]);
    expect(next.map((m) => m.id)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("replaceWithFetched", () => {
  it("keeps in-flight optimistic bubbles", () => {
    const prev = [msg("old"), msg(`${TEMP_ID_PREFIX}1`, { _status: "sending" })];
    const next = replaceWithFetched(prev, [msg("a"), msg("b")]);
    expect(next.map((m) => m.id)).toEqual(["a", "b", `${TEMP_ID_PREFIX}1`]);
  });
});

describe("trimForCache", () => {
  it("keeps the newest 200 settled messages (M21)", () => {
    const many = Array.from({ length: CACHE_LIMIT + 50 }, (_, i) => msg(`m${i}`));
    const kept = trimForCache([...many, msg(`${TEMP_ID_PREFIX}x`)]);
    expect(kept).toHaveLength(CACHE_LIMIT);
    expect(kept[0].id).toBe("m50");
    expect(kept[kept.length - 1].id).toBe(`m${CACHE_LIMIT + 49}`);
  });
});

describe("computeMessageLayout", () => {
  it("groups consecutive messages by author key and breaks on a 15 minute gap", () => {
    const list = [
      msg("a", { author_key: "k1", created_at: "2026-09-23T10:00:00Z" }),
      msg("b", { author_key: "k1", created_at: "2026-09-23T10:01:00Z" }),
      msg("c", { author_key: "k2", created_at: "2026-09-23T10:02:00Z" }),
      msg("d", { author_key: "k2", created_at: "2026-09-23T10:30:00Z" }),
    ];
    const layout = computeMessageLayout(list);
    expect(layout.map((l) => l.showAuthor)).toEqual([true, false, true, true]);
    expect(layout.map((l) => l.isLastInGroup)).toEqual([false, true, true, true]);
    expect(layout.map((l) => l.showTimestamp)).toEqual([true, false, false, true]);
    expect(layout[3].isLastMessage).toBe(true);
  });
});

describe("computeAnonymousNumbers", () => {
  it("numbers anonymous author keys in order of first appearance", () => {
    const list = [
      msg("a", { author_key: "k1", author_name: null }),
      msg("b", { author_key: "k9", author_name: "Named" }),
      msg("c", { author_key: "k2", author_name: null }),
      msg("d", { author_key: "k1", author_name: null }),
    ];
    const numbers = computeAnonymousNumbers(list);
    expect(numbers.get("k1")).toBe(1);
    expect(numbers.get("k2")).toBe(2);
    expect(numbers.has("k9")).toBe(false);
  });
});
