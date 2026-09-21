/**
 * Tests that upstream error text stays in the server log.
 *
 * Audit L3: Stripe checkout/portal and the Spotify oEmbed proxy returned
 * the raw upstream error message to the browser.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("Stripe routes", () => {
  it.each([
    ["src/app/api/stripe/checkout/route.ts", "checkout_failed", "Could not start checkout. Please try again."],
    ["src/app/api/stripe/portal/route.ts", "portal_failed", "Could not open the billing portal. Please try again."],
  ])("%s returns a generic 500 body", (file, code, message) => {
    const route = read(file);
    // The JSON body handed to the browser, from `error:` to the closing brace.
    const at = route.indexOf(`error: "${code}"`);
    const body = route.slice(at, route.indexOf("}", at));
    expect(body).toContain(`message: "${message}"`);
    expect(body).not.toContain("err.message");
    expect(body).not.toContain("err instanceof Error");
  });

  it("still logs the real reason", () => {
    expect(read("src/app/api/stripe/checkout/route.ts")).toMatch(/logger\.error\("stripe_checkout_failed", \{\s*message: err instanceof Error \? err\.message/);
    expect(read("src/app/api/stripe/portal/route.ts")).toMatch(/logger\.error\("stripe_portal_failed", \{\s*message: err instanceof Error \? err\.message/);
  });
});

describe("Spotify oEmbed proxy", () => {
  const route = read("src/app/api/spotify/oembed/route.ts");

  it("returns a generic 502 body and logs the fetch error", () => {
    expect(route).toContain('return NextResponse.json({ error: "Could not load the Spotify embed." }, { status: 502 });');
    expect(route).not.toContain("{ error: err instanceof Error ? err.message");
    expect(route).toContain('logger.error("GET /api/spotify/oembed failed"');
  });
});
