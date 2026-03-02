/**
 * Tests for updateBoardCacheTimestamp utility.
 * Validates sessionStorage updates and custom event dispatch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateBoardCacheTimestamp } from "@/lib/calchat-cache";

const CACHE_KEY = "discussion_boards_cache_v2";

/** Creates a fake sessionStorage cache with the given boards. */
function buildCache(boards: Array<{ course: { id: string }; last_message_at?: string | null }>) {
  return JSON.stringify({ boards });
}

describe("updateBoardCacheTimestamp", () => {
  let storage: Record<string, string>;
  let dispatchedEvents: CustomEvent[];

  beforeEach(() => {
    storage = {};
    dispatchedEvents = [];

    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; },
    });

    vi.stubGlobal("window", {
      ...globalThis.window,
      dispatchEvent: (event: CustomEvent) => {
        dispatchedEvents.push(event);
        return true;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("updates last_message_at for the matching board", () => {
    storage[CACHE_KEY] = buildCache([
      { course: { id: "course-1" }, last_message_at: "2024-01-01T00:00:00Z" },
      { course: { id: "course-2" }, last_message_at: null },
    ]);

    updateBoardCacheTimestamp("course-1", CACHE_KEY);

    const updated = JSON.parse(storage[CACHE_KEY]);
    const board1 = updated.boards.find((b: { course: { id: string } }) => b.course.id === "course-1");
    expect(board1.last_message_at).not.toBe("2024-01-01T00:00:00Z");
    expect(new Date(board1.last_message_at).getTime()).toBeGreaterThan(0);
  });

  it("does not modify other boards' timestamps", () => {
    const originalTs = "2024-06-15T12:00:00Z";
    storage[CACHE_KEY] = buildCache([
      { course: { id: "course-1" }, last_message_at: "2024-01-01T00:00:00Z" },
      { course: { id: "course-2" }, last_message_at: originalTs },
    ]);

    updateBoardCacheTimestamp("course-1", CACHE_KEY);

    const updated = JSON.parse(storage[CACHE_KEY]);
    const board2 = updated.boards.find((b: { course: { id: string } }) => b.course.id === "course-2");
    expect(board2.last_message_at).toBe(originalTs);
  });

  it("does not throw when cache is empty", () => {
    expect(() => updateBoardCacheTimestamp("course-1", CACHE_KEY)).not.toThrow();
  });

  it("does not throw on invalid JSON in cache", () => {
    storage[CACHE_KEY] = "not valid json{{{";
    expect(() => updateBoardCacheTimestamp("course-1", CACHE_KEY)).not.toThrow();
  });

  it("dispatches calchat-read-update event with courseId", () => {
    storage[CACHE_KEY] = buildCache([{ course: { id: "course-1" }, last_message_at: null }]);

    updateBoardCacheTimestamp("course-1", CACHE_KEY);

    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0].type).toBe("calchat-read-update");
    expect(dispatchedEvents[0].detail).toEqual({ courseId: "course-1" });
  });

  it("dispatches event even when sessionStorage is unavailable", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => { throw new Error("unavailable"); },
      setItem: () => { throw new Error("unavailable"); },
    });

    updateBoardCacheTimestamp("course-1", CACHE_KEY);

    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0].type).toBe("calchat-read-update");
  });
});
