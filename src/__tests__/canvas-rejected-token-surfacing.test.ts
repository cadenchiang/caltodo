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
  const card = read("src/components/settings/CanvasSettings.tsx");

  it("treats a rejected token like an expired one", () => {
    expect(card).toContain("credentials.canvas_auth_failed === true");
    expect(card).toMatch(/const isExpired = .*\|\| isRejected;/);
  });

  it("says rejected rather than expired when that is what happened", () => {
    expect(card).toContain('isRejected ? "Rejected — Reconnect" : "Expired — Reconnect"');
  });

  it("is fed the flag by the credentials API", () => {
    expect(read("src/app/api/credentials/route.ts")).toMatch(/canvas_auth_failed: \(data as/);
  });
});
