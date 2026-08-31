/**
 * Tests for the provider capability map.
 *
 * The important guarantee is negative: settings must not offer "Add another"
 * for a provider whose second account the backend cannot store. Gradescope
 * needs an encrypted password and Classroom needs its own OAuth token pair,
 * and neither lives in integration_accounts.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  INTEGRATION_PROVIDERS,
  PROVIDER_META,
  FEED_PROVIDERS,
  isFeedProvider,
  isIntegrationProvider,
  supportsMultipleAccounts,
  addRouteFor,
  accountDisplayName,
} from "@/lib/integration-providers";

describe("provider set", () => {
  it("matches the database CHECK constraint exactly", () => {
    // Drifting from the constraint means an insert fails at runtime.
    const ROOT = path.resolve(__dirname, "../..");
    const sql = fs.readFileSync(
      path.join(ROOT, "supabase/migrations/20260831000001_integration_accounts.sql"),
      "utf8"
    );
    const inList = sql.match(/provider IN \(([\s\S]*?)\)/)?.[1] ?? "";
    const fromSql = [...inList.matchAll(/'([a-z]+)'/g)].map((m) => m[1]).sort();
    expect(fromSql).toEqual([...INTEGRATION_PROVIDERS].sort());
  });

  it("has metadata for every provider, keyed consistently", () => {
    for (const p of INTEGRATION_PROVIDERS) {
      expect(PROVIDER_META[p]).toBeTruthy();
      expect(PROVIDER_META[p].id).toBe(p);
    }
  });

  it("gives every provider a non-empty label and account noun", () => {
    for (const p of INTEGRATION_PROVIDERS) {
      expect(PROVIDER_META[p].label.length).toBeGreaterThan(0);
      expect(PROVIDER_META[p].accountNoun.length).toBeGreaterThan(0);
    }
  });

  it("spells Pensive the product's way", () => {
    expect(PROVIDER_META.pensieve.label).toBe("Pensive");
  });
});

describe("multi-account capability", () => {
  it("allows a second account only where one can actually be stored", () => {
    expect(supportsMultipleAccounts("canvas")).toBe(true);
    expect(supportsMultipleAccounts("pensieve")).toBe(true);
    expect(supportsMultipleAccounts("brightspace")).toBe(true);
    expect(supportsMultipleAccounts("blackboard")).toBe(true);
  });

  it("refuses Gradescope, whose second account would need its own password", () => {
    expect(supportsMultipleAccounts("gradescope")).toBe(false);
    expect(PROVIDER_META.gradescope.singleAccountReason).toBe("needs-secret");
  });

  it("refuses Classroom, whose second account would need its own OAuth grant", () => {
    expect(supportsMultipleAccounts("classroom")).toBe(false);
    expect(PROVIDER_META.classroom.singleAccountReason).toBe("oauth-identity");
  });

  it("states a reason exactly when it withholds the capability", () => {
    for (const p of INTEGRATION_PROVIDERS) {
      const meta = PROVIDER_META[p];
      const hasReason = meta.singleAccountReason !== null;
      expect(hasReason).toBe(meta.addRoute === null);
    }
  });

  it("returns an add route only for multi-account providers", () => {
    expect(addRouteFor("canvas")).toBe("canvas-add");
    expect(addRouteFor("blackboard")).toBe("blackboard-add");
    expect(addRouteFor("gradescope")).toBeNull();
    expect(addRouteFor("classroom")).toBeNull();
  });

  it("keeps the existing Canvas add route, which already shipped", () => {
    expect(PROVIDER_META.canvas.addRoute).toBe("canvas-add");
  });
});

describe("feed providers", () => {
  it("are exactly the URL-only integrations", () => {
    expect([...FEED_PROVIDERS].sort()).toEqual(["blackboard", "brightspace", "pensieve"]);
  });

  it("all support multiple accounts, since a URL is a whole connection", () => {
    for (const p of FEED_PROVIDERS) expect(supportsMultipleAccounts(p)).toBe(true);
  });

  it("all read their connection from calendar_url", () => {
    for (const p of FEED_PROVIDERS) {
      expect(PROVIDER_META[p].connectionKey).toBe("calendar_url");
    }
  });

  it("narrows correctly", () => {
    expect(isFeedProvider("brightspace")).toBe(true);
    expect(isFeedProvider("canvas")).toBe(false);
    expect(isFeedProvider("nonsense")).toBe(false);
  });
});

describe("isIntegrationProvider", () => {
  it("accepts known providers", () => {
    for (const p of INTEGRATION_PROVIDERS) expect(isIntegrationProvider(p)).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isIntegrationProvider("syllabus")).toBe(false);
    expect(isIntegrationProvider("canvas-add")).toBe(false);
    expect(isIntegrationProvider(undefined)).toBe(false);
    expect(isIntegrationProvider(7)).toBe(false);
  });
});

describe("accountDisplayName", () => {
  it("prefers the user's own label", () => {
    expect(accountDisplayName("canvas", "Berkeley", { base_url: "https://bcourses.berkeley.edu" }))
      .toBe("Berkeley");
  });

  it("ignores a whitespace-only label", () => {
    expect(accountDisplayName("canvas", "   ", { base_url: "https://bcourses.berkeley.edu" }))
      .toBe("bcourses.berkeley.edu");
  });

  it("shows the host, since a feed URL is mostly opaque token", () => {
    expect(accountDisplayName("blackboard", "", {
      calendar_url: "https://bb.school.edu/webapps/calendar/calendarFeed/abc123/learn.ics",
    })).toBe("bb.school.edu");
  });

  it("passes a non-URL value through untouched", () => {
    expect(accountDisplayName("gradescope", "", { email: "a@b.edu" })).toBe("a@b.edu");
  });

  it("falls back to the product name when the connection is empty", () => {
    expect(accountDisplayName("classroom", "", {})).toBe("Google Classroom");
    expect(accountDisplayName("pensieve", "", {})).toBe("Pensive");
  });

  it("never returns an empty string", () => {
    for (const p of INTEGRATION_PROVIDERS) {
      expect(accountDisplayName(p, "", {}).length).toBeGreaterThan(0);
    }
  });
});
