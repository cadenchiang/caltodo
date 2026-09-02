/**
 * Tests that Google Classroom is not offered while Google blocks it.
 *
 * The integration is finished, but its two scopes are Google "restricted"
 * scopes: until the app is verified for them, Google's consent screen rejects
 * the authorization request. Offering a Connect that cannot connect spends a
 * student's first minute in the product on an error page, so both entry
 * points read "Coming soon" instead — and both read it from one flag, so
 * verification turns them back on together.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { CLASSROOM_AVAILABLE } from "@/lib/classroom-availability";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const onboarding = read("src/app/app/onboarding/page.tsx");
const settings = read("src/components/settings/GoogleClassroomSettings.tsx");

describe("the flag", () => {
  it("is off until Google verifies the app for the Classroom scopes", () => {
    expect(CLASSROOM_AVAILABLE).toBe(false);
  });

  it("names the scopes it is waiting on, so the reason outlives the commit", () => {
    const source = read("src/lib/classroom-availability.ts");
    expect(source).toContain("classroom.courses.readonly");
    expect(source).toContain("classroom.coursework.me.readonly");
  });
});

describe("the onboarding picker", () => {
  it("reads the flag rather than hard-coding the state", () => {
    expect(onboarding).toContain('import { CLASSROOM_AVAILABLE } from "@/lib/classroom-availability"');
    expect(onboarding).toContain('opt.id === "classroom" && !CLASSROOM_AVAILABLE');
  });

  it("disables the tile and labels it, instead of hiding it", () => {
    // Hiding it would answer "does this work with Classroom?" with silence.
    expect(onboarding).toContain("disabled={comingSoon}");
    expect(onboarding).toContain("Coming soon");
  });

  it("refuses the selection too, not only the click", () => {
    // A disabled attribute is not a guarantee: keyboard activation and stale
    // clicks both reach the handler.
    expect(onboarding).toContain('if (platform === "classroom" && !CLASSROOM_AVAILABLE) return;');
  });
});

describe("the settings card", () => {
  it("swaps Connect for the same label", () => {
    expect(settings).toContain('import { CLASSROOM_AVAILABLE } from "@/lib/classroom-availability"');
    expect(settings).toContain(") : CLASSROOM_AVAILABLE ? (");
    expect(settings).toContain("Coming soon");
  });

  it("still shows the panel to anyone who connected it before", () => {
    // The gate is on connecting, not on what an existing connection does.
    expect(settings).toContain("{enabled ? (");
  });
});
