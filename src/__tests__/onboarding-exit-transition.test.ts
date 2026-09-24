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

/** Route onboarding navigates to when the flow ends, unless the recap
    passes another destination. Home is withdrawn, so exits land on the inbox. */
const EXIT_ROUTE = "/app/inbox";

describe("onboarding exit transition", () => {
  it("declares the exit route once and prefetches it", () => {
    expect(SOURCE).toContain(`const EXIT_ROUTE = "${EXIT_ROUTE}";`);
    expect(SOURCE).toContain("router.prefetch(EXIT_ROUTE)");
    // Exactly one prefetch call: the duplicate inbox prefetch is gone.
    expect(SOURCE.match(/router\.prefetch\(/g)).toHaveLength(1);
  });

  it("navigates to the exit route by default and to the recap's destination otherwise", () => {
    expect(SOURCE).toContain("destination = EXIT_ROUTE,");
    expect(SOURCE).toContain("router.push(destination)");
    expect(SOURCE).not.toContain(`router.push("${EXIT_ROUTE}")`);
  });

  it("fades the overlay out before navigating", () => {
    expect(SOURCE).toContain("setExiting(true)");
    expect(SOURCE).toMatch(/transition-opacity/);
  });
});
