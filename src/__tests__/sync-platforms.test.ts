/**
 * Tests for the sync request's platform filter and the toast summaries.
 *
 * Audit H10: the route's valid-platform set stopped at Brightspace, so a
 * Blackboard or Classroom setup sync was filtered to nothing and never ran,
 * and the toasts skipped those sources' errors.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parsePlatformFilter, emptySyncResult, SYNC_PLATFORMS } from "@/lib/sync-platforms";
import { collectSyncErrors, describeSyncedCounts } from "@/lib/sync-result-summary";
import type { SyncResult } from "@/lib/types";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("parsePlatformFilter", () => {
  it("syncs everything when no filter is sent", () => {
    expect(parsePlatformFilter(undefined)).toEqual({ kind: "all" });
    expect(parsePlatformFilter("canvas")).toEqual({ kind: "all" });
  });

  it("keeps blackboard and classroom", () => {
    expect(parsePlatformFilter(["blackboard"])).toEqual({ kind: "some", platforms: ["blackboard"] });
    expect(parsePlatformFilter(["classroom"])).toEqual({ kind: "some", platforms: ["classroom"] });
  });

  it("accepts every platform the engine declares", () => {
    const engine = read("src/lib/sync-engine.ts");
    const declared = engine.match(/export type SyncPlatform = ([^;]+);/)![1].match(/"(\w+)"/g)!
      .map((s) => s.replace(/"/g, ""));
    expect([...SYNC_PLATFORMS].sort()).toEqual(declared.sort());
    expect(parsePlatformFilter(declared)).toEqual({ kind: "some", platforms: declared });
  });

  it("drops unknown entries and non-strings but keeps the valid ones", () => {
    expect(parsePlatformFilter(["moodle", 3, "canvas"])).toEqual({ kind: "some", platforms: ["canvas"] });
  });

  it("means sync nothing when the filter names no known platform", () => {
    expect(parsePlatformFilter([])).toEqual({ kind: "none" });
    expect(parsePlatformFilter(["moodle"])).toEqual({ kind: "none" });
  });
});

describe("emptySyncResult", () => {
  it("has an entry for every platform so clients never read an undefined source", () => {
    const result = emptySyncResult("2026-09-21T00:00:00.000Z");
    for (const platform of SYNC_PLATFORMS) {
      expect(result[platform]).toEqual({ synced: 0, errors: [] });
    }
    expect(result.last_synced_at).toBe("2026-09-21T00:00:00.000Z");
  });
});

describe("sync result summaries", () => {
  const result: SyncResult = {
    ...emptySyncResult("2026-09-21T00:00:00.000Z"),
    canvas: { synced: 2, errors: [] },
    blackboard: { synced: 3, errors: ["Blackboard feed returned 404"] },
    classroom: { synced: 0, errors: ["Reconnect Google"] },
  };

  it("collects errors from blackboard and classroom alongside the others", () => {
    expect(collectSyncErrors(result)).toEqual(["Blackboard feed returned 404", "Reconnect Google"]);
  });

  it("counts every source that synced something", () => {
    expect(describeSyncedCounts(result)).toEqual(["2 from Canvas", "3 from Blackboard"]);
  });

  it("tolerates a result from a server that omits a newer source", () => {
    const partial = { canvas: { synced: 1, errors: ["x"] } } as unknown as SyncResult;
    expect(collectSyncErrors(partial)).toEqual(["x"]);
    expect(describeSyncedCounts(partial)).toEqual(["1 from Canvas"]);
  });
});

describe("wiring", () => {
  it("the sync route reads its filter from the shared parser", () => {
    const route = read("src/app/api/assignments/sync/route.ts");
    expect(route).toContain("parsePlatformFilter(body.platforms)");
    expect(route).not.toMatch(/VALID_PLATFORMS/);
  });

  it("both TaskContext toasts read every source through the summary helpers", () => {
    const ctx = read("src/contexts/TaskContext.tsx");
    expect(ctx.match(/collectSyncErrors\(result\)/g)?.length).toBe(2);
    expect(ctx).toContain("describeSyncedCounts(result)");
  });

  it("a visible manual sync sends forceGradescope, a silent one does not (audit H9)", () => {
    const ctx = read("src/contexts/TaskContext.tsx");
    expect(ctx).toContain("...(silent ? {} : { forceGradescope: true })");
    // The background auto-sync body must stay unforced.
    const autoSyncBody = ctx.match(/async function autoSync\(\)[\s\S]*?body: JSON\.stringify\(([^)]*)\)/)?.[1] ?? "";
    expect(autoSyncBody).not.toContain("forceGradescope");
  });
});
