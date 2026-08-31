/**
 * Tests for the deleted-default-tag store.
 * Covers round-tripping, case-insensitivity, and every failure mode that
 * must degrade to "show all defaults" rather than throwing.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readHiddenTags, hideTag, unhideTag } from "@/lib/hidden-tags";

const KEY = "caltodo_hidden_tags";

/** Minimal in-memory localStorage stand-in, matching week-start.test.ts. */
function makeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  };
}

beforeEach(() => {
  const storage = makeStorage();
  vi.stubGlobal("window", { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("hidden tags", () => {
  it("starts empty", () => {
    expect(readHiddenTags().size).toBe(0);
  });

  it("round-trips a hidden tag", () => {
    hideTag("Canvas");
    expect(readHiddenTags().has("canvas")).toBe(true);
  });

  it("matches case-insensitively", () => {
    hideTag("CANVAS");
    expect(readHiddenTags().has("canvas")).toBe(true);
    unhideTag("canvas");
    expect(readHiddenTags().has("canvas")).toBe(false);
  });

  it("does not duplicate on repeated hides", () => {
    hideTag("Canvas");
    hideTag("canvas");
    expect(readHiddenTags().size).toBe(1);
  });

  it("keeps other tags when one is unhidden", () => {
    hideTag("Canvas");
    hideTag("Pensive");
    unhideTag("Canvas");
    expect([...readHiddenTags()]).toEqual(["pensive"]);
  });

  it("unhiding something absent is a no-op", () => {
    expect(() => unhideTag("nope")).not.toThrow();
    expect(readHiddenTags().size).toBe(0);
  });

  it("returns empty on corrupt JSON", () => {
    window.localStorage.setItem(KEY, "{not json");
    expect(readHiddenTags().size).toBe(0);
  });

  it("returns empty when the stored value is not an array", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ canvas: true }));
    expect(readHiddenTags().size).toBe(0);
  });

  it("ignores non-string entries", () => {
    window.localStorage.setItem(KEY, JSON.stringify(["Canvas", 7, null]));
    expect([...readHiddenTags()]).toEqual(["canvas"]);
  });

  it("returns empty when there is no window at all", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("window", undefined);
    expect(readHiddenTags().size).toBe(0);
  });

  it("survives a throwing getItem", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("SecurityError");
        },
        setItem: () => {},
      },
    });
    expect(readHiddenTags().size).toBe(0);
  });

  it("still reports the tag hidden when setItem throws", () => {
    // The database write has already happened, so the in-memory result must
    // still be correct even though it cannot be persisted.
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
      },
    });
    expect(hideTag("Canvas").has("canvas")).toBe(true);
  });
});
