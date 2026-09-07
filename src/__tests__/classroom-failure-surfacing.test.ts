/**
 * Tests that a failing Google Classroom sync reaches the user.
 *
 * The reported state: classroom_enabled was true, the Google token lacked the
 * Classroom scope, and sync 403'd on every run. The engine set
 * classroom_auth_failed each time, but Classroom was missing from both error
 * pipelines and nothing read the flag, so the failure was invisible and the
 * 403 repeated every few minutes. These pin each link in that chain.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

describe("the alerts pipeline", () => {
  const alerts = read("src/lib/integration-alerts.ts");

  it("reports classroom errors alongside every other platform", () => {
    expect(alerts).toContain('["classroom", result.classroom?.errors ?? []],');
  });

  it("types classroom as a reportable source", () => {
    expect(alerts).toMatch(/"blackboard" \| "classroom", string\[\]/);
  });
});

describe("the client sync toast", () => {
  const ctx = read("src/contexts/TaskContext.tsx");

  it("includes classroom errors in what the user is shown", () => {
    expect(ctx).toContain("...(result.classroom?.errors ?? []),");
  });

  it("keeps the Fix in Settings action those errors lead to", () => {
    expect(ctx).toContain('label: "Fix in Settings"');
  });
});

describe("the sync engine", () => {
  const engine = read("src/lib/sync-engine.ts");

  it("reads the flag it writes", () => {
    expect(engine).toContain("classroom_auth_failed: boolean;");
    expect(engine).toMatch(/CORE_COLUMNS = "[^"]*classroom_auth_failed[^"]*"/);
  });

  it("skips while the scope is known to be refused, rather than 403ing every run", () => {
    const skip = engine.indexOf("if (creds.classroom_auth_failed) {");
    expect(skip).toBeGreaterThan(-1);
    // The skip sits inside syncClassroom, before the network call.
    expect(skip).toBeGreaterThan(engine.indexOf("async function syncClassroom("));
    expect(skip).toBeLessThan(engine.indexOf("await getValidAccessToken(supabase, userId);", skip));
  });

  it("still tells the user what to do when it skips", () => {
    expect(engine).toContain(
      'errors: ["Google Classroom access was not granted. Reconnect Google in Settings to allow it."]'
    );
  });

  it("still clears the flag after a successful run", () => {
    expect(engine).toContain(".update({ classroom_auth_failed: false })");
  });
});

describe("the settings card", () => {
  const card = read("src/components/settings/GoogleClassroomSettings.tsx");

  it("reads the sync-set flag, not only the on-open fetch error", () => {
    expect(card).toContain("credentials.classroom_auth_failed === true");
  });

  it("offers the reconnect link only while Google can honour it", () => {
    // Google's consent screen refuses the Classroom scopes until it has
    // approved the app, so the link is a dead end while CLASSROOM_AVAILABLE
    // is false; the card says the sync is paused instead.
    const banner = card.slice(card.indexOf("{authFailed && CLASSROOM_AVAILABLE && ("));
    expect(banner).toContain('href="/api/gcal/auth?classroom=1"');
    expect(banner).toContain("Reconnect Google to allow Classroom");
    expect(card).toContain("{authFailed && !CLASSROOM_AVAILABLE && (");
    expect(card).toContain("Classroom sync is paused while Google reviews this app");
    expect(card).toContain('{CLASSROOM_AVAILABLE ? "Needs reconnect" : "Paused"}');
  });

  it("does not select the header text when it is clicked to toggle", () => {
    expect(card).toMatch(/py-3\.5 text-left transition-colors select-none/);
  });

  it("does not call a failing sync Connected in the header", () => {
    expect(card).toContain("Needs reconnect");
    expect(card.indexOf("authFailed ? (")).toBeLessThan(card.indexOf(">\n                Connected"));
  });

  it("defaults the flag so it is never undefined", () => {
    expect(read("src/components/settings/IntegrationSettings.tsx")).toContain("classroom_auth_failed: false,");
  });
});

describe("the credentials API", () => {
  const route = (read("src/app/api/credentials/route.ts") + read("src/lib/credentials-loader.ts"));

  it("returns the Classroom fields it selects, on GET and on PUT", () => {
    // It selected them and dropped them, so the UI always saw the integration
    // as off while the row had it on.
    for (const field of ["classroom_enabled", "selected_classroom_courses", "classroom_auth_failed"]) {
      expect(route).toMatch(new RegExp(`${field}:\\s*\\(data as`));
      expect(route).toMatch(new RegExp(`${field}:\\s*\\(updated as`));
    }
  });
});

describe("the availability gate", () => {
  const engine = read("src/lib/sync-engine.ts");

  it("does not sync a feature the UI says is not available yet", () => {
    expect(engine).toContain('import { CLASSROOM_AVAILABLE } from "@/lib/classroom-availability";');
    const gate = engine.indexOf("if (!CLASSROOM_AVAILABLE) {");
    expect(gate).toBeGreaterThan(engine.indexOf("async function syncClassroom("));
    expect(gate).toBeLessThan(engine.indexOf("await getValidAccessToken(supabase, userId);", gate));
  });
});
