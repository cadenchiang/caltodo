/**
 * Tests for onboarding progress persistence.
 *
 * Guards the resume path that stops a reload dumping users back at "welcome",
 * and the validation that keeps a bad snapshot from stranding them on a step
 * the flow cannot render.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ONBOARDING_STEPS,
  isOnboardingStep,
  isOnboardingPlatform,
  normalizeProgress,
  loadProgress,
  saveProgress,
  clearProgress,
} from "@/lib/onboarding-progress";

const KEY = "caltodo_onboarding_progress_v1";

/** Minimal in-memory localStorage stand-in; the suite runs under node. */
function installStorage(impl?: Partial<Storage>) {
  const data = new Map<string, string>();
  const store: Storage = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    get length() { return data.size; },
    ...impl,
  } as Storage;
  vi.stubGlobal("localStorage", store);
  return data;
}

beforeEach(() => { installStorage(); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("step and platform guards", () => {
  it("accepts every canonical step", () => {
    for (const step of ONBOARDING_STEPS) expect(isOnboardingStep(step)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isOnboardingStep("nope")).toBe(false);
    expect(isOnboardingStep(undefined)).toBe(false);
    expect(isOnboardingStep(3)).toBe(false);
    expect(isOnboardingPlatform("welcome")).toBe(false);
    expect(isOnboardingPlatform("canvas")).toBe(true);
  });
});

describe("normalizeProgress", () => {
  const fresh = (over: Record<string, unknown> = {}) => ({
    step: "school",
    platforms: ["canvas"],
    school: "UC Berkeley",
    referral: "TikTok",
    savedAt: Date.now(),
    ...over,
  });

  it("accepts a well-formed snapshot", () => {
    expect(normalizeProgress(fresh())).toMatchObject({
      step: "school", platforms: ["canvas"], school: "UC Berkeley", referral: "TikTok",
    });
  });

  it("rejects non-objects", () => {
    expect(normalizeProgress(null)).toBeNull();
    expect(normalizeProgress("welcome")).toBeNull();
  });

  it("rejects an unknown step, since there is nowhere safe to resume", () => {
    expect(normalizeProgress(fresh({ step: "payment" }))).toBeNull();
  });

  it("rejects a snapshot older than the TTL", () => {
    const old = Date.now() - 31 * 24 * 60 * 60 * 1000;
    expect(normalizeProgress(fresh({ savedAt: old }))).toBeNull();
  });

  it("rejects a snapshot with no timestamp", () => {
    expect(normalizeProgress(fresh({ savedAt: undefined }))).toBeNull();
  });

  it("drops unknown platforms rather than failing the whole snapshot", () => {
    const out = normalizeProgress(fresh({ platforms: ["canvas", "myspace"] }));
    expect(out?.platforms).toEqual(["canvas"]);
  });

  it("rejects a platform step whose platform is no longer selected", () => {
    // The step list is derived from platforms, so this step would render nothing.
    expect(normalizeProgress(fresh({ step: "gradescope", platforms: ["canvas"] }))).toBeNull();
  });

  it("accepts a platform step that is still selected", () => {
    const out = normalizeProgress(fresh({ step: "gradescope", platforms: ["canvas", "gradescope"] }));
    expect(out?.step).toBe("gradescope");
  });

  it("defaults missing free-text answers to empty strings", () => {
    const out = normalizeProgress({ step: "welcome", savedAt: Date.now() });
    expect(out).toMatchObject({ school: "", referral: "", platforms: [] });
  });
});

describe("round trip", () => {
  it("saves and restores a position", () => {
    saveProgress({ step: "referral", platforms: ["canvas", "syllabus"], school: "MIT", referral: "friend" });
    expect(loadProgress()).toMatchObject({
      step: "referral", platforms: ["canvas", "syllabus"], school: "MIT", referral: "friend",
    });
  });

  it("stamps savedAt on write", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-31T12:00:00Z"));
    saveProgress({ step: "welcome", platforms: [], school: "", referral: "" });
    expect(loadProgress()?.savedAt).toBe(Date.parse("2026-08-31T12:00:00Z"));
  });

  it("returns null when nothing was saved", () => {
    expect(loadProgress()).toBeNull();
  });

  it("returns null on corrupt JSON instead of throwing", () => {
    localStorage.setItem(KEY, "{not json");
    expect(() => loadProgress()).not.toThrow();
    expect(loadProgress()).toBeNull();
  });

  it("clears a saved position", () => {
    saveProgress({ step: "platforms", platforms: [], school: "", referral: "" });
    clearProgress();
    expect(loadProgress()).toBeNull();
  });
});

describe("hostile storage", () => {
  it("survives a getItem that throws", () => {
    installStorage({ getItem: () => { throw new Error("SecurityError"); } });
    expect(() => loadProgress()).not.toThrow();
    expect(loadProgress()).toBeNull();
  });

  it("survives a setItem that throws, e.g. quota exceeded", () => {
    installStorage({ setItem: () => { throw new Error("QuotaExceededError"); } });
    expect(() =>
      saveProgress({ step: "welcome", platforms: [], school: "", referral: "" })
    ).not.toThrow();
  });

  it("survives a removeItem that throws", () => {
    installStorage({ removeItem: () => { throw new Error("SecurityError"); } });
    expect(() => clearProgress()).not.toThrow();
  });

  it("survives localStorage being absent entirely", () => {
    vi.unstubAllGlobals();
    expect(loadProgress()).toBeNull();
    expect(() => saveProgress({ step: "welcome", platforms: [], school: "", referral: "" })).not.toThrow();
    expect(() => clearProgress()).not.toThrow();
  });
});
