/**
 * Tests that every onboarding step a user can finish reports that it finished.
 *
 * `syllabus` was the counterexample: it was the second most-selected platform
 * and 60 people reached its step in a 90-day window, but it was the only
 * integration step whose "next" handler emitted no `onboarding_step_completed`.
 * Its drop-off was structurally invisible — not low, unmeasurable.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/app/onboarding/page.tsx"),
  "utf8",
);

/** Steps that a user completes and that must therefore report completion. */
const COMPLETABLE_STEPS = [
  "school",
  "referral",
  "canvas",
  "gradescope",
  "pensieve",
  "brightspace",
  "blackboard",
  "syllabus",
] as const;

/**
 * Collects the `step` values passed to a given onboarding event.
 *
 * @param event - Event name to scan for.
 * @returns Every step literal the file emits for that event, in source order.
 */
function stepsEmittedFor(event: string): string[] {
  const re = new RegExp(
    `trackEvent\\("${event}",\\s*\\{\\s*step:\\s*"([a-z]+)"`,
    "g",
  );
  return [...page.matchAll(re)].map((m) => m[1]);
}

describe("onboarding_step_completed", () => {
  const emitted = new Set(stepsEmittedFor("onboarding_step_completed"));

  it.each(COMPLETABLE_STEPS)("is emitted for the %s step", (step) => {
    expect(emitted).toContain(step);
  });

  it("covers the syllabus step specifically, on its onNext handler", () => {
    // The regression this file exists for: onNext used to only advance.
    expect(page).toMatch(
      /onNext=\{async \(\) => \{ trackEvent\("onboarding_step_completed", \{ step: "syllabus" \}\); setCurrentStep\(nextStepAfter\("syllabus"\)\)/,
    );
  });
});

describe("step event symmetry", () => {
  it("does not report a skip for a step that cannot report completion", () => {
    // A step with a skip but no completion yields a funnel that can only ever
    // show people leaving, which is what made syllabus look like a dead end.
    const skipped = new Set(stepsEmittedFor("onboarding_step_skipped"));
    const completed = new Set(stepsEmittedFor("onboarding_step_completed"));
    for (const step of skipped) {
      expect(completed).toContain(step);
    }
  });

  it("still emits the terminal onboarding_completed event", () => {
    expect(page).toContain('trackEvent("onboarding_completed")');
  });
});
