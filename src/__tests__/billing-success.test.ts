/**
 * Tests for the billing success route and HomeBoard comments (audit 2.27).
 *
 * The "You're Pro" page was still routed from Stripe checkout although the
 * app is free forever; it now redirects to the inbox. HomeBoard's comments
 * described a paywall that no longer exists.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("/app/billing/success", () => {
  const src = read("app/app/billing/success/page.tsx");

  it("redirects to the inbox and renders no Pro copy", () => {
    expect(src).toContain('import { redirect } from "next/navigation";');
    expect(src).toContain('const BILLING_SUCCESS_REDIRECT = "/app/inbox";');
    expect(src).toContain("redirect(BILLING_SUCCESS_REDIRECT);");
    expect(src).not.toMatch(/You&rsquo;re Pro|You're Pro/);
    expect(src).not.toContain("#0e89d6");
  });

  it("may stay as the Stripe success_url because it redirects", () => {
    expect(read("app/api/stripe/checkout/route.ts")).toContain("/app/billing/success");
  });
});

describe("HomeBoard", () => {
  it("no longer carries paywall comments", () => {
    const src = read("app/app/home/HomeBoard.tsx");
    expect(src).not.toMatch(/paywall/i);
    expect(src).not.toContain("BoardLockedScreen");
  });
});
