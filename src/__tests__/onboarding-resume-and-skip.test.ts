/**
 * Tests for onboarding resume and the shared skip control.
 *
 * The flow is a 1400-line client component that the node test environment
 * cannot render, so these parse the source for the wiring that the production
 * funnel data showed to be missing. Behaviour of the persistence itself is
 * covered by onboarding-progress.test.ts.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const PAGE = path.join(ROOT, "src/app/app/onboarding/page.tsx");
const page = fs.readFileSync(PAGE, "utf8");

const STEP_COMPONENTS = ["Canvas", "Gradescope", "Pensieve", "Syllabus"] as const;

describe("resume", () => {
  it("restores saved progress on mount", () => {
    expect(page).toContain("loadProgress()");
    expect(page).toMatch(/const saved = loadProgress\(\);[\s\S]{0,400}setCurrentStep\(saved\.step\)/);
  });

  it("restores the platform set, which the step list is derived from", () => {
    // Resuming to a platform step without its platform selected would render
    // an empty flow, because `steps` is computed from selectedPlatforms.
    expect(page).toMatch(/setSelectedPlatforms\(new Set\(saved\.platforms/);
  });

  it("persists on every change once restore has settled", () => {
    expect(page).toMatch(/if \(!restored \|\| currentStep === "done"\) return;[\s\S]{0,200}saveProgress\(\{/);
  });

  it("does not overwrite the snapshot before it has been read", () => {
    // Saving on the initial "welcome" render would clobber the saved step.
    const save = page.indexOf("saveProgress({");
    const guard = page.lastIndexOf("if (!restored", 0 + save);
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(save);
  });

  it("holds the step_viewed event until restore has run", () => {
    // Firing early logs a phantom "welcome" for every resumed session, which
    // is the double-count this whole change exists to remove.
    expect(page).toMatch(
      /if \(!restored\) return;\s*trackEvent\("onboarding_step_viewed"/
    );
  });

  it("clears progress when onboarding completes", () => {
    expect(page).toMatch(/trackEvent\("onboarding_completed"\);[\s\S]{0,300}clearProgress\(\)/);
  });

  it("clears progress when the user deliberately skips out", () => {
    expect(page).toMatch(/clearProgress\(\);[\s\S]{0,200}router\.push\("\/app\/inbox"\)/);
  });

  it("derives its Step type from the persisted union so they cannot drift", () => {
    expect(page).toContain("type Step = OnboardingStep;");
  });
});

describe("shared skip control", () => {
  it("declares which steps need it", () => {
    expect(page).toContain("STEPS_NEEDING_SKIP_CONTROL");
    for (const c of STEP_COMPONENTS) {
      expect(page).toMatch(new RegExp(`STEPS_NEEDING_SKIP_CONTROL[\\s\\S]{0,200}"${c.toLowerCase()}"`));
    }
  });

  it("excludes brightspace, which renders its own", () => {
    const decl = page.slice(
      page.indexOf("const STEPS_NEEDING_SKIP_CONTROL"),
      page.indexOf("];", page.indexOf("const STEPS_NEEDING_SKIP_CONTROL"))
    );
    expect(decl).not.toContain("brightspace");
  });

  it("renders a control that calls the skip handler", () => {
    expect(page).toMatch(/STEPS_NEEDING_SKIP_CONTROL\.includes\(currentStep\)/);
    expect(page).toMatch(/onClick=\{\(\) => handleSkipStep\(currentStep\)\}/);
  });

  it("fires the analytics event that had never fired before", () => {
    expect(page).toMatch(
      /handleSkipStep = useCallback\(\(step: Step\) => \{\s*trackEvent\("onboarding_step_skipped", \{ step \}\)/
    );
  });

  it("advances to the next step", () => {
    expect(page).toMatch(/handleSkipStep[\s\S]{0,300}setCurrentStep\(nextStepAfter\(step\)\)/);
  });

  it("cannot be used mid-save", () => {
    expect(page).toMatch(/onClick=\{\(\) => handleSkipStep\(currentStep\)\}[\s\S]{0,120}disabled=\{saving\}/);
  });

  it("stays hidden during the syllabus preview", () => {
    expect(page).toMatch(/STEPS_NEEDING_SKIP_CONTROL\.includes\(currentStep\) && !flowSyllabusPreview/);
  });
});

describe("step components still have a reachable skip", () => {
  it("brightspace renders its own, so it is genuinely covered", () => {
    const bs = fs.readFileSync(
      path.join(ROOT, "src/components/onboarding/BrightspaceStep.tsx"), "utf8");
    expect(bs).toMatch(/onClick=\{onSkip\}/);
  });

  it("the other four are covered by the shared control, not their own", () => {
    for (const c of STEP_COMPONENTS) {
      const src = fs.readFileSync(
        path.join(ROOT, `src/components/onboarding/${c}Step.tsx`), "utf8");
      const invocations = src.match(/onClick=\{onSkip\}|onSkip\(\)/g) ?? [];
      expect(invocations, `${c}Step should not render its own skip`).toHaveLength(0);
      expect(page).toMatch(new RegExp(`"${c.toLowerCase()}"`));
    }
  });
});
