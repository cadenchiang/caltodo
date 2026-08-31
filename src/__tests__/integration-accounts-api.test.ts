/**
 * Tests for the additional-accounts API surface.
 *
 * The route runs against Supabase and Next request plumbing, so these parse
 * the source for the guarantees that matter and would fail silently: that a
 * provider whose second account cannot be stored is refused, that feed URLs go
 * through the SSRF allowlist, and that neither read nor delete can reach
 * another user's rows or the primary account.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const route = fs.readFileSync(
  path.join(ROOT, "src/app/api/integration-accounts/route.ts"),
  "utf8"
);

/** Body of one exported handler, for scoped assertions. */
function handler(name: "GET" | "POST" | "DELETE"): string {
  const start = route.indexOf(`export async function ${name}(`);
  expect(start, `${name} handler missing`).toBeGreaterThan(-1);
  const next = ["GET", "POST", "DELETE"]
    .map((n) => route.indexOf(`export async function ${n}(`))
    .filter((i) => i > start)
    .sort((a, b) => a - b)[0];
  return route.slice(start, next === undefined ? route.length : next);
}

describe("authentication", () => {
  it("every handler rejects an unauthenticated caller", () => {
    for (const name of ["GET", "POST", "DELETE"] as const) {
      expect(handler(name)).toMatch(/if \(authError \|\| !user\)[\s\S]{0,120}status: 401/);
    }
  });

  it("reads the user from the session, never from the request body", () => {
    // Trusting a client-supplied user id would make every row reachable.
    expect(route).toContain("supabase.auth.getUser()");
    expect(route).not.toMatch(/body\.user_id/);
  });
});

describe("provider gating", () => {
  it("rejects an unknown provider", () => {
    expect(handler("POST")).toMatch(/!isIntegrationProvider\(provider\)[\s\S]{0,120}status: 400/);
  });

  it("rejects providers that cannot hold a second account", () => {
    // Gradescope needs an encrypted password, Classroom its own OAuth grant.
    expect(handler("POST")).toMatch(/!supportsMultipleAccounts\(provider\)[\s\S]{0,200}status: 400/);
  });

  it("accepts only feed providers, whose connection is entirely a URL", () => {
    expect(handler("POST")).toMatch(/!isFeedProvider\(provider\)[\s\S]{0,200}status: 400/);
  });
});

describe("URL handling", () => {
  it("requires a calendar URL", () => {
    expect(handler("POST")).toMatch(/if \(!url\)[\s\S]{0,120}status: 400/);
  });

  it("puts it through the same SSRF allowlist as primary feeds", () => {
    // Without this the route forwards requests to arbitrary internal hosts.
    expect(handler("POST")).toMatch(/!isAllowedCanvasUrl\(url\)[\s\S]{0,120}status: 400/);
  });

  it("stores it under the key the sync path reads", () => {
    expect(handler("POST")).toMatch(/connection: \{ calendar_url: url \}/);
  });

  it("trims the URL before validating it", () => {
    expect(handler("POST")).toMatch(/body\.calendar_url\.trim\(\)/);
  });
});

describe("row scoping", () => {
  it("lists only the caller's own non-primary accounts", () => {
    const get = handler("GET");
    expect(get).toMatch(/\.eq\("user_id", user\.id\)/);
    expect(get).toMatch(/\.eq\("is_primary", false\)/);
  });

  it("never returns a secret", () => {
    // The table holds none, but a select of "*" would leak whatever is added.
    expect(route).not.toMatch(/\.select\("\*"\)/);
  });

  it("creates rows as non-primary, so the flat-column account stays primary", () => {
    expect(handler("POST")).toMatch(/is_primary: false/);
  });

  it("deletes only the caller's own non-primary account", () => {
    const del = handler("DELETE");
    expect(del).toMatch(/\.eq\("user_id", user\.id\)/);
    expect(del).toMatch(/\.eq\("is_primary", false\)/);
  });

  it("reports a miss as 404 rather than a silent success", () => {
    expect(handler("DELETE")).toMatch(/if \(!data\)[\s\S]{0,120}status: 404/);
  });

  it("requires an id to delete", () => {
    expect(handler("DELETE")).toMatch(/if \(!id\)[\s\S]{0,120}status: 400/);
  });
});

describe("abuse and input limits", () => {
  it("rate-limits reads and writes separately", () => {
    expect(handler("GET")).toMatch(/rateLimit\(`integration-accounts:get:/);
    expect(handler("POST")).toMatch(/rateLimit\(`integration-accounts:post:/);
  });

  it("limits writes more tightly than reads", () => {
    const readLimit = Number(handler("GET").match(/rateLimit\([^,]+, (\d+),/)?.[1]);
    const writeLimit = Number(handler("POST").match(/rateLimit\([^,]+, (\d+),/)?.[1]);
    expect(writeLimit).toBeLessThan(readLimit);
  });

  it("caps the user-supplied label", () => {
    expect(route).toContain("MAX_LABEL_LENGTH");
    expect(handler("POST")).toMatch(/slice\(0, MAX_LABEL_LENGTH\)/);
  });

  it("answers malformed JSON with 400, not a 500", () => {
    expect(handler("POST")).toMatch(/catch \{[\s\S]{0,120}Invalid JSON body[\s\S]{0,60}status: 400/);
  });
});
