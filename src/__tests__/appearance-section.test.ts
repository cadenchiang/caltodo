/**
 * Tests for the Appearance section and ThemeToggle (audit 2.13, 2.25).
 *
 * The selected-theme check was white on #bfdbfe (invisible); ThemeToggle was
 * hardcoded zinc/gray, icon-only, and ignored the colour themes.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ACTIVE_THEME_BADGE } from "@/components/settings/sections/AppearanceSection";
import { segmentLabel } from "@/components/layout/ThemeToggle";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("AppearanceSection", () => {
  const src = read("components/settings/sections/AppearanceSection.tsx");

  it("paints the active theme badge brand blue with white text", () => {
    expect(ACTIVE_THEME_BADGE).toContain("bg-blue-500");
    expect(ACTIVE_THEME_BADGE).toContain("text-white");
    expect(src).not.toContain("bg-ring flex");
  });

  it("uses SectionHeading and readable muted copy", () => {
    expect(src).toContain('<SectionHeading title="Appearance"');
    expect(src).not.toContain("text-subtle-foreground");
    expect(src).not.toContain("text-[10px]");
  });
});

describe("ThemeToggle", () => {
  const src = read("components/layout/ThemeToggle.tsx");

  it("uses tokens instead of zinc and gray", () => {
    expect(src).toContain("bg-card border border-border");
    expect(src).toContain("text-muted-foreground");
    expect(src).not.toMatch(/zinc-|gray-/);
  });

  it("is a radiogroup with visible labels", () => {
    expect(src).toContain('role="radiogroup"');
    expect(src).toContain('role="radio"');
    expect(src).toContain("<span className=\"truncate\">{segmentLabel(value, resolvedTheme)}</span>");
    expect(src).not.toContain("aria-pressed");
  });

  it("labels Auto with the theme it resolves to", () => {
    expect(segmentLabel("light", "light")).toBe("Light");
    expect(segmentLabel("dark", "dark")).toBe("Dark");
    expect(segmentLabel("auto", "dark")).toBe("Auto (dark now)");
    expect(segmentLabel("auto", "light")).toBe("Auto (light now)");
  });
});
