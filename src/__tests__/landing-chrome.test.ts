/**
 * Tests for the landing chrome: nav links and contrast, the accessible
 * mobile menu, the shared footer in the layout, the hero's capped entrance,
 * the removed dead code, and the FadeIn fallback.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { canObserve } from "@/components/landing/FadeIn";
import { FOOTER_LINKS } from "@/components/landing/LandingFooter";
import { COUNT_SETTLED_MS, EYEBROW_DELAY_MS, ROLL_START_MS } from "@/components/landing/synced-count-timing";

/** The em dash, spelled out so this file never contains one itself. */
const EM_DASH = String.fromCharCode(0x2014);

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");
const nav = read("src/components/landing/LandingNav.tsx");
const hero = read("src/components/landing/Hero.tsx");
const layout = read("src/app/(landing)/layout.tsx");
const footer = read("src/components/landing/LandingFooter.tsx");

describe("LandingNav", () => {
  it("links to the guides and reads Sign in, not Login", () => {
    expect(nav).toContain('{ label: "Guides", href: "/guides" }');
    expect(nav).toContain("{AUTH.signIn}");
    expect(nav).not.toMatch(/>\s*Login\s*</);
  });

  it("keeps inactive links at least gray-600 on white", () => {
    expect(nav).not.toContain("text-gray-400");
    expect(nav).not.toContain("text-gray-500");
    expect(nav).toContain("text-gray-600 hover:text-foreground");
  });

  it("makes the mobile menu a dialog with Escape, focus trap and a hidden page behind", () => {
    expect(nav).toContain('import { useDialog } from "@/components/ui/useDialog"');
    expect(nav).toContain("useDialog({ open: mobileMenuOpen, onClose: closeMenu })");
    expect(nav).toContain('role="dialog"');
    expect(nav).toContain('aria-modal="true"');
    // Both the page and the footer are hidden from assistive tech while open.
    expect(nav).toContain('document.querySelectorAll("main, footer")');
    expect(nav).toContain('el.setAttribute("aria-hidden", "true")');
    expect(nav).toContain("{mobileMenuOpen && (");
  });

  it("uses the accent ramp for the CTA and no brand hex", () => {
    expect(nav).toContain("bg-blue-500 text-white");
    expect(nav).not.toMatch(/#0e89d6|#3D8FE8/);
    expect(nav).not.toContain(EM_DASH);
  });

  it("prefetches each link once, not from both lists", () => {
    expect(nav.match(/\bprefetch\b/g)?.length ?? 0).toBeLessThanOrEqual(1);
  });
});

describe("landing layout and footer", () => {
  it("renders the footer once for every landing page, and on the 404", () => {
    const shell = read("src/components/landing/LandingShell.tsx");
    expect(shell).toContain("<LandingFooter />");
    expect(layout).toContain("<LandingShell>{children}</LandingShell>");
    expect(read("src/app/not-found.tsx")).toContain("<LandingShell>");
    expect(hero).not.toContain("<footer");
  });

  it("links to guides, privacy and terms with 44px targets and readable gray", () => {
    expect(FOOTER_LINKS.map((l) => l.href)).toEqual(["/guides", "/privacy", "/terms"]);
    expect(footer).toContain("min-h-11");
    expect(footer).toContain("text-muted-foreground");
    expect(footer).not.toMatch(/text-black\/[0-9]+/);
  });
});

describe("Hero", () => {
  it("caps every first-paint delay at 400 ms", () => {
    const delays = [...hero.matchAll(/^\s+(cluster|heading|subtitle|cta|mockup): (\d+),$/gm)].map((m) => Number(m[2]));
    expect(delays.length).toBe(5);
    for (const d of delays) expect(d).toBeLessThanOrEqual(400);
    expect(EYEBROW_DELAY_MS).toBeLessThanOrEqual(400);
    expect(ROLL_START_MS).toBe(EYEBROW_DELAY_MS);
    expect(COUNT_SETTLED_MS).toBe(EYEBROW_DELAY_MS + 800);
    expect(hero).not.toMatch(/animationDelay:\s*"\d{4}ms"/);
  });

  it("drops the inline SF Pro stacks so Geist applies", () => {
    expect(hero).not.toContain("SF Pro Display");
    expect(hero).toContain("font-sans text-[46px]");
  });

  it("has no Spots modal and no fabricated founder letter", () => {
    expect(hero).not.toContain("showSpotsModal");
    expect(hero).not.toContain("founder,");
  });

  it("uses tokens and the lowercase brand, with no em dashes or /70 muted text", () => {
    expect(hero).not.toMatch(/#0e89d6|#3D8FE8|#f6f5f4/);
    expect(hero).not.toMatch(/text-black\/70/);
    expect(hero).not.toContain('"Caltodo"');
    expect(hero).not.toContain(EM_DASH);
  });

  it("describes the step-sync screenshot with the current labels", () => {
    // No newer integrations screenshot exists in public/, so the image stays
    // and the caption names Canvas and Pensive rather than bCourses/Pensieve.
    expect(existsSync(path.join(ROOT, "public/step-sync.png"))).toBe(true);
    expect(hero).toContain("Connect Google Calendar, Canvas, Gradescope, Pensive and more");
    expect(hero).not.toContain('alt="Sync your classes"');
  });
});

describe("dead landing code", () => {
  it("is gone", () => {
    for (const file of ["StatsSection.tsx", "FeatureHighlight.tsx", "BentoFeatures.tsx"]) {
      expect(existsSync(path.join(ROOT, "src/components/landing", file)), file).toBe(false);
    }
  });

  it("no longer sets the unread ?welcome=1 param", () => {
    expect(read("src/app/auth/callback/route.ts")).not.toContain('searchParams.set("welcome"');
    expect(read("src/components/auth/GoogleOneTap.tsx")).not.toContain("welcome=1");
  });
});

describe("body font", () => {
  it("reads the next/font Geist variable directly, with a system fallback stack", () => {
    // --font-sans lives in @theme inline and resolves var(--font-geist-sans)
    // at :root, where next/font never defines it, so body fell back to the
    // system stack. Reading the body-level variable is what applies Geist.
    const css = read("src/app/globals.css");
    const start = css.indexOf("\nbody {");
    const body = css.slice(start, css.indexOf("}", start));
    expect(body).toMatch(/font-family: var\(--font-geist-sans\), ui-sans-serif, system-ui/);
    expect(body).not.toContain("var(--font-sans)");
  });
});

describe("FadeIn", () => {
  it("renders visible when IntersectionObserver is unavailable", () => {
    expect(canObserve(undefined)).toBe(false);
    expect(canObserve({})).toBe(false);
    expect(canObserve({ IntersectionObserver: function Observer() {} })).toBe(true);
    expect(read("src/components/landing/FadeIn.tsx")).toMatch(/if \(!canObserve\(window\)\) \{[\s\S]{0,200}setIsVisible\(true\)/);
  });
});
