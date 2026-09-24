/**
 * Tests for the onboarding page chrome after extraction: the tile primitive,
 * the platform grid, the intro steps, the skip-setup ConfirmDialog, the
 * combobox semantics of SearchableSelect, and the token sweep.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { TILE_BASE, TILE_SELECTED, TILE_UNSELECTED } from "@/components/onboarding/SelectableTile";
import { PLATFORM_OPTIONS, isPlatformSelectable } from "@/components/onboarding/PlatformsStep";
import { ONBOARDING_PLATFORMS } from "@/lib/onboarding-progress";
import { CLASSROOM_AVAILABLE } from "@/lib/classroom-availability";

/** The em dash, spelled out so this file never contains one itself. */
const EM_DASH = String.fromCharCode(0x2014);

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");
const page = read("src/app/app/onboarding/page.tsx");

describe("SelectableTile", () => {
  const src = read("src/components/onboarding/SelectableTile.tsx");

  it("keeps a visible focus ring and exposes aria-pressed", () => {
    expect(TILE_BASE).toContain("focus-visible:ring-2");
    expect(TILE_BASE).not.toContain("focus:outline-none");
    expect(src).toContain("aria-pressed={selected}");
  });

  it("paints the accent through the token ramp", () => {
    expect(TILE_SELECTED).toBe("border-blue-500");
    expect(TILE_UNSELECTED).toContain("hover:border-blue-500/30");
  });
});

describe("PlatformsStep", () => {
  const src = read("src/components/onboarding/PlatformsStep.tsx");

  it("offers every onboarding platform through SelectableTile", () => {
    expect(PLATFORM_OPTIONS.map((o) => o.id).sort()).toEqual([...ONBOARDING_PLATFORMS].sort());
    expect(src).toContain("<SelectableTile");
  });

  it("gates Google Classroom on the flag", () => {
    expect(isPlatformSelectable("canvas")).toBe(true);
    expect(isPlatformSelectable("classroom")).toBe(CLASSROOM_AVAILABLE);
  });

  it("reads In progress, not Saved, on a drafted tile, and uses Badge", () => {
    expect(src).toContain('<Badge variant="info">In progress</Badge>');
    expect(src).not.toMatch(/>\s*Saved\s*</);
  });

  it("is a form with a submit Button and a shared skip label", () => {
    expect(src).toContain("<form onSubmit={handleSubmit} noValidate>");
    expect(src).toContain('<Button type="submit" variant="inverted" size="lg"');
    expect(src).toContain("{SKIP_LABEL}");
    expect(src).toContain("Select your platforms");
  });
});

describe("IntroSteps", () => {
  const src = read("src/components/onboarding/IntroSteps.tsx");

  it("wraps the pickers in a form so Enter continues once a value is chosen", () => {
    expect(src).toContain("<form onSubmit={handleSubmit} noValidate>");
    expect(src).toContain("if (!value.trim()) return;");
    expect(src).toContain('<Button type="submit" variant="inverted" size="lg" className="mt-8 w-full" disabled={!value.trim()}>');
  });

  it("labels the select and uses sentence case", () => {
    expect(src).toContain("label={label}");
    expect(src).toContain("Get started");
    expect(src).not.toContain("Get Started");
  });
});

describe("SearchableSelect", () => {
  const src = read("src/components/onboarding/SearchableSelect.tsx");

  it("renders a visible label and combobox semantics", () => {
    expect(src).toContain('aria-haspopup="listbox"');
    expect(src).toContain("aria-expanded={open}");
    expect(src).toContain('role="listbox"');
    expect(src).toContain('role="option"');
    expect(src).toContain('role="combobox"');
    expect(src).toContain("aria-labelledby={labelId}");
  });

  it("uses tokens, not hardcoded neutrals", () => {
    expect(src).not.toContain("#1c1c1e");
    expect(src).not.toMatch(/black\/(5|10|20)/);
    expect(src).toContain("bg-popover");
    expect(src).toContain("z-dropdown");
  });
});

describe("onboarding page", () => {
  it("drives the progress bar from the dynamic step list with progressbar semantics", () => {
    expect(page).toContain("progressPercentInList(currentStep, steps)");
    expect(page).toContain('role="progressbar"');
    expect(page).toContain("aria-valuenow={progressPercent}");
  });

  it("uses ConfirmDialog for skip setup and exits through handleSyncAndGo", () => {
    expect(page).toContain("<ConfirmDialog");
    expect(page).toContain('title="Skip setup for now?"');
    expect(page).toMatch(/onConfirm=\{\(\) => \{[\s\S]{0,300}handleSyncAndGo\(\{ skipSync: true \}\)/);
    expect(page).not.toContain("z-[60]");
  });

  it("renders the intro and platform steps through the extracted components", () => {
    expect(page).toContain("<WelcomeStep");
    expect(page.match(/<PickerStep/g)?.length).toBe(2);
    expect(page).toContain("<PlatformsStep");
    expect(page).not.toContain("STEP_LABELS");
  });

  it("has no brand hex, hardcoded neutrals, low-alpha muted text, or em dashes", () => {
    expect(page).not.toMatch(/#0e89d6|#3D8FE8|#f6f5f4|#202022|#2a2a2c|#D1D1D6|#3A3A3C|#1c1c1e|#E5E5E7/);
    expect(page).not.toMatch(/muted-foreground\/(70|60|50)/);
    expect(page).not.toMatch(/text-red-400/);
    expect(page).not.toContain("uppercase");
    expect(page).not.toContain(EM_DASH);
  });

  it("is under 1,200 lines after the extraction", () => {
    expect(page.split("\n").length).toBeLessThan(1200);
  });
});

describe("onboarding components", () => {
  it("none carries brand hex, the retired neutrals, or em dashes", () => {
    const dir = path.join(ROOT, "src/components/onboarding");
    for (const file of readdirSync(dir)) {
      const src = read(`src/components/onboarding/${file}`);
      expect(src, file).not.toMatch(/#0e89d6|#3D8FE8|#f6f5f4|#202022|#2a2a2c|#D1D1D6|#3A3A3C|#1c1c1e/);
      expect(src, file).not.toContain(EM_DASH);
    }
  });

  it("uses one skip idiom and one primary-button idiom across every step", () => {
    const dir = path.join(ROOT, "src/components/onboarding");
    for (const file of readdirSync(dir).filter((f) => f.endsWith("Step.tsx"))) {
      const src = read(`src/components/onboarding/${file}`);
      // No hand-rolled inverted button; every primary goes through Button.
      expect(src, file).not.toContain("bg-gray-900 dark:bg-white text-white dark:text-gray-900");
      expect(src, file).not.toContain("btn-elevated-primary");
      // Skip controls, where a step renders one, use the glossary label.
      expect(src, file).not.toMatch(/>\s*Skip for now\s*</);
    }
  });

  it("uses Title Case nowhere in step headings or buttons", () => {
    for (const file of ["CalendarStep.tsx", "ClassroomStep.tsx", "SyllabusPreview.tsx", "SyllabusExtracting.tsx"]) {
      const src = read(`src/components/onboarding/${file}`);
      expect(src, file).not.toMatch(/"(Select|Deselect) All"/);
      expect(src, file).not.toMatch(/Save & Next|Extract Assignments|Let's Go|Get Started/);
    }
  });
});

describe("landing pages and contact form", () => {
  it("contact form has visible labels, no gray uppercase, and an announced outcome", () => {
    const form = read("src/components/landing/ContactForm.tsx");
    expect(form).toContain("<TextField");
    expect(form).toContain("<TextArea");
    expect(form).not.toContain("uppercase");
    expect(form).toContain('aria-live="polite"');
    expect(form).not.toMatch(/#0e89d6|#f6f5f4|text-gray-/);
  });

  it("about, contact and guides use tokens, no brand hex, delays capped at 400 ms", () => {
    for (const rel of ["src/app/(landing)/about/page.tsx", "src/app/(landing)/contact/page.tsx", "src/app/(landing)/guides/page.tsx"]) {
      const src = read(rel);
      expect(src, rel).not.toMatch(/#0e89d6|#3D8FE8|#f6f5f4|text-black\b/);
      expect(src, rel).not.toContain(EM_DASH);
      for (const m of src.matchAll(/animationDelay: "(\d+)ms"/g)) expect(Number(m[1]), rel).toBeLessThanOrEqual(400);
    }
  });
});
