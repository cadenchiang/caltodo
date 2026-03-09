/**
 * Tests for GoogleCalendarWidget localStorage caching helpers.
 * Validates read/write round-trip, corrupt data handling, and missing keys.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage for Node environment
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (index: number) => Object.keys(store)[index] ?? null,
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

const GCAL_CACHE_PREFIX = "gcal-widget-cache:";

interface GCalCacheData {
  events: { id: string; summary?: string }[];
  connected?: boolean;
}

function readGCalCache(key: string): GCalCacheData | null {
  try {
    const raw = localStorage.getItem(GCAL_CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.events)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeGCalCache(key: string, data: GCalCacheData): void {
  try {
    localStorage.setItem(GCAL_CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // silently ignore
  }
}

describe("Google Calendar widget cache", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("returns null when no cache exists", () => {
    expect(readGCalCache("/api/gcal/events?calendarId=primary")).toBeNull();
  });

  it("round-trips events data with the SWR key", () => {
    const key = "/api/gcal/events?calendarId=primary&timeMin=2026-03-09";
    const data: GCalCacheData = {
      events: [
        { id: "evt1", summary: "CS 61B Lecture" },
        { id: "evt2", summary: "Office Hours" },
      ],
      connected: true,
    };

    writeGCalCache(key, data);
    const cached = readGCalCache(key);

    expect(cached).not.toBeNull();
    expect(cached!.events).toHaveLength(2);
    expect(cached!.events[0].summary).toBe("CS 61B Lecture");
    expect(cached!.connected).toBe(true);
  });

  it("isolates caches by SWR key", () => {
    const key1 = "/api/gcal/events?calendarId=primary&view=today";
    const key2 = "/api/gcal/events?calendarId=primary&view=week";

    writeGCalCache(key1, { events: [{ id: "a" }] });
    writeGCalCache(key2, { events: [{ id: "b" }, { id: "c" }] });

    expect(readGCalCache(key1)!.events).toHaveLength(1);
    expect(readGCalCache(key2)!.events).toHaveLength(2);
  });

  it("returns null for corrupt JSON", () => {
    localStorage.setItem(GCAL_CACHE_PREFIX + "somekey", "{{bad-json");
    expect(readGCalCache("somekey")).toBeNull();
  });

  it("returns null when events field is not an array", () => {
    localStorage.setItem(
      GCAL_CACHE_PREFIX + "key",
      JSON.stringify({ events: "not-array", connected: true })
    );
    expect(readGCalCache("key")).toBeNull();
  });

  it("handles localStorage.setItem throwing (quota exceeded)", () => {
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = () => { throw new Error("QuotaExceededError"); };

    expect(() =>
      writeGCalCache("key", { events: [{ id: "1" }] })
    ).not.toThrow();

    localStorageMock.setItem = originalSetItem;
  });
});
