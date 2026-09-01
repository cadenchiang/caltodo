/**
 * Tests the guards that keep the applied theme from flipping after load.
 *
 * The pre-paint script in layout.tsx and ThemeProvider both decide a theme,
 * and a visible flash is what happens when they disagree for a moment. Two
 * things have to hold: the solar fallback must not run before the stored
 * preference has been read, and the browser must be told which scheme the
 * page is in rather than inferring it from the OS.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getSunTimes, isDarkBySun } from "@/lib/solar";
import { getFallbackCoords } from "@/lib/geolocation";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("solar effect gating", () => {
  const ctx = read("src/contexts/ThemeContext.tsx");

  it("waits for the stored preference before resolving auto mode", () => {
    // preference starts at "auto" for everyone because the server cannot read
    // localStorage; running the solar effect on that value overwrites an
    // explicit light choice with a sunset-derived dark one.
    expect(ctx).toContain('if (!hydrated || preference !== "auto") return;');
  });

  it("re-runs the effect once the read lands", () => {
    expect(ctx).toContain("}, [preference, hydrated]);");
  });

  it("sets the flag from the effect that does the read", () => {
    const mount = ctx.slice(ctx.indexOf("const stored = getInitialPreference();"));
    const body = mount.slice(0, mount.indexOf("}, []);"));
    expect(body).toContain("setHydrated(true);");
  });

  it("still defaults to auto, matching the pre-paint script", () => {
    const layout = read("src/app/layout.tsx");
    // The script treats a missing value as auto; getInitialPreference must
    // agree or every unset user paints one theme and renders the other.
    expect(ctx).toContain('return "auto";');
    expect(layout).toContain('var t = localStorage.getItem("caltodo_theme");');
    expect(layout).toContain('} else if (t === "light") {');
  });
});

describe("color-scheme declaration", () => {
  const css = read("src/app/globals.css");

  it("pins the light scheme on the root", () => {
    const root = css.slice(css.indexOf(":root {"), css.indexOf(".dark {"));
    expect(root).toContain("color-scheme: light;");
  });

  it("switches the scheme with the dark class", () => {
    const dark = css.slice(css.indexOf(".dark {"));
    expect(dark.slice(0, dark.indexOf("}"))).toContain("color-scheme: dark;");
  });

  it("does not leave the scheme to the operating system", () => {
    // A prefers-color-scheme rule here would reintroduce the mismatch: the
    // app's theme is the user's choice and never follows the OS.
    expect(css).not.toContain("@media (prefers-color-scheme");
  });
});

describe("solar agreement between the two implementations", () => {
  /** Recomputes the pre-paint script's math for a given instant. */
  function scriptIsDark(lat: number, lng: number, now: Date): boolean {
    const D = Math.PI / 180;
    const m = now.getMonth() + 1, d = now.getDate(), y = now.getFullYear();
    const n1 = Math.floor(275 * m / 9);
    const n2 = Math.floor((m + 9) / 12);
    const n3 = 1 + Math.floor((y - 4 * Math.floor(y / 4) + 2) / 3);
    const doy = n1 - n2 * n3 + d - 30;
    const dec = -23.45 * D * Math.cos(D * (360 / 365) * (doy + 10));
    const latRad = lat * D;
    const cosH = (Math.cos(90.833 * D) - Math.sin(latRad) * Math.sin(dec)) / (Math.cos(latRad) * Math.cos(dec));
    if (cosH >= 1 || cosH <= -1) return false;
    const ha = Math.acos(cosH) * (180 / Math.PI);
    const tz = -now.getTimezoneOffset() / 60;
    const noon = 12 - lng / 15 + tz;
    const srMin = Math.round((noon - ha / 15) * 60);
    const ssMin = Math.round((noon + ha / 15) * 60);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin < srMin || nowMin > ssMin;
  }

  it("agrees with isDarkBySun across a full day", () => {
    const { lat, lng } = getFallbackCoords(new Date(2026, 7, 31, 12, 0, 0));
    for (let hour = 0; hour < 24; hour++) {
      const now = new Date(2026, 7, 31, hour, 30, 0);
      expect(scriptIsDark(lat, lng, now)).toBe(isDarkBySun(lat, lng, now));
    }
  });

  it("agrees across the year at midday and midnight", () => {
    for (let month = 0; month < 12; month++) {
      for (const hour of [0, 12]) {
        const now = new Date(2026, month, 15, hour, 0, 0);
        const { lat, lng } = getFallbackCoords(now);
        expect(scriptIsDark(lat, lng, now)).toBe(isDarkBySun(lat, lng, now));
      }
    }
  });

  it("puts sunrise before sunset on an ordinary day", () => {
    const now = new Date(2026, 7, 31, 12, 0, 0);
    const { lat, lng } = getFallbackCoords(now);
    const { sunrise, sunset } = getSunTimes(lat, lng, now);
    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
  });
});

describe("settings page height", () => {
  const content = read("src/app/app/settings/SettingsContent.tsx");

  it("adds back the padding its negative margins cancel", () => {
    // h-full alone left a strip of bare page below the scroll area that the
    // last card could not scroll into.
    expect(content).toContain("h-[calc(100%+1rem)] md:h-[calc(100%+2.5rem)]");
    expect(content).toContain("-m-4 md:-m-10");
  });

  it("no longer sizes that container with a plain h-full", () => {
    expect(content).not.toContain('className="flex h-full -m-4 md:-m-10"');
  });

  it("matches the padding .app-main actually applies", () => {
    const layout = read("src/app/app/layout.tsx");
    // 1rem mobile / 2.5rem desktop, the two values the height compensates for.
    expect(layout).toContain("pt-[max(1rem,env(safe-area-inset-top))]");
    expect(layout).toContain("md:pt-[max(2.5rem,env(safe-area-inset-top))]");
    expect(layout).toContain("pb-0");
  });
});

describe("standalone setup overlay entry", () => {
  const css = read("src/app/globals.css");
  const page = read("src/app/app/onboarding/page.tsx");

  it("fades the panel in rather than snapping it to full opacity", () => {
    // transition-opacity alone could not animate: the overlay mounts already
    // at opacity-100, so there was no starting value to move from.
    expect(css).toContain("@keyframes overlayIn");
    expect(page).toContain("animate-overlay-in");
  });

  it("leaves the exit transition able to fade it back out", () => {
    // A fill mode on the entry animation would pin opacity at 1 and the
    // standaloneExiting class would stop working.
    const rule = css.slice(css.indexOf(".animate-overlay-in"));
    expect(rule.slice(0, rule.indexOf("}"))).not.toContain("both");
    expect(rule.slice(0, rule.indexOf("}"))).not.toContain("forwards");
    expect(page).toContain('standaloneExiting ? "opacity-0" : "opacity-100"');
  });

  it("lifts the step content instead of sliding it in from the right", () => {
    const standalone = page.slice(page.indexOf("if (isStandaloneSetup)"));
    const overlay = standalone.slice(0, standalone.indexOf("setupParam === \"canvas\""));
    expect(overlay).toContain("animate-phase-in");
    expect(overlay).not.toContain("animate-step-in");
  });

  it("keeps the slide for real wizard steps, which do follow one another", () => {
    // Only the standalone branch changed; the multi-step flow still slides.
    expect(page).toContain("animate-step-in");
  });
});
