/**
 * Tests for the week-start preference store.
 * Covers parsing, label rotation, persistence, subscriber notification, and
 * the user_metadata hydration rule.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startOfWeek, addDays, format } from "date-fns";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: { updateUser: vi.fn().mockResolvedValue({ error: null }) },
  })),
}));

import {
  parseWeekStart,
  weekdayLabels,
  setWeekStart,
  subscribeWeekStart,
  getWeekStartSnapshot,
  getWeekStartServerSnapshot,
  hydrateWeekStartFromMetadata,
  DEFAULT_WEEK_START,
} from "@/lib/week-start";

/** Minimal in-memory localStorage stand-in. */
function makeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    get size() {
      return map.size;
    },
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", makeStorage());
  vi.stubGlobal("window", {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    localStorage,
  });
  vi.stubGlobal("document", { cookie: "" });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseWeekStart", () => {
  it("accepts the two valid days as numbers and strings", () => {
    expect(parseWeekStart(0)).toBe(0);
    expect(parseWeekStart(1)).toBe(1);
    expect(parseWeekStart("0")).toBe(0);
    expect(parseWeekStart("1")).toBe(1);
  });

  it("rejects anything else", () => {
    for (const bad of [2, -1, "sunday", "", null, undefined, {}, true]) {
      expect(parseWeekStart(bad)).toBeNull();
    }
  });
});

describe("weekdayLabels", () => {
  it("starts on Monday for the Monday preference", () => {
    expect(weekdayLabels(1)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("starts on Sunday for the Sunday preference", () => {
    expect(weekdayLabels(0)).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("always returns seven distinct days", () => {
    for (const start of [0, 1] as const) {
      const labels = weekdayLabels(start);
      expect(labels).toHaveLength(7);
      expect(new Set(labels).size).toBe(7);
    }
  });

  it("returns a fresh array so callers cannot corrupt the source", () => {
    const first = weekdayLabels(1);
    first[0] = "MUTATED";
    expect(weekdayLabels(1)[0]).toBe("Mon");
  });
});

describe("labels line up with the grid columns", () => {
  it("names the correct weekday for every column, both preferences", () => {
    // The calendar builds its columns with date-fns startOfWeek and labels
    // them with weekdayLabels. If those two disagree the whole grid is
    // silently off by a day, which is the bug this preference could most
    // easily introduce.
    for (const weekStart of [0, 1] as const) {
      const labels = weekdayLabels(weekStart);
      const first = startOfWeek(new Date(2026, 7, 15), { weekStartsOn: weekStart });
      for (let i = 0; i < 7; i++) {
        expect(format(addDays(first, i), "EEE")).toBe(labels[i]);
      }
    }
  });

  it("puts the preferred day in the first column", () => {
    expect(format(startOfWeek(new Date(2026, 7, 15), { weekStartsOn: 0 }), "EEE")).toBe("Sun");
    expect(format(startOfWeek(new Date(2026, 7, 15), { weekStartsOn: 1 }), "EEE")).toBe("Mon");
  });
});

describe("defaults", () => {
  it("defaults to Monday, preserving existing behavior", () => {
    expect(DEFAULT_WEEK_START).toBe(1);
    expect(getWeekStartServerSnapshot()).toBe(1);
  });
});

describe("setWeekStart", () => {
  it("persists the choice and reflects it in the snapshot", () => {
    setWeekStart(0);
    expect(getWeekStartSnapshot()).toBe(0);
    expect(localStorage.getItem("caltodo_week_start")).toBe("0");

    setWeekStart(1);
    expect(getWeekStartSnapshot()).toBe(1);
    expect(localStorage.getItem("caltodo_week_start")).toBe("1");
  });

  it("notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeWeekStart(listener);

    setWeekStart(0);
    expect(listener).toHaveBeenCalledTimes(1);

    setWeekStart(1);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setWeekStart(0);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("still applies the choice when storage throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    });
    expect(() => setWeekStart(0)).not.toThrow();
    expect(getWeekStartSnapshot()).toBe(0);
  });
});

describe("hydrateWeekStartFromMetadata", () => {
  it("adopts the remote value when nothing is stored locally", () => {
    setWeekStart(1);
    localStorage.removeItem("caltodo_week_start");

    hydrateWeekStartFromMetadata({ week_start: 0 });
    expect(getWeekStartSnapshot()).toBe(0);
    expect(localStorage.getItem("caltodo_week_start")).toBe("0");
  });

  it("does not override a choice already made on this device", () => {
    setWeekStart(1);
    hydrateWeekStartFromMetadata({ week_start: 0 });
    expect(getWeekStartSnapshot()).toBe(1);
  });

  it("ignores missing or malformed remote values", () => {
    setWeekStart(1);
    localStorage.removeItem("caltodo_week_start");

    hydrateWeekStartFromMetadata({});
    hydrateWeekStartFromMetadata({ week_start: "whenever" });
    expect(getWeekStartSnapshot()).toBe(1);
  });

  it("notifies subscribers when it adopts a remote value", () => {
    setWeekStart(1);
    localStorage.removeItem("caltodo_week_start");

    const listener = vi.fn();
    subscribeWeekStart(listener);
    hydrateWeekStartFromMetadata({ week_start: 0 });
    expect(listener).toHaveBeenCalled();
  });
});
