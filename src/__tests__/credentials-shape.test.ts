/**
 * Tests for credentials-shape and canvas-accounts-merge.
 *
 * Audit H2: Canvas personal access tokens were shipped to the browser in
 * GET/PUT /api/credentials, the /app layout's RSC payload, and each
 * additional account, and were put in query strings during onboarding
 * verification. The client only ever used them as booleans. These pin that
 * every path masks the token and that round-tripped accounts keep theirs.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  shapeCredentials,
  maskCanvasAccounts,
  canvasTokenAge,
  rowHasOwnCredentials,
} from "@/lib/credentials-shape";
import { mergeCanvasAccountTokens } from "@/lib/canvas-accounts-merge";
import type { AdditionalCanvasAccount } from "@/lib/types";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const DAY = 24 * 60 * 60 * 1000;

const ACCOUNT: AdditionalCanvasAccount = {
  id: "canvas-1",
  label: "Stanford",
  base_url: "https://canvas.stanford.edu",
  token: "secret-token",
  token_created_at: "2026-09-01T00:00:00.000Z",
  selected_courses: [{ id: 1, name: "CS 101" }],
};

describe("shapeCredentials", () => {
  it("reduces the primary token to a boolean and never echoes it", () => {
    const shaped = shapeCredentials({ canvas_token: "secret-token" }, true);
    expect(shaped.has_canvas_token).toBe(true);
    expect(JSON.stringify(shaped)).not.toContain("secret-token");
    expect("canvas_token" in shaped).toBe(false);
  });

  it("reports no token for a missing or empty value", () => {
    expect(shapeCredentials(null, false).has_canvas_token).toBe(false);
    expect(shapeCredentials({ canvas_token: "" }, false).has_canvas_token).toBe(false);
  });

  it("masks every additional account's token", () => {
    const shaped = shapeCredentials({ additional_canvas_accounts: [ACCOUNT] }, true);
    expect(shaped.additional_canvas_accounts).toEqual([
      { ...ACCOUNT, token: undefined, has_token: true },
    ]);
    expect(JSON.stringify(shaped)).not.toContain("secret-token");
  });

  it("still masks the Gradescope password", () => {
    const shaped = shapeCredentials({ gradescope_password_encrypted: "enc" }, true);
    expect(shaped.has_gradescope_password).toBe(true);
    expect(JSON.stringify(shaped)).not.toContain("enc");
  });

  it("applies the defaults a new user relies on", () => {
    const shaped = shapeCredentials(null, false);
    expect(shaped.canvas_base_url).toBe("https://bcourses.berkeley.edu");
    expect(shaped.email_digest_enabled).toBe(true);
    expect(shaped.email_digest_hour).toBe(15);
    expect(shaped.dismissed_modals).toEqual({});
    expect(shaped.additional_canvas_accounts).toEqual([]);
    expect(shaped.has_completed_onboarding).toBe(false);
  });
});

describe("canvasTokenAge", () => {
  const created = new Date("2026-01-01T00:00:00.000Z");
  const row = { canvas_token: "t", canvas_token_created_at: created.toISOString() };

  it("is neither expired nor expiring for a fresh token", () => {
    expect(canvasTokenAge(row, created.getTime() + 10 * DAY)).toEqual({ expired: false, expiringSoon: false });
  });

  it("warns during the last week", () => {
    expect(canvasTokenAge(row, created.getTime() + 115 * DAY)).toEqual({ expired: false, expiringSoon: true });
  });

  it("expires after 120 days", () => {
    expect(canvasTokenAge(row, created.getTime() + 121 * DAY)).toEqual({ expired: true, expiringSoon: false });
  });

  it("is inert without a token or a creation date", () => {
    expect(canvasTokenAge({ canvas_token: null, canvas_token_created_at: created.toISOString() })).toEqual({ expired: false, expiringSoon: false });
    expect(canvasTokenAge({ canvas_token: "t", canvas_token_created_at: null })).toEqual({ expired: false, expiringSoon: false });
  });
});

describe("rowHasOwnCredentials", () => {
  it("is true for any connection or a past sync", () => {
    expect(rowHasOwnCredentials({ canvas_token: "t" })).toBe(true);
    expect(rowHasOwnCredentials({ canvas_ical_url: "https://x/f.ics" })).toBe(true);
    expect(rowHasOwnCredentials({ gradescope_password_encrypted: "e" })).toBe(true);
    expect(rowHasOwnCredentials({ blackboard_calendar_url: "https://x/f.ics" })).toBe(true);
    expect(rowHasOwnCredentials({ last_synced_at: "2026-01-01" })).toBe(true);
    expect(rowHasOwnCredentials({ google_access_token_encrypted: "e" })).toBe(true);
  });

  it("is false for an empty or missing row", () => {
    expect(rowHasOwnCredentials(null)).toBe(false);
    expect(rowHasOwnCredentials({ canvas_token: "", gradescope_email: "a@b.edu" })).toBe(false);
  });
});

describe("maskCanvasAccounts", () => {
  it("returns an empty list for null", () => {
    expect(maskCanvasAccounts(null)).toEqual([]);
  });

  it("flags an account with an empty token as tokenless", () => {
    expect(maskCanvasAccounts([{ ...ACCOUNT, token: "" }])[0].has_token).toBe(false);
  });
});

describe("mergeCanvasAccountTokens", () => {
  it("keeps the stored token for an account round-tripped without one", () => {
    const { token: _t, ...view } = ACCOUNT;
    void _t;
    const merged = mergeCanvasAccountTokens([{ ...view, has_token: true }], [ACCOUNT]);
    expect(merged).toHaveLength(1);
    expect(merged[0].token).toBe("secret-token");
    expect(merged[0].token_created_at).toBe(ACCOUNT.token_created_at);
    expect("has_token" in merged[0]).toBe(false);
  });

  it("lets a freshly entered token replace the stored one", () => {
    const merged = mergeCanvasAccountTokens(
      [{ ...ACCOUNT, token: "new-token", token_created_at: "2026-09-21T00:00:00.000Z" }],
      [ACCOUNT],
    );
    expect(merged[0].token).toBe("new-token");
    expect(merged[0].token_created_at).toBe("2026-09-21T00:00:00.000Z");
  });

  it("drops an account the client removed", () => {
    expect(mergeCanvasAccountTokens([], [ACCOUNT])).toEqual([]);
  });

  it("keeps non-token edits such as the class selection", () => {
    const { token: _t, ...view } = ACCOUNT;
    void _t;
    const merged = mergeCanvasAccountTokens([{ ...view, selected_courses: [] }], [ACCOUNT]);
    expect(merged[0].selected_courses).toEqual([]);
    expect(merged[0].token).toBe("secret-token");
  });

  it("stores an empty token for an unknown account without one (feed-only)", () => {
    const { token: _t, ...view } = ACCOUNT;
    void _t;
    const merged = mergeCanvasAccountTokens([{ ...view, id: "new", ical_url: "https://x/f.ics" }], [ACCOUNT]);
    expect(merged[0].token).toBe("");
    expect(merged[0].ical_url).toBe("https://x/f.ics");
  });

  it("clears auth_failed on save, as before", () => {
    const merged = mergeCanvasAccountTokens([{ ...ACCOUNT, auth_failed: true }], [{ ...ACCOUNT, auth_failed: true }]);
    expect(merged[0].auth_failed).toBe(false);
  });
});

describe("no path hands a Canvas token to the browser", () => {
  it("GET and PUT /api/credentials both shape through credentials-shape", () => {
    const route = read("src/app/api/credentials/route.ts");
    const loader = read("src/lib/credentials-loader.ts");
    expect(loader).toContain("return shapeCredentials(data, hasCompletedOnboarding);");
    expect(route).toContain("shapeCredentials(updated, rowHasOwnCredentials(updated))");
    expect(route).not.toContain("canvas_token: updated");
    expect(route).toContain("mergeCanvasAccountTokens(accounts, stored)");
  });

  it("onboarding verifies tokens with a POST body, never a query string", () => {
    for (const p of ["src/components/onboarding/CanvasStep.tsx", "src/components/onboarding/AddCanvasStep.tsx"]) {
      const src = read(p);
      expect(src).not.toMatch(/canvas\/courses\?\$\{params\}/);
      expect(src).toContain('fetch("/api/canvas/courses", {');
      expect(src).toContain('method: "POST"');
    }
  });

  it("the courses route reads the token only from the POST body", () => {
    const route = read("src/app/api/canvas/courses/route.ts");
    expect(route).not.toContain('searchParams.get("token")');
    expect(route).toContain("typeof body?.token === \"string\"");
  });

  it("no client reads a raw canvas_token off the credentials object", () => {
    const clientFiles = [
      "src/components/settings/CanvasSettings.tsx",
      "src/components/settings/ConnectedIntegrationCard.tsx",
      "src/components/ui/CanvasTokenExpiredModal.tsx",
      "src/lib/integration-catalog.ts",
      "src/lib/integration-disclosure.ts",
    ];
    for (const p of clientFiles) {
      expect(read(p)).not.toMatch(/credentials\.canvas_token\b|creds\.canvas_token\b|c\.canvas_token\b/);
    }
  });
});
