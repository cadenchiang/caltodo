/**
 * Tests for the onboarding exit transition.
 *
 * Onboarding renders a fixed overlay that fades out before navigating away.
 * If the destination route is not prefetched, the cold route load starts only
 * after the fade has finished, so the user sees the overlay disappear and then
 * a loading skeleton. This asserts every exit destination is prefetched.
 *
 * The component cannot be imported under vitest (client component with next
 * navigation hooks), so the invariant is checked against source, matching the
 * approach in onboarding-videos.test.ts.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SOURCE = fs.readFileSync(
  path.join(path.resolve(__dirname, "../.."), "src/app/app/onboarding/page.tsx"),
  "utf8",
);

/** Routes onboarding navigates to when the flow ends. */
// Home is withdrawn, so both exits land on the inbox.
const EXIT_ROUTES = ["/app/inbox"];

describe("onboarding exit transition", () => {
  it.each(EXIT_ROUTES)("prefetches %s before navigating there", (route) => {
    expect(SOURCE).toContain(`router.prefetch("${route}")`);
  });

  it.each(EXIT_ROUTES)("still navigates to %s", (route) => {
    expect(SOURCE).toContain(`router.push("${route}")`);
  });

  it("prefetches every bare /app route it pushes to", () => {
    const pushed = new Set(
      [...SOURCE.matchAll(/router\.push\("(\/app\/[a-z]+)"\)/g)].map((m) => m[1]),
    );
    const prefetched = new Set(
      [...SOURCE.matchAll(/router\.prefetch\("(\/app\/[a-z]+)"\)/g)].map((m) => m[1]),
    );
    for (const route of pushed) expect(prefetched).toContain(route);
  });

  it("fades the overlay out before navigating", () => {
    expect(SOURCE).toContain("setExiting(true)");
    expect(SOURCE).toMatch(/transition-opacity/);
  });
});
