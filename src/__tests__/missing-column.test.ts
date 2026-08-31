/**
 * Tests for missing-column detection.
 *
 * This guard is what keeps a code deploy that lands before its migration from
 * breaking every user's sync: PostgREST fails a select wholesale when one
 * named column is unknown, and the sync engine reads that failure as "no
 * credentials configured".
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { isMissingColumnError } from "@/lib/supabase/missing-column";

describe("isMissingColumnError", () => {
  it("recognises the Postgres undefined-column code", () => {
    expect(isMissingColumnError({ code: "42703" })).toBe(true);
  });

  it("recognises the message when PostgREST drops the code", () => {
    expect(isMissingColumnError({
      message: 'column integration_credentials.blackboard_calendar_url does not exist',
    })).toBe(true);
    expect(isMissingColumnError({
      message: "Could not find the 'blackboard_calendar_url' column",
    })).toBe(true);
  });

  it("is case-insensitive on the message", () => {
    expect(isMissingColumnError({ message: "Column DOES NOT EXIST" })).toBe(true);
  });

  it("does not swallow unrelated errors", () => {
    expect(isMissingColumnError({ code: "23505", message: "duplicate key" })).toBe(false);
    expect(isMissingColumnError({ message: "permission denied for table" })).toBe(false);
  });

  it("treats no error as no error", () => {
    expect(isMissingColumnError(null)).toBe(false);
    expect(isMissingColumnError(undefined)).toBe(false);
    expect(isMissingColumnError({})).toBe(false);
  });
});

describe("deploy-order safety of the new Blackboard column", () => {
  const ROOT = path.resolve(__dirname, "../..");
  const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
  const engine = read("src/lib/sync-engine.ts");
  const route = read("src/app/api/credentials/route.ts");

  it("the sync engine retries without the optional columns", () => {
    expect(engine).toMatch(/if \(isMissingColumnError\(credsError\)\)/);
    expect(engine).toMatch(/\.select\(CORE_COLUMNS\)/);
  });

  it("keeps the unmigrated column out of the engine's core set", () => {
    const core = engine.match(/const CORE_COLUMNS = "([^"]*)"/)?.[1] ?? "";
    const optional = engine.match(/const OPTIONAL_COLUMNS = "([^"]*)"/)?.[1] ?? "";
    expect(core).not.toContain("blackboard_calendar_url");
    expect(optional).toContain("blackboard_calendar_url");
  });

  it("keeps it out of the credentials route's core set too", () => {
    // CORE_SELECT is documented as columns guaranteed to exist everywhere.
    const core = route.match(/const CORE_SELECT = "([^"]*)"/)?.[1] ?? "";
    const optional = route.match(/const OPTIONAL_SELECT = "([^"]*)"/)?.[1] ?? "";
    expect(core).not.toContain("blackboard");
    expect(optional).toContain("blackboard_calendar_url");
    expect(optional).toContain("blackboard_auth_failed");
  });
});
