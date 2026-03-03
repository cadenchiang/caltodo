/**
 * Tests for board-layout-cache.ts — localStorage read/write helpers.
 * Validates readPersistedLayout (null cases, migrations, type filtering)
 * and writeLayoutCache.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { STORAGE_KEY, SCHEMA_VERSION } from "@/lib/board-layout-types";

// Mock widget-types to control SUPPORTED_TYPES
vi.mock("@/lib/widget-types", () => ({
  WIDGET_REGISTRY: {
    "task-list": { minW: 2, defaultW: 4, defaultH: 4, minH: 2 },
    "clock": { minW: 1, defaultW: 2, defaultH: 2, minH: 1 },
  },
}));

import { readPersistedLayout, writeLayoutCache } from "@/lib/board-layout-cache";
import type { PersistedLayout } from "@/lib/board-layout-types";
import type { WidgetType } from "@/lib/widget-types";

// Mock localStorage for Node environment
let store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { store = {}; },
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });
// Satisfy `typeof window === "undefined"` guards in cache module
if (typeof globalThis.window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = globalThis;
}

/** Builds a minimal valid PersistedLayout at current schema version. */
function buildLayout(overrides: Partial<PersistedLayout> = {}): PersistedLayout {
  return {
    version: SCHEMA_VERSION,
    widgets: [{ id: "w1", type: "task-list" as WidgetType, config: {} }],
    layouts: { lg: [{ i: "w1", x: 0, y: 0, w: 4, h: 4 }] },
    boardTitle: "My Board",
    boardDescription: "desc",
    coverImageUrl: "",
    boardEmoji: "\u{1F4D6}",
    iconSize: "md",
    titleFontFamily: "",
    titleTextColor: "",
    titleFontSize: "lg",
    coverHeight: 220,
    coverPositionY: 50,
    savedImages: [],
    updatedAt: 1000,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("readPersistedLayout", () => {
  it("returns null when localStorage is empty", () => {
    expect(readPersistedLayout()).toBeNull();
  });

  it("returns null for corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(readPersistedLayout()).toBeNull();
  });

  it("returns null when version does not match SCHEMA_VERSION", () => {
    const data = buildLayout({ version: 999 });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    expect(readPersistedLayout()).toBeNull();
  });

  it("returns null when widgets is not an array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, widgets: "bad", layouts: {} }));
    expect(readPersistedLayout()).toBeNull();
  });

  it("reads a valid layout successfully", () => {
    const data = buildLayout();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const result = readPersistedLayout();
    expect(result).not.toBeNull();
    expect(result!.boardTitle).toBe("My Board");
    expect(result!.widgets).toHaveLength(1);
  });

  it("filters out unsupported widget types", () => {
    const data = buildLayout({
      widgets: [
        { id: "w1", type: "task-list" as WidgetType, config: {} },
        { id: "w2", type: "removed-widget" as WidgetType, config: {} },
      ],
      layouts: {
        lg: [
          { i: "w1", x: 0, y: 0, w: 4, h: 4 },
          { i: "w2", x: 4, y: 0, w: 2, h: 2 },
        ],
      },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const result = readPersistedLayout();
    expect(result!.widgets).toHaveLength(1);
    expect(result!.widgets[0].id).toBe("w1");
    expect(result!.layouts.lg).toHaveLength(1);
  });

  it("sanitizes corrupted boardEmoji (plain ASCII)", () => {
    const data = buildLayout({ boardEmoji: "xl" });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const result = readPersistedLayout();
    expect(result!.boardEmoji).toBe("\u{1F4D6}");
  });

  it("preserves lucide: prefix emoji", () => {
    const data = buildLayout({ boardEmoji: "lucide:star" });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const result = readPersistedLayout();
    expect(result!.boardEmoji).toBe("lucide:star");
  });

  it("sanitizes boardDescription that looks like a URL", () => {
    const data = buildLayout({ boardDescription: "https://evil.com" });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const result = readPersistedLayout();
    expect(result!.boardDescription).toBe("The secret of getting ahead is getting started.");
  });
});

describe("writeLayoutCache", () => {
  it("writes data to localStorage under STORAGE_KEY", () => {
    const data = buildLayout();
    writeLayoutCache(data);
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.boardTitle).toBe("My Board");
  });

  it("does not throw when localStorage is full", () => {
    const original = localStorageMock.setItem;
    localStorageMock.setItem = () => { throw new Error("QuotaExceeded"); };
    expect(() => writeLayoutCache(buildLayout())).not.toThrow();
    localStorageMock.setItem = original;
  });
});
