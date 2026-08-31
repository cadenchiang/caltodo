/**
 * Tests for first-meaningful-action tracking.
 *
 * The event must fire exactly once per device. Firing repeatedly would make
 * the activation funnel meaningless, and never firing would leave the drop it
 * was built to expose invisible again.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

const tracked: Array<{ name: string; props?: Record<string, unknown> }> = [];
vi.mock("@/lib/analytics", () => ({
  trackEvent: (name: string, props?: Record<string, unknown>) => {
    tracked.push({ name, props });
  },
}));

import { markActivated, isActivated, resetActivation } from "@/lib/activation";

/** Minimal in-memory localStorage stand-in; the suite runs under node. */
function installStorage(impl?: Partial<Storage>) {
  const data = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() { return data.size; },
    ...impl,
  } as Storage);
}

beforeEach(() => {
  tracked.length = 0;
  installStorage();
  resetActivation();
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("markActivated", () => {
  it("emits user_activated on the first action", () => {
    expect(markActivated("task_created")).toBe(true);
    expect(tracked).toEqual([{ name: "user_activated", props: { source: "task_created" } }]);
  });

  it("records which action activated the user", () => {
    markActivated("task_completed");
    expect(tracked[0].props).toEqual({ source: "task_completed" });
  });

  it("does not fire twice", () => {
    expect(markActivated("task_created")).toBe(true);
    expect(markActivated("task_completed")).toBe(false);
    expect(markActivated("task_updated")).toBe(false);
    expect(tracked).toHaveLength(1);
  });

  it("stays quiet across a fresh module state, using persisted storage", () => {
    markActivated("task_created");
    tracked.length = 0;
    // Simulate a new page load: session flag cleared, storage retained.
    const persisted = localStorage.getItem("caltodo_activated_v1");
    expect(persisted).not.toBeNull();
    expect(isActivated()).toBe(true);
    expect(markActivated("task_created")).toBe(false);
    expect(tracked).toHaveLength(0);
  });
});

describe("isActivated", () => {
  it("is false before any action", () => {
    expect(isActivated()).toBe(false);
  });

  it("is true after one", () => {
    markActivated("task_updated");
    expect(isActivated()).toBe(true);
  });
});

describe("resetActivation", () => {
  it("allows the event to fire again, for a new signed-in user", () => {
    markActivated("task_created");
    resetActivation();
    expect(isActivated()).toBe(false);
    expect(markActivated("task_created")).toBe(true);
    expect(tracked).toHaveLength(2);
  });
});

describe("hostile storage", () => {
  it("still fires exactly once when storage cannot be written", () => {
    installStorage({
      setItem: () => { throw new Error("QuotaExceededError"); },
      getItem: () => null,
    });
    resetActivation();
    expect(() => markActivated("task_created")).not.toThrow();
    // The session backstop bounds it, rather than firing on every action.
    markActivated("task_completed");
    markActivated("task_updated");
    expect(tracked).toHaveLength(1);
  });

  it("survives a getItem that throws", () => {
    installStorage({ getItem: () => { throw new Error("SecurityError"); } });
    resetActivation();
    expect(() => isActivated()).not.toThrow();
    expect(isActivated()).toBe(false);
  });

  it("survives localStorage being absent entirely", () => {
    vi.unstubAllGlobals();
    expect(() => resetActivation()).not.toThrow();
    expect(isActivated()).toBe(false);
    expect(() => markActivated("task_created")).not.toThrow();
  });
});

describe("wiring", () => {
  const ROOT = path.resolve(__dirname, "../..");
  const ctx = fs.readFileSync(path.join(ROOT, "src/contexts/TaskContext.tsx"), "utf8");
  const analytics = fs.readFileSync(path.join(ROOT, "src/lib/analytics.ts"), "utf8");

  it("registers the event name so it is type-checked", () => {
    expect(analytics).toContain('| "user_activated"');
  });

  it("is called from every task action that counts as usage", () => {
    expect(ctx).toMatch(/trackEvent\("task_created"\);\s*markActivated\("task_created"\)/);
    expect(ctx).toMatch(/trackEvent\("task_updated"\);\s*markActivated\("task_updated"\)/);
    expect(ctx).toMatch(/if \(willComplete\) markActivated\("task_completed"\)/);
  });

  it("does not treat un-completing a task as activation", () => {
    // Guarded on willComplete, so ticking a box off is not a first action.
    expect(ctx).not.toMatch(/markActivated\("task_uncompleted"\)/);
  });
});
