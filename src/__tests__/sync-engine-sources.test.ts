/**
 * Pins the `tasks_source_check` constraint against the sources the sync engine
 * actually writes.
 *
 * Brightspace (repaired by 20260827000001) and then Blackboard (repaired by
 * 20260904000001) both shipped writing a source the constraint did not allow.
 * Every upsert violated it, so the integration produced zero rows while
 * reporting only "N of N upsert batches failed" in an alert email. The failure
 * is invisible in TypeScript because the source is a string on both sides, so
 * it is pinned here instead: adding a source to sync-engine.ts without adding
 * a migration fails this test.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "supabase/migrations");
const SYNC_ENGINE = join(process.cwd(), "src/lib/sync-engine.ts");

/**
 * Reads the source values the latest `tasks_source_check` migration allows.
 *
 * @returns The allowed source strings, from the newest migration that
 *          redefines the constraint.
 */
function allowedSourcesFromMigrations(): string[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let latest: string[] | null = null;
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    // Only an ADD CONSTRAINT redefines the list; a DROP mentions the name too.
    const match = sql.match(/ADD\s+CONSTRAINT\s+tasks_source_check\s+CHECK\s*\(\s*source\s+IN\s*\(([^)]*)\)/i);
    if (match) {
      latest = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    }
  }

  if (latest === null) throw new Error("No migration defines tasks_source_check");
  return latest;
}

/**
 * Reads the source union that `upsertAssignments` accepts.
 *
 * @returns The source strings from its `source:` parameter type.
 */
function sourcesFromSyncEngine(): string[] {
  const code = readFileSync(SYNC_ENGINE, "utf8");
  const match = code.match(/\n\s*source:\s*((?:"[a-z]+"\s*\|\s*)+"[a-z]+"),\n/);
  if (!match) throw new Error("Could not find the upsertAssignments source union");
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

describe("tasks_source_check covers every synced source", () => {
  it("allows every source upsertAssignments writes", () => {
    const allowed = new Set(allowedSourcesFromMigrations());
    const written = sourcesFromSyncEngine();

    expect(written.length).toBeGreaterThan(0);
    expect(written.filter((s) => !allowed.has(s))).toEqual([]);
  });

  it("allows blackboard, the source the 2026-09-04 alert email flagged", () => {
    expect(allowedSourcesFromMigrations()).toContain("blackboard");
  });

  it("keeps the sources earlier migrations already allowed", () => {
    const allowed = allowedSourcesFromMigrations();
    // A migration that redefines the constraint replaces the whole list, which
    // is exactly how blackboard and brightspace were each dropped from it.
    for (const source of ["canvas", "gradescope", "pensieve", "syllabus", "brightspace", "classroom"]) {
      expect(allowed).toContain(source);
    }
  });
});
