/**
 * Tests that standalone ?setup=<platform> visits do not touch flow state.
 *
 * Audit M23: every standalone visit from Settings fired a phantom
 * `onboarding_step_viewed {welcome}` and wrote a bogus progress snapshot,
 * because the restore/save/step-viewed effects ran before the standalone
 * early return further down the component.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const page = fs.readFileSync(path.join(ROOT, "src/app/app/onboarding/page.tsx"), "utf8");

/** The effect body that starts at `marker`, up to its dependency array. */
function effectFrom(marker: string): string {
  const start = page.indexOf(marker);
  expect(start).toBeGreaterThan(-1);
  const open = page.lastIndexOf("useEffect(() => {", start);
  const close = page.indexOf("}, [", open);
  return page.slice(open, page.indexOf("]);", close) + 3);
}

describe("standalone setup mode", () => {
  it("does not restore saved flow progress", () => {
    const effect = effectFrom("const saved = loadProgress();");
    expect(effect).toMatch(/useEffect\(\(\) => \{\s*if \(isStandaloneSetup\) return;/);
    expect(effect).toContain("[isStandaloneSetup]");
  });

  it("does not write a progress snapshot", () => {
    const effect = effectFrom("saveProgress({");
    expect(effect).toMatch(/useEffect\(\(\) => \{\s*if \(isStandaloneSetup\) return;/);
    expect(effect).toContain("[isStandaloneSetup, restored, currentStep");
  });

  it("does not fire onboarding_step_viewed", () => {
    const effect = effectFrom('trackEvent("onboarding_step_viewed"');
    expect(effect).toMatch(/useEffect\(\(\) => \{\s*if \(isStandaloneSetup\) return;/);
    expect(effect).toContain("[isStandaloneSetup, currentStep, restored]");
  });

  it("is derived before the effects that consult it", () => {
    expect(page.indexOf("const isStandaloneSetup =")).toBeLessThan(page.indexOf("const saved = loadProgress();"));
  });
});
