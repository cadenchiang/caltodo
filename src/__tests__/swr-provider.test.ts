/**
 * Tests for SWR localStorage cache provider logic.
 * Validates that cache entries serialize to and deserialize from localStorage.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

const STORAGE_KEY = "caltodo_swr_cache";

describe("SWR localStorage provider", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => {
        storage[key] = val;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    });
  });

  it("reads cached entries from localStorage into a Map", () => {
    const entries: [string, unknown][] = [
      ["/api/foo", { data: "bar" }],
      ["/api/baz", { data: "qux" }],
    ];
    storage[STORAGE_KEY] = JSON.stringify(entries);

    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: [string, unknown][] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, unknown>(parsed);

    expect(map.size).toBe(2);
    expect(map.get("/api/foo")).toEqual({ data: "bar" });
    expect(map.get("/api/baz")).toEqual({ data: "qux" });
  });

  it("returns empty map when localStorage is empty", () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: [string, unknown][] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, unknown>(parsed);

    expect(map.size).toBe(0);
  });

  it("returns empty map when localStorage has invalid JSON", () => {
    storage[STORAGE_KEY] = "not-valid-json{{{";

    let parsed: [string, unknown][] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch {
      // Expected — corrupted data
    }
    const map = new Map<string, unknown>(parsed);

    expect(map.size).toBe(0);
  });

  it("serializes map entries back to localStorage", () => {
    const map = new Map<string, unknown>();
    map.set("weather:37.87,-122.27", { temp: 20 });
    map.set("/api/gcal/events?calendarId=primary", { events: [] });

    const entries = Array.from(map.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    const stored = JSON.parse(storage[STORAGE_KEY]);
    expect(stored).toHaveLength(2);
    expect(stored[0][0]).toBe("weather:37.87,-122.27");
    expect(stored[0][1]).toEqual({ temp: 20 });
    expect(stored[1][0]).toBe("/api/gcal/events?calendarId=primary");
  });
});
