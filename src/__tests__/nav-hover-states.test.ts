/**
 * Tests for the sidebar nav item's hover and active states.
 *
 * The reported bug: hovering an unselected item made it look exactly as
 * selected as the selected one, because in dark mode the hover class
 * (`white/[0.06]`) was the same value as `--nav-active-bg`. These pin the
 * ordering that fixes it - hover lighter than active, always - rather than
 * the specific colours, which each theme sets for itself.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { navItemClasses } from "@/components/layout/SidebarNavItem";

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

describe("navItemClasses", () => {
  it("gives both states the same box, so nothing shifts on selection", () => {
    for (const cls of ["relative", "flex items-center gap-3", "px-3 py-2.5", "rounded-xl"]) {
      expect(navItemClasses(true)).toContain(cls);
      expect(navItemClasses(false)).toContain(cls);
    }
  });

  it("answers the pointer whether or not the item is selected", () => {
    // A selected item that ignores the mouse reads as disabled.
    expect(navItemClasses(true)).toContain("hover:bg-[var(--nav-hover-bg)]");
    expect(navItemClasses(false)).toContain("hover:bg-[var(--nav-hover-bg)]");
  });

  it("never paints an unselected item with the active background", () => {
    // This is the actual regression: the old dark hover was white/[0.06],
    // the same value --nav-active-bg carries.
    expect(navItemClasses(false)).not.toContain("nav-active-bg");
    expect(navItemClasses(false)).not.toContain("white/[0.06]");
    expect(navItemClasses(false)).not.toContain("black/[0.04]");
  });

  it("distinguishes the two by text weight as well as background", () => {
    expect(navItemClasses(true)).toContain("text-foreground");
    expect(navItemClasses(true)).not.toContain("text-foreground/70");
    expect(navItemClasses(false)).toContain("text-foreground/70");
    expect(navItemClasses(false)).toContain("hover:text-foreground");
  });

  it("transitions on a short, explicit curve", () => {
    // `transition-colors` alone left the duration to whatever the default
    // was; the hover is named, timed, and eased so it cannot drift.
    for (const state of [true, false]) {
      const cls = navItemClasses(state);
      expect(cls).toContain("transition-[background-color,color]");
      expect(cls).toContain("duration-150");
      expect(cls).toContain("ease-out");
    }
  });

  it("gives a press response", () => {
    expect(navItemClasses(false)).toContain("active:scale-[0.99]");
  });
});

describe("nav hover colour", () => {
  const css = read("src/app/globals.css");

  it("derives hover from the theme's own active colour", () => {
    expect(css).toContain(
      "--nav-hover-bg: color-mix(in srgb, var(--nav-active-bg) 50%, transparent);"
    );
  });

  it("declares it once, so a new theme cannot forget it", () => {
    expect(css.match(/--nav-hover-bg:/g)).toHaveLength(1);
  });

  it("drops the hand-written per-theme hover it replaces", () => {
    // Miffy used to carry its own `.nav-item:hover` rules, which had to be
    // kept in step with its active colour by hand.
    expect(css).not.toContain(".nav-item:hover");
  });

  it("still defines an active colour for every theme that overrides one", () => {
    // Hover is derived from it, so a theme without one would get no hover.
    expect((css.match(/--nav-active-bg:/g) ?? []).length).toBeGreaterThan(20);
  });
});
