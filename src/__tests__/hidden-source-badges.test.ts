/**
 * Tests for the dismissed-source-badge store.
 * Storage is cleared between cases so each starts from a fresh device.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  readHiddenSourceBadges,
  hideSourceBadge,
  showSourceBadge,
  visibleSourceBadges,
  subscribeHiddenSourceBadges,
  getHiddenSourceBadges,
  getServerHiddenSourceBadges,
} from "@/lib/hidden-source-badges";

const KEY = "caltodo_hidden_source_badges";

/** Minimal in-memory localStorage stand-in, matching hidden-tags.test.ts. */
function makeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  };
}

let storage: ReturnType<typeof makeStorage>;

beforeEach(() => {
  storage = makeStorage();
  vi.stubGlobal("window", { localStorage: storage });
});

afterEach(() => vi.unstubAllGlobals());

describe("readHiddenSourceBadges", () => {
  it("starts empty", () => {
    expect(readHiddenSourceBadges().size).toBe(0);
  });

  it("reads what was stored, lowercased", () => {
    storage.setItem(KEY, JSON.stringify(["bCourses"]));
    expect(readHiddenSourceBadges().has("bcourses")).toBe(true);
  });

  it("returns empty rather than throwing on corrupt JSON", () => {
    storage.setItem(KEY, "{not json");
    expect(readHiddenSourceBadges().size).toBe(0);
  });

  it("returns empty when the stored value is not an array", () => {
    storage.setItem(KEY, JSON.stringify({ bcourses: true }));
    expect(readHiddenSourceBadges().size).toBe(0);
  });

  it("skips non-string entries", () => {
    storage.setItem(KEY, JSON.stringify(["bCourses", 7, null]));
    const hidden = readHiddenSourceBadges();
    expect(hidden.size).toBe(1);
    expect(hidden.has("bcourses")).toBe(true);
  });
});

describe("hideSourceBadge / showSourceBadge", () => {
  it("dismisses a badge and brings it back", () => {
    hideSourceBadge("bCourses");
    expect(readHiddenSourceBadges().has("bcourses")).toBe(true);
    showSourceBadge("bCourses");
    expect(readHiddenSourceBadges().has("bcourses")).toBe(false);
  });

  it("matches case-insensitively in both directions", () => {
    hideSourceBadge("BCOURSES");
    expect(readHiddenSourceBadges().has("bcourses")).toBe(true);
    showSourceBadge("bcourses");
    expect(readHiddenSourceBadges().size).toBe(0);
  });

  it("dismissing twice leaves one entry", () => {
    hideSourceBadge("bCourses");
    hideSourceBadge("bCourses");
    expect(readHiddenSourceBadges().size).toBe(1);
  });

  it("keeps other badges when one is dismissed", () => {
    hideSourceBadge("bCourses");
    hideSourceBadge("Gradescope");
    showSourceBadge("bCourses");
    expect([...readHiddenSourceBadges()]).toEqual(["gradescope"]);
  });

  it("still reports the change when storage refuses the write", () => {
    // A full quota must not make the dismissal look like it failed.
    storage.setItem = () => {
      throw new Error("QuotaExceeded");
    };
    expect(hideSourceBadge("bCourses").has("bcourses")).toBe(true);
  });
});

describe("visibleSourceBadges", () => {
  const badges = [
    { label: "bCourses", className: "" },
    { label: "Submitted", className: "" },
  ];

  it("keeps everything when nothing is dismissed", () => {
    expect(visibleSourceBadges(badges, new Set())).toHaveLength(2);
  });

  it("drops a dismissed badge", () => {
    const left = visibleSourceBadges(badges, new Set(["bcourses"]));
    expect(left.map((b) => b.label)).toEqual(["Submitted"]);
  });

  it("matches the dismissed set case-insensitively", () => {
    expect(visibleSourceBadges(badges, new Set(["submitted"]))).toHaveLength(1);
  });

  it("returns an empty list when all are dismissed", () => {
    expect(visibleSourceBadges(badges, new Set(["bcourses", "submitted"]))).toEqual([]);
  });
});

describe("external store", () => {
  it("hands the server a stable empty set", () => {
    // Identity has to hold across calls or useSyncExternalStore loops.
    expect(getServerHiddenSourceBadges()).toBe(getServerHiddenSourceBadges());
    expect(getServerHiddenSourceBadges().size).toBe(0);
  });

  it("keeps the same snapshot object until something changes", () => {
    const first = getHiddenSourceBadges();
    expect(getHiddenSourceBadges()).toBe(first);
  });

  it("hands back a new snapshot after a dismissal", () => {
    const before = getHiddenSourceBadges();
    hideSourceBadge("bCourses");
    const after = getHiddenSourceBadges();
    expect(after).not.toBe(before);
    expect(after.has("bcourses")).toBe(true);
  });

  it("notifies subscribers on dismiss and on restore", () => {
    let calls = 0;
    const unsubscribe = subscribeHiddenSourceBadges(() => calls++);
    hideSourceBadge("bCourses");
    showSourceBadge("bCourses");
    expect(calls).toBe(2);
    unsubscribe();
  });

  it("stops notifying once unsubscribed", () => {
    let calls = 0;
    const unsubscribe = subscribeHiddenSourceBadges(() => calls++);
    unsubscribe();
    hideSourceBadge("bCourses");
    expect(calls).toBe(0);
  });
});
