/**
 * Guards the agreement between the pre-paint theme script in layout.tsx and
 * the React default in ThemeContext.
 *
 * These are two separate implementations of "what theme should this be", one
 * inline in the document head and one in the provider. When they disagree the
 * page paints one theme and switches to the other a moment later. That is
 * exactly what happened: the script treated a missing preference as auto and
 * resolved it against sunset, while the provider fell back to light, so after
 * sunset every user who had never explicitly picked a theme saw dark flip to
 * white.
 *
 * The script is read from the real file rather than copied, so this test
 * cannot drift away from what actually ships.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolveTheme, getInitialPreference } from "@/contexts/ThemeContext";

/** Pulls the inline pre-paint script out of the layout source. */
function readThemeScript(): string {
  const src = readFileSync("src/app/layout.tsx", "utf8");
  const match = src.match(/const themeScript = `([\s\S]*?)`;/);
  if (!match) throw new Error("themeScript not found in src/app/layout.tsx");
  return match[1];
}

/**
 * Runs the pre-paint script against a stubbed document at a chosen instant.
 *
 * @param stored - Value of caltodo_theme, or null for a device with none
 * @param at - The instant to pretend it is
 * @returns The theme the script would paint
 */
function runScript(stored: string | null, at: Date): "light" | "dark" {
  vi.setSystemTime(at);
  const store: Record<string, string> = {};
  if (stored !== null) store["caltodo_theme"] = stored;

  const classes = new Set<string>();
  const localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
  };
  const document = {
    documentElement: { classList: { add: (c: string) => classes.add(c) } },
    querySelector: () => null,
  };
  const fn = new Function("localStorage", "document", readThemeScript());
  fn(localStorage, document);
  return classes.has("dark") ? "dark" : "light";
}

/**
 * Runs the provider's own resolution for the same inputs.
 *
 * @param stored - Value of caltodo_theme, or null for a device with none
 * @param at - The instant to pretend it is
 * @returns The theme React would apply
 * @remarks Calls the shipped getInitialPreference rather than restating its
 *          fallback, so changing that fallback fails this test instead of
 *          quietly passing against a copy of the old logic.
 */
function runReact(stored: string | null, at: Date): "light" | "dark" {
  vi.setSystemTime(at);
  stubStorage(stored);
  return resolveTheme(getInitialPreference());
}

/**
 * Installs a localStorage holding just the given theme preference.
 *
 * @param stored - Value for caltodo_theme, or null to leave the key absent
 * @remarks resolveTheme bails to "light" without a window and reads cached
 *          coords from localStorage, so both globals must exist for the solar
 *          path to run at all.
 */
function stubStorage(stored: string | null) {
  const store: Record<string, string> = {};
  if (stored !== null) store["caltodo_theme"] = stored;
  const storage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
}

beforeEach(() => {
  vi.useFakeTimers();
  stubStorage(null);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Local instants either side of sunset, in the default coords' timezone. */
const NIGHT = new Date("2026-08-31T22:00:00-07:00");
const DAY = new Date("2026-08-31T10:00:00-07:00");

describe("first paint agrees with React", () => {
  for (const [label, at] of [
    ["at night", NIGHT],
    ["during the day", DAY],
  ] as const) {
    for (const stored of [null, "auto", "dark", "light"]) {
      it(`${label} with stored=${stored ?? "nothing"}`, () => {
        expect(runScript(stored, at)).toBe(runReact(stored, at));
      });
    }
  }

  it("paints dark after sunset when nothing is stored", () => {
    // Pins the specific case that regressed. If this ever reads "light", the
    // auto default has been quietly turned back into a light default.
    expect(runScript(null, NIGHT)).toBe("dark");
    expect(runReact(null, NIGHT)).toBe("dark");
  });

  it("paints light during the day when nothing is stored", () => {
    expect(runScript(null, DAY)).toBe("light");
    expect(runReact(null, DAY)).toBe("light");
  });

  it("honours an explicit choice regardless of the hour", () => {
    expect(runScript("dark", DAY)).toBe("dark");
    expect(runScript("light", NIGHT)).toBe("light");
    expect(runReact("dark", DAY)).toBe("dark");
    expect(runReact("light", NIGHT)).toBe("light");
  });

  it("treats a corrupt stored value as auto in both places", () => {
    expect(runScript("purple", NIGHT)).toBe(runReact("purple", NIGHT));
    expect(runScript("", DAY)).toBe(runReact("", DAY));
  });
});
