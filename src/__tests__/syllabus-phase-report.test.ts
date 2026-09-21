/**
 * Tests for how SyllabusStep reports its phase to the onboarding layout.
 *
 * Audit M22: the parent only heard about phase transitions, so backing out
 * of the preview and returning left `flowSyllabusPreview` true: the wide
 * layout stayed and the shared Skip control was gone. The step must report
 * its phase on mount and reset it on unmount.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const step = read("src/components/onboarding/SyllabusStep.tsx");
const page = read("src/app/app/onboarding/page.tsx");

describe("SyllabusStep phase reporting", () => {
  it("reports the phase on every change, including the initial mount", () => {
    expect(step).toMatch(/useEffect\(\(\) => \{\s*onPhaseChangeRef\.current\?\.\(phase\);\s*\}, \[phase\]\);/);
  });

  it("resets the parent to upload on unmount", () => {
    expect(step).toMatch(/return \(\) => onPhaseChangeRef\.current\?\.\("upload"\);\s*\}, \[\]\);/);
  });

  it("does not also notify from the setter, which would double-report", () => {
    expect(step).not.toContain("onPhaseChange?.(p)");
    expect(step).toContain('const [phase, setPhase] = useState<"upload" | "extracting" | "preview">("upload");');
  });

  it("tracks the latest callback without re-running the mount effect", () => {
    expect(step).toContain("const onPhaseChangeRef = useRef(onPhaseChange);");
  });
});

describe("the onboarding layout", () => {
  it("still lays out and gates Skip from the reported phase", () => {
    expect(page).toContain('const flowSyllabusPreview = currentStep === "syllabus" && syllabusPhase === "preview";');
    expect(page).toContain("onPhaseChange={setSyllabusPhase}");
  });
});
