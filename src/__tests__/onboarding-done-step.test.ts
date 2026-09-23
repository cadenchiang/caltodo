/**
 * Tests for the onboarding recap: buildSyncStats, isCleanSync, and the
 * DoneStep source. The recap used to sit on a fixed ~22 s progress bar and
 * report "You're all set" even when every source had errored.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildSyncStats, isCleanSync } from "@/lib/onboarding-sync-stats";
import {
  DONE_HOLD_MS,
  INTEGRATIONS_SETTINGS_PATH,
  MIN_SYNC_DISPLAY_MS,
  SYNC_BLURBS,
} from "@/components/onboarding/DoneStep";
import type { SyncResult } from "@/lib/types";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");

/** A result where every source succeeded with the given counts. */
function result(overrides: Partial<Record<keyof SyncResult, { synced: number; errors: string[] }>> = {}): SyncResult {
  const ok = { synced: 0, errors: [] };
  return {
    canvas: ok,
    gradescope: ok,
    pensieve: ok,
    brightspace: ok,
    blackboard: ok,
    classroom: ok,
    last_synced_at: "2026-09-23T00:00:00Z",
    ...overrides,
  } as SyncResult;
}

const noSyllabus = { count: 0, courses: [] };

describe("buildSyncStats", () => {
  it("returns null when nothing synced, nothing imported, nothing failed", () => {
    expect(buildSyncStats({ syncResult: null, syncError: null, syllabus: noSyllabus, selectedCourseNames: [] })).toBeNull();
  });

  it("totals every source plus syllabus imports and lists sources with counts", () => {
    const stats = buildSyncStats({
      syncResult: result({ canvas: { synced: 3, errors: [] }, gradescope: { synced: 2, errors: [] } }),
      syncError: null,
      syllabus: { count: 4, courses: ["CS 61A"] },
      selectedCourseNames: ["CS 70", "CS 61A"],
    });
    expect(stats?.total).toBe(9);
    expect(stats?.perSource.map((r) => [r.provider, r.count])).toEqual([
      ["canvas", 3],
      ["gradescope", 2],
      ["syllabus", 4],
    ]);
    expect(stats?.courses).toEqual(["CS 70", "CS 61A"]);
  });

  it("uses the product labels, so Pensive is never spelled Pensieve", () => {
    const stats = buildSyncStats({
      syncResult: result({ pensieve: { synced: 1, errors: [] } }),
      syncError: null,
      syllabus: noSyllabus,
      selectedCourseNames: [],
    });
    expect(stats?.perSource[0].label).toBe("Pensive");
  });

  it("collects per-source errors with their labels", () => {
    const stats = buildSyncStats({
      syncResult: result({ gradescope: { synced: 0, errors: ["Login failed", "Try again"] } }),
      syncError: null,
      syllabus: noSyllabus,
      selectedCourseNames: [],
    });
    expect(stats?.sourceErrors).toEqual([
      { provider: "gradescope", label: "Gradescope", message: "Login failed Try again" },
    ]);
  });

  it("tolerates a result that omits newer sources", () => {
    const partial = { canvas: { synced: 1, errors: [] }, last_synced_at: "x" } as unknown as SyncResult;
    const stats = buildSyncStats({ syncResult: partial, syncError: null, syllabus: noSyllabus, selectedCourseNames: [] });
    expect(stats?.total).toBe(1);
    expect(stats?.sourceErrors).toEqual([]);
  });

  it("returns stats carrying the request error when the request itself failed", () => {
    const stats = buildSyncStats({ syncResult: null, syncError: "Sync failed: 500", syllabus: noSyllabus, selectedCourseNames: [] });
    expect(stats?.syncError).toBe("Sync failed: 500");
    expect(stats?.total).toBe(0);
  });

  it("still reports a syllabus-only setup", () => {
    const stats = buildSyncStats({ syncResult: null, syncError: null, syllabus: { count: 2, courses: ["Bio 1A"] }, selectedCourseNames: [] });
    expect(stats?.total).toBe(2);
    expect(stats?.courses).toEqual(["Bio 1A"]);
  });
});

describe("isCleanSync", () => {
  it("is clean for null stats and for stats without errors", () => {
    expect(isCleanSync(null)).toBe(true);
    expect(isCleanSync({ total: 1, perSource: [], courses: [], sourceErrors: [], syncError: null })).toBe(true);
  });

  it("is not clean when a source errored or the request failed", () => {
    expect(isCleanSync({ total: 0, perSource: [], courses: [], sourceErrors: [{ provider: "canvas", label: "Canvas", message: "x" }], syncError: null })).toBe(false);
    expect(isCleanSync({ total: 0, perSource: [], courses: [], sourceErrors: [], syncError: "boom" })).toBe(false);
  });
});

describe("DoneStep", () => {
  const src = read("src/components/onboarding/DoneStep.tsx");

  it("waits on the real sync promise with a 1.5 s minimum, not a fixed timer", () => {
    expect(MIN_SYNC_DISPLAY_MS).toBe(1500);
    expect(src).toContain("Promise.all([sync, minimum])");
    expect(src).not.toMatch(/setInterval\([^)]*200\)/);
  });

  it("fills the bar only once the sync has settled, then holds briefly", () => {
    expect(src).toMatch(/Promise\.all\(\[sync, minimum\]\)\.then\(\(\) => \{[\s\S]{0,80}setProgress\(100\)/);
    expect(DONE_HOLD_MS).toBeLessThan(MIN_SYNC_DISPLAY_MS);
  });

  it("reads stats through a ref so the recap sees the result that arrived after mount", () => {
    expect(src).toContain("getStatsRef.current = getSyncStats;");
    expect(src).toContain("setStats(getStatsRef.current())");
  });

  it("never says all set when a source failed, and links to settings", () => {
    expect(src).toContain('"You\'re all set."');
    expect(src).toMatch(/clean\s*\?\s*"You're all set\."/);
    expect(src).toContain("Fix in settings");
    expect(src).toContain("onComplete(INTEGRATIONS_SETTINGS_PATH)");
    expect(INTEGRATIONS_SETTINGS_PATH).toBe("/app/settings?section=integrations");
  });

  it("exposes the bar as a progressbar and uses tokens, not brand hex", () => {
    expect(src).toContain('role="progressbar"');
    expect(src).toContain("aria-valuenow={shown}");
    expect(src).not.toMatch(/#0e89d6|#f6f5f4|#202022|#2a2a2c|#3A3A3C/);
  });

  it("keeps copy free of em dashes and uppercase labels", () => {
    expect(src).not.toContain("—");
    expect(src).not.toContain("uppercase");
    for (const blurb of SYNC_BLURBS) expect(blurb).not.toContain("—");
  });
});

describe("onboarding page wiring", () => {
  const page = read("src/app/app/onboarding/page.tsx");

  it("builds stats from the sync result and the context error", () => {
    expect(page).toContain("buildSyncStats({");
    expect(page).toContain("syncError: syncResult ? null : syncError,");
  });

  it("sends the platforms skip and the skip-setup exit through handleSyncAndGo", () => {
    expect(page).toMatch(/step: "platforms" \}\);\s*handleSyncAndGo\(\{ skipSync: true \}\)/);
    expect(page).toMatch(/setShowSkipModal\(false\);\s*handleSyncAndGo\(\{ skipSync: true \}\)/);
    expect(page).not.toContain('setCurrentStep("done")');
  });

  it("lets the recap choose its destination", () => {
    expect(page).toContain("onComplete={(destination) => handleSyncAndGo({ destination })}");
    expect(page).toContain("router.push(destination)");
  });
});
