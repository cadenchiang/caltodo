/**
 * Tests the platform picker at the top of onboarding.
 *
 * The list is where a new user decides what caltodo will sync, so an
 * integration missing from it is effectively hidden from everyone who has not
 * gone looking in settings. The other failure it guards is subtler: an option
 * that can be selected but has no step to run, which silently drops the user
 * past the setup they just asked for.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ONBOARDING_PLATFORMS, ONBOARDING_STEPS } from "@/lib/onboarding-progress";
import { INTEGRATION_CATALOG } from "@/lib/integration-catalog";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const page = read("src/app/app/onboarding/page.tsx");

describe("every integration is offered", () => {
  it("lists the same set the settings catalog does", () => {
    // The picker had six of the eight: Google Calendar and Google Classroom
    // were connectable from settings and absent here.
    expect([...ONBOARDING_PLATFORMS].sort()).toEqual(
      INTEGRATION_CATALOG.map((e) => e.id).sort()
    );
  });

  it("renders an option for each", () => {
    for (const platform of ONBOARDING_PLATFORMS) {
      expect(page).toMatch(new RegExp(`id: "${platform}", label:`));
    }
  });

  it("ships a logo for each option", () => {
    const logos = page.match(/logo: "([^"]+)"/g) ?? [];
    expect(logos.length).toBe(ONBOARDING_PLATFORMS.length);
    for (const entry of logos) {
      const file = entry.slice('logo: "'.length, -1);
      expect(fs.existsSync(path.join(ROOT, "public", file))).toBe(true);
    }
  });
});

describe("every option has a step behind it", () => {
  it("gives each platform a step in the flow", () => {
    for (const platform of ONBOARDING_PLATFORMS) {
      expect(ONBOARDING_STEPS as readonly string[]).toContain(platform);
    }
  });

  it("renders that step", () => {
    for (const platform of ONBOARDING_PLATFORMS) {
      expect(page).toContain(`currentStep === "${platform}"`);
    }
  });

  it("adds each selected platform to the derived step list", () => {
    // Rendering a step is not enough: `steps` is what nextStepAfter() walks,
    // and gcal and classroom were missing from it, so selecting Google
    // Calendar went straight to the next platform without ever showing it.
    for (const platform of ONBOARDING_PLATFORMS) {
      expect(page).toContain(
        `if (selectedPlatforms.has("${platform}")) platformSteps.push("${platform}");`
      );
    }
  });

  it("derives platform steps in the canonical order", () => {
    const order = ONBOARDING_PLATFORMS
      .map((pf) => page.indexOf(`platformSteps.push("${pf}")`));
    const canonical = [...ONBOARDING_PLATFORMS]
      .sort((a, b) => ONBOARDING_STEPS.indexOf(a) - ONBOARDING_STEPS.indexOf(b))
      .map((pf) => page.indexOf(`platformSteps.push("${pf}")`));
    expect([...order].sort((a, b) => a - b)).toEqual(canonical);
  });

  it("connects Google Calendar through OAuth, not a pasted feed URL", () => {
    const step = read("src/components/onboarding/CalendarStep.tsx");
    expect(step).toContain('"/api/gcal/auth?return=onboarding"');
    expect(step).toContain("setUpConnectedCalendar");
    expect(step).not.toContain("/api/calendar/token");
    // TaskContext gates per-edit pushes on this cache; settings writes it,
    // so the onboarding path has to as well.
    expect(step).toMatch(/localStorage\.setItem\("gcal_status"/);
    // The shared skip chrome does not cover this step, so it renders its own.
    expect(step).toMatch(/onClick=\{onSkip\}/);
  });

  it("wires the two that were previously unreachable from the flow", () => {
    // CalendarStep existed but nothing imported it; ClassroomStep was only
    // reachable from the standalone ?setup= route.
    expect(page).toContain('import CalendarStep from "@/components/onboarding/CalendarStep"');
    expect(page).toContain("<CalendarStep");
    expect(page).toMatch(/currentStep === "classroom"[\s\S]{0,200}<ClassroomStep/);
  });
});

describe("the step fits without scrolling", () => {
  it("lays the options out in two columns", () => {
    expect(page).toContain('className="grid grid-cols-2 gap-2 mb-6"');
  });

  it("drops the 20vh lift that pushed Continue past the fold", () => {
    // The lift is real height inside the scroller, not a transform.
    expect(page).toContain('currentStep === "platforms"\n                  ? "py-8"');
  });

  it("keeps the lift for the steps that still want it", () => {
    expect(page).toContain('pt-4 pb-[20vh]');
  });
});

describe("skipping the step", () => {
  it("offers a skip beneath Continue, centred under it", () => {
    // Scoped to this step: several steps end in a Continue button, and the
    // one that matters is the one this picker owns. Continue spans the card,
    // so a bare inline button under it sat against the left edge and read as
    // a stray link rather than the pair's second option.
    const step = page.slice(page.indexOf('currentStep === "platforms" && ('));
    const continueEnd = step.indexOf("Continue\n");
    const skip = step.indexOf("Skip for now");
    expect(continueEnd).toBeGreaterThan(-1);
    expect(skip).toBeGreaterThan(continueEnd);
    expect(step.slice(continueEnd, skip)).toContain("mt-3 flex justify-center");
  });

  it("reports a completion as well as a skip", () => {
    // A step that reports only skips yields a funnel that can only ever show
    // people leaving.
    expect(page).toContain('trackEvent("onboarding_step_completed", { step: "platforms" })');
    expect(page).toContain('trackEvent("onboarding_step_skipped", { step: "platforms" })');
  });

  it("sends a skipping user straight into the app rather than into a platform step", () => {
    // Nothing was selected, so there is nothing to sync on the done step;
    // the skip exits through the same completion path as skip-setup.
    expect(page).toMatch(/step: "platforms" \}\);\n\s*handleSyncAndGo\(\{ skipSync: true \}\);/);
  });
});
