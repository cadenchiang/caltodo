/**
 * Tests for the Gradescope, Pensive, Brightspace and Blackboard steps after
 * the move onto shared pieces: labeled fields, forms that submit on Enter,
 * the merge dialog on Modal, and validators that run outside React.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { findOverlappingCourses } from "@/components/onboarding/GradescopeStep";
import { validatePensieveUrl } from "@/components/onboarding/PensieveStep";
import { validateFeedUrl } from "@/components/onboarding/FeedUrlStep";
import { BRIGHTSPACE_STEPS } from "@/components/onboarding/BrightspaceStep";
import { BLACKBOARD_STEPS } from "@/components/onboarding/BlackboardStep";

/** The em dash, spelled out so this file never contains one itself. */
const EM_DASH = String.fromCharCode(0x2014);

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, `src/components/onboarding/${rel}`), "utf8");

describe("findOverlappingCourses", () => {
  const fetched = [
    { id: "1", name: "CS 61A Structure of Programs", shortName: "61A" },
    { id: "2", name: "Math 54", shortName: "54" },
  ];

  it("returns the Gradescope classes whose code matches a Canvas class", () => {
    const overlaps = findOverlappingCourses(fetched, [{ name: "CS 61A Fall 2026" }]);
    expect(overlaps.map((c) => c.id)).toEqual(["1"]);
  });

  it("returns nothing without Canvas classes", () => {
    expect(findOverlappingCourses(fetched, undefined)).toEqual([]);
    expect(findOverlappingCourses(fetched, [])).toEqual([]);
  });
});

describe("validators", () => {
  it("pensive requires the api.pensieve.co calendar shape", () => {
    expect(validatePensieveUrl("")).toMatch(/Pensive/);
    expect(validatePensieveUrl("https://example.com/x.ics")).toMatch(/api\.pensieve\.co/);
    expect(validatePensieveUrl("https://api.pensieve.co/api/calendar/abc.ics")).toBeNull();
  });

  it("feed steps require https and name the provider", () => {
    expect(validateFeedUrl("", "Blackboard")).toBe("Please enter your Blackboard calendar URL.");
    expect(validateFeedUrl("http://x.edu/f.ics", "Brightspace")).toMatch(/https/);
    expect(validateFeedUrl("https://x.edu/f.ics", "Brightspace")).toBeNull();
  });

  it("instruction copy is sentence case with no em dashes", () => {
    for (const step of [...BRIGHTSPACE_STEPS, ...BLACKBOARD_STEPS]) {
      expect(step).not.toContain(EM_DASH);
      expect(step[0]).toBe(step[0].toUpperCase());
    }
  });
});

describe("step sources", () => {
  const files = ["GradescopeStep.tsx", "PensieveStep.tsx", "FeedUrlStep.tsx", "GradescopeMergeDialog.tsx", "GradescopeAuthHelp.tsx"];

  it("every input is a labeled TextField or SecretField, inside a form", () => {
    for (const file of ["GradescopeStep.tsx", "PensieveStep.tsx", "FeedUrlStep.tsx"]) {
      const src = read(file);
      expect(src, file).not.toContain("<input");
      expect(src, file).toMatch(/<form onSubmit=/);
      expect(src, file).toMatch(/<Button type="submit"/);
    }
    expect(read("GradescopeStep.tsx")).toContain('label="Gradescope password"');
    expect(read("GradescopeStep.tsx")).toContain('label="School email"');
  });

  it("the merge dialog is a Modal, not a hand-rolled overlay", () => {
    const src = read("GradescopeMergeDialog.tsx");
    expect(src).toContain("<Modal");
    expect(src).not.toContain("fixed inset-0");
    expect(read("GradescopeStep.tsx")).toContain("<GradescopeMergeDialog");
  });

  it("brightspace and blackboard share FeedUrlStep", () => {
    expect(read("BrightspaceStep.tsx")).toContain('provider="brightspace"');
    expect(read("BlackboardStep.tsx")).toContain('provider="blackboard"');
  });

  it("uses tokens and readable text, no brand hex, no low-alpha muted text, no em dashes", () => {
    for (const file of files) {
      const src = read(file);
      expect(src, file).not.toMatch(/#0e89d6|#3D8FE8|#2a2a2c|#D1D1D6|#3A3A3C/);
      expect(src, file).not.toMatch(/muted-foreground\/(70|60|50)/);
      expect(src, file).not.toMatch(/text-red-400"/);
      expect(src, file).not.toContain(EM_DASH);
      expect(src, file).not.toContain("uppercase");
    }
  });
});
