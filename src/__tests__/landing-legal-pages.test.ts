/**
 * Tests for /privacy and /terms: every processor the code actually uses is
 * disclosed, the dates are current, and both pages share the LegalPage shell.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MAX_ENTRANCE_DELAY_MS, sectionDelayMs } from "@/components/landing/LegalPage";

/** The em dash, spelled out so this file never contains one itself. */
const EM_DASH = String.fromCharCode(0x2014);

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");
const privacy = read("src/app/(landing)/privacy/page.tsx");
const terms = read("src/app/(landing)/terms/page.tsx");
const shell = read("src/components/landing/LegalPage.tsx");

const PROCESSORS = ["PostHog", "Anthropic", "Supabase", "Vercel", "Google"];
const PLATFORMS = ["Canvas", "Gradescope", "Pensive", "Brightspace", "Blackboard", "Google Classroom"];

describe("privacy policy", () => {
  it("names every processor in the third-party section", () => {
    const section = privacy.slice(privacy.indexOf('"7. Third-party services"'));
    for (const name of PROCESSORS) expect(section, name).toContain(name);
  });

  it("names every platform in the platform-data section", () => {
    // JSX wraps prose across lines, so collapse whitespace before matching.
    const section = privacy
      .slice(privacy.indexOf("Course platform data"), privacy.indexOf("Syllabus files"))
      .replace(/\s+/g, " ");
    for (const name of PLATFORMS) expect(section, name).toContain(name);
  });

  it("discloses PostHog autocapture and syllabus files going to Anthropic", () => {
    expect(privacy).toMatch(/PostHog[\s\S]{0,120}autocapture/);
    expect(privacy).toMatch(/Anthropic&rsquo;s Claude API/);
  });

  it("only claims encryption for what the code encrypts", () => {
    // Gradescope passwords and Google Calendar tokens are encrypted; Canvas
    // tokens are stored as given, so the policy must not say otherwise.
    expect(privacy).toContain("Gradescope passwords and Google Calendar tokens are encrypted");
    expect(privacy).not.toMatch(/connected-platform tokens are encrypted/);
  });

  it("is dated 2026-09-23 and spells Pensive as the product does", () => {
    expect(privacy).toContain('"September 23, 2026"');
    expect(privacy).not.toContain("Pensieve");
  });
});

describe("terms of service", () => {
  it("lists the same platforms and the two processors", () => {
    const section = terms.slice(terms.indexOf('"7. Third-party integrations and services"'));
    for (const name of [...PLATFORMS.filter((p) => p !== "Google Classroom"), "Anthropic", "PostHog"]) {
      expect(section, name).toContain(name);
    }
    expect(terms).toContain("Classroom");
  });

  it("is dated 2026-09-23", () => {
    expect(terms).toContain('"September 23, 2026"');
  });
});

describe("shared legal shell", () => {
  it("both pages render through LegalPage with sentence-case titles", () => {
    expect(privacy).toContain('<LegalPage title="Privacy policy"');
    expect(terms).toContain('<LegalPage title="Terms of service"');
    expect(privacy).toContain('title: "Privacy policy",');
    expect(terms).toContain('title: "Terms of service",');
    expect(privacy).not.toContain("- caltodo");
    expect(terms).not.toContain("- caltodo");
  });

  it("uses tokens, no brand hex, no em dashes, no black alpha text", () => {
    for (const src of [privacy, terms, shell]) {
      expect(src).not.toMatch(/#0e89d6|#3D8FE8/);
      expect(src).not.toContain(EM_DASH);
      expect(src).not.toMatch(/text-black\/[0-9]+/);
    }
    expect(shell).toContain("text-muted-foreground");
  });

  it("caps the entrance stagger at 400 ms and gives the back link a 44px target", () => {
    expect(MAX_ENTRANCE_DELAY_MS).toBe(400);
    expect(sectionDelayMs(0)).toBe(160);
    expect(sectionDelayMs(12)).toBe(400);
    expect(shell).toContain("min-h-11");
  });
});
