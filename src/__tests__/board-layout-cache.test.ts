/**
 * Tests for board-layout-cache.ts — stale-while-revalidate localStorage
 * cache powering instant first paint on /app/home.
 *
 * Covers: readPersistedLayout null paths (missing/corrupt/version mismatch),
 * writeLayoutCache round-trip, clearLayoutCache removal, and quota-failure
 * resilience on writes.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { STORAGE_KEY, SCHEMA_VERSION } from "@/lib/board-layout-types";
import {
  readPersistedLayout,
  writeLayoutCache,
  clearLayoutCache,
} from "@/lib/board-layout-cache";
import type { PersistedLayout } from "@/lib/board-layout-types";
import type { WidgetType } from "@/lib/widget-types";

/** In-memory localStorage polyfill for Node test environment. */
let store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});
// Satisfy `typeof window === "undefined"` guards in the cache module
if (typeof globalThis.window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = globalThis;
}

/** Builds a minimal valid PersistedLayout at the current schema version. */
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
    const envelope = {
      version: SCHEMA_VERSION + 1,
      data: buildLayout(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    expect(readPersistedLayout()).toBeNull();
  });

  it("returns null when envelope is missing the data field", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION })
    );
    expect(readPersistedLayout()).toBeNull();
  });

  it("returns null when widgets is not an array", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        data: { widgets: "bad", layouts: {} },
      })
    );
    expect(readPersistedLayout()).toBeNull();
  });

  it("returns null when layouts is missing", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        data: { widgets: [] },
      })
    );
    expect(readPersistedLayout()).toBeNull();
  });

  it("reads a valid layout round-trip", () => {
    writeLayoutCache(buildLayout());
    const result = readPersistedLayout();
    expect(result).not.toBeNull();
    expect(result!.boardTitle).toBe("My Board");
    expect(result!.widgets).toHaveLength(1);
    expect(result!.widgets[0].id).toBe("w1");
    expect(result!.layouts.lg).toHaveLength(1);
  });

  it("preserves arbitrary boardEmoji values (no sanitization)", () => {
    writeLayoutCache(buildLayout({ boardEmoji: "lucide:star" }));
    expect(readPersistedLayout()!.boardEmoji).toBe("lucide:star");
  });
});

describe("writeLayoutCache", () => {
  it("writes the layout inside a versioned envelope", () => {
    writeLayoutCache(buildLayout());
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.version).toBe(SCHEMA_VERSION);
    expect(parsed.data.boardTitle).toBe("My Board");
  });

  it("stores the optional userId on the envelope when provided", () => {
    writeLayoutCache(buildLayout(), "user-abc");
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(stored!);
    expect(parsed.userId).toBe("user-abc");
  });

  it("does not throw when localStorage.setItem fails (quota exceeded)", () => {
    const original = localStorageMock.setItem;
    localStorageMock.setItem = () => {
      throw new Error("QuotaExceeded");
    };
    expect(() => writeLayoutCache(buildLayout())).not.toThrow();
    localStorageMock.setItem = original;
  });
});

describe("clearLayoutCache", () => {
  it("removes the stored layout", () => {
    writeLayoutCache(buildLayout());
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    clearLayoutCache();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("is a no-op when nothing is stored", () => {
    expect(() => clearLayoutCache()).not.toThrow();
  });
});
