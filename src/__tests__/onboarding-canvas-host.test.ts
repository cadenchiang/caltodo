/**
 * Tests for the Canvas API-mode host input: the host helpers, the
 * school-to-host lookup that prefills it, the form validators, and the
 * source of the step so the Berkeley hard-wire cannot come back.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { baseUrlFromHost, normalizeCanvasHost } from "@/components/onboarding/HostField";
import { validateTokenForm } from "@/components/onboarding/CanvasTokenForm";
import { validateFeedUrl } from "@/components/onboarding/CanvasFeedForm";
import { canvasSettingsUrl, formatTimestamp, TOKEN_STEPS } from "@/components/onboarding/TokenVideoGuide";
import { deriveCanvasLabel } from "@/components/onboarding/AddCanvasStep";
import { stableIdFromName } from "@/components/onboarding/CanvasStep";
import { BY_NORMALIZED_NAME, SCHOOLS, canvasHostForSchool } from "@/lib/seo/schools";
import { SCHOOL_OPTIONS } from "@/components/onboarding/onboardingOptions";

/** The em dash, spelled out so this file never contains one itself. */
const EM_DASH = String.fromCharCode(0x2014);

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");

describe("normalizeCanvasHost / baseUrlFromHost", () => {
  it("strips scheme, path, trailing slash and case", () => {
    expect(normalizeCanvasHost("https://Canvas.Stanford.edu/")).toBe("canvas.stanford.edu");
    expect(normalizeCanvasHost("http://bcourses.berkeley.edu/courses/1")).toBe("bcourses.berkeley.edu");
    expect(normalizeCanvasHost("  canvas.asu.edu  ")).toBe("canvas.asu.edu");
  });

  it("returns an empty string for nothing usable", () => {
    expect(normalizeCanvasHost("")).toBe("");
    expect(normalizeCanvasHost("https://")).toBe("");
    expect(baseUrlFromHost("")).toBe("");
  });

  it("always builds an https base URL", () => {
    expect(baseUrlFromHost("http://canvas.vt.edu/x")).toBe("https://canvas.vt.edu");
  });
});

describe("canvasHostForSchool", () => {
  it("resolves the schools the picker names exactly", () => {
    expect(canvasHostForSchool("UC Berkeley")).toBe("bcourses.berkeley.edu");
    expect(canvasHostForSchool("ucla")).toBe("bruinlearn.ucla.edu");
  });

  it("resolves picker names that differ by filler words or an alias", () => {
    expect(canvasHostForSchool("Florida State")).toBe("canvas.fsu.edu");
    expect(canvasHostForSchool("University of Central Florida (UCF)")).toBe("webcourses.ucf.edu");
  });

  it("never guesses for an unknown or empty school", () => {
    expect(canvasHostForSchool("")).toBeUndefined();
    expect(canvasHostForSchool("   ")).toBeUndefined();
    expect(canvasHostForSchool("Hogwarts")).toBeUndefined();
    expect(canvasHostForSchool("UC Irv")).toBeUndefined();
  });

  it("normalization keeps every school distinct", () => {
    expect(BY_NORMALIZED_NAME.size).toBe(SCHOOLS.length);
  });

  it("finds a host for a good share of the picker's Canvas schools", () => {
    const hits = SCHOOL_OPTIONS.filter((name) => canvasHostForSchool(name)).length;
    expect(hits).toBeGreaterThanOrEqual(30);
  });
});

describe("form validators", () => {
  it("token form requires a dotted host and a token", () => {
    expect(validateTokenForm("", "abc")).toMatch(/Canvas address/);
    expect(validateTokenForm("localhost", "abc")).toMatch(/hostname/);
    expect(validateTokenForm("canvas.asu.edu", "  ")).toMatch(/token/);
    expect(validateTokenForm("https://canvas.asu.edu/", "tok")).toBeNull();
  });

  it("feed form requires an https .ics URL", () => {
    expect(validateFeedUrl("")).toMatch(/Paste/);
    expect(validateFeedUrl("http://x.edu/feed.ics")).toMatch(/https/);
    expect(validateFeedUrl("https://x.edu/feed")).toMatch(/\.ics/);
    expect(validateFeedUrl("https://x.edu/feed.ics")).toBeNull();
  });
});

describe("token guide helpers", () => {
  it("formats timestamps and links to the host's settings", () => {
    expect(formatTimestamp(0)).toBe("0:00");
    expect(formatTimestamp(65)).toBe("1:05");
    expect(canvasSettingsUrl("canvas.asu.edu")).toBe("https://canvas.asu.edu/profile/settings");
    expect(canvasSettingsUrl("")).toContain("/profile/settings");
    expect(TOKEN_STEPS[0].time).toBe(0);
  });

  it("derives account labels and stable ids", () => {
    expect(deriveCanvasLabel("https://canvas.stanford.edu")).toBe("Canvas (stanford)");
    expect(deriveCanvasLabel("not a url")).toBe("Canvas");
    expect(stableIdFromName("CS 61A")).toBe(stableIdFromName("CS 61A"));
    expect(stableIdFromName("CS 61A")).toBeGreaterThan(0);
  });
});

describe("CanvasStep source", () => {
  const step = read("src/components/onboarding/CanvasStep.tsx");
  const page = read("src/app/app/onboarding/page.tsx");

  it("no longer hard-wires bcourses.berkeley.edu anywhere in the step or the draft", () => {
    expect(step).not.toContain("bcourses.berkeley.edu");
    expect(page).not.toContain("bcourses.berkeley.edu");
  });

  it("prefills the host from the school picked on the school step", () => {
    expect(page).toContain("schoolCanvasHost={canvasHostForSchool(school)}");
    expect(step).toContain('normalizeCanvasHost(initialBaseUrl ?? "") || schoolCanvasHost || ""');
  });

  it("sends the token in the POST body and the host as an https base URL", () => {
    expect(step).toContain('fetch("/api/canvas/courses", {');
    expect(step).toContain("base_url: baseUrlFromHost(host)");
  });

  it("wraps each screen in a form so Enter submits, with no raw inputs", () => {
    expect(step.match(/<form onSubmit=/g)?.length).toBe(2);
    expect(step).not.toContain("<input");
    expect(read("src/components/onboarding/CanvasFeedForm.tsx")).toContain("<form onSubmit={handleSubmit} noValidate");
    expect(read("src/components/onboarding/CanvasTokenForm.tsx")).toContain("<form onSubmit={handleSubmit} noValidate");
  });

  it("uses the shared picker and no brand hex", () => {
    expect(step).toContain("<CoursePicker");
    for (const file of ["CanvasStep.tsx", "AddCanvasStep.tsx", "CanvasFeedForm.tsx", "CanvasTokenForm.tsx", "TokenVideoGuide.tsx", "HostField.tsx", "SecretField.tsx"]) {
      const src = read(`src/components/onboarding/${file}`);
      expect(src, file).not.toMatch(/#0e89d6|#3D8FE8|#2a2a2c|#D1D1D6|#3A3A3C/);
      expect(src, file).not.toContain(EM_DASH);
    }
  });
});

describe("SecretField and HostField accessibility", () => {
  it("labels the eye toggle and the host input", () => {
    const secret = read("src/components/onboarding/SecretField.tsx");
    expect(secret).toContain("aria-label={shown ? `Hide ${secretNoun}` : `Show ${secretNoun}`}");
    expect(secret).toContain("<TextField");
    const host = read("src/components/onboarding/HostField.tsx");
    expect(host).toContain("<label htmlFor={id}");
    expect(host).toContain("https://");
  });
});
