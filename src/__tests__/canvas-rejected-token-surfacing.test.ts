/**
 * Tests that a Canvas token Canvas has rejected is shown as such.
 *
 * canvas_token_expired is purely age-based (120 days). canvas_auth_failed is
 * set by the sync engine when Canvas actually refuses the token, which can
 * happen on day one if it was revoked. The API returned it, but no component
 * read it, so a rejected token showed as connected while never syncing.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("CanvasSettings", () => {
  it("treats a rejected token like an expired one on the connected card", () => {
    // The provider card only renders while unconnected; the connected card's
    // status comes from DISCLOSURE_META.canvas.authFailed.
    const disclosure = read("src/lib/integration-disclosure.ts");
    expect(disclosure).toContain("!!c.canvas_auth_failed || !!c.canvas_token_expired");
  });

  it("says rejected rather than expired when that is what happened", () => {
    const issues = read("src/lib/integration-health-issues.ts");
    expect(issues).toContain("Canvas rejected your access token");
    // The rejection branch is checked before the age heuristic.
    const body = issues.slice(issues.indexOf("export function buildHealthIssues"));
    expect(body.indexOf("credentials.canvas_auth_failed")).toBeLessThan(body.indexOf("credentials.canvas_token_expired"));
  });

  it("is fed the flag by the credentials API", () => {
    expect(read("src/lib/credentials-shape.ts")).toMatch(/canvas_auth_failed: row\?\.canvas_auth_failed \?\? false/);
  });
});
