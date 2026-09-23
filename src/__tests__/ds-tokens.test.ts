/**
 * Source-level tests for the design-system foundation in globals.css:
 * the accent ramp, text and z-index tokens, status tokens, the global
 * focus-visible rule, the reduced-motion guard, and the animation cleanup.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8");

/**
 * Returns the body of the `@theme inline { ... }` block.
 *
 * @returns The text between the block's braces.
 */
function themeInlineBlock(): string {
  const start = css.indexOf("@theme inline {");
  const end = css.indexOf("\n}", start);
  return css.slice(start, end);
}

describe("accent ramp (default theme)", () => {
  const block = themeInlineBlock();

  it("keeps the brand blue at blue-500", () => {
    expect(block).toContain("--color-blue-500: #0e89d6;");
  });

  it("uses true darker steps for blue-600 and blue-700 instead of stock Tailwind", () => {
    expect(block).toContain("--color-blue-600: #0c78bd;");
    expect(block).toContain("--color-blue-700: #0a67a3;");
    expect(block).not.toContain("--color-blue-600: #2563eb;");
    expect(block).not.toContain("--color-blue-700: #0e89d6;");
  });

  it("uses a lighter step of the brand hue for blue-400", () => {
    expect(block).toContain("--color-blue-400: #2a9bdd;");
    expect(block).not.toContain("--color-blue-400: #60a5fa;");
  });

  it("aliases accent-hover to blue-600 so #3D8FE8 can be retired", () => {
    expect(block).toContain("--color-accent-hover: var(--color-blue-600);");
  });

  it("removes the dead leading @theme ramp", () => {
    const firstTheme = css.indexOf("@theme {");
    const firstThemeBody = css.slice(firstTheme, css.indexOf("\n}", firstTheme));
    expect(firstThemeBody).not.toContain("--color-blue-");
  });

  it("keeps the other themes' ramps intact", () => {
    for (const theme of ["miffy", "forest", "sunset", "lavender", "nord", "rosewood", "midnight", "matcha", "dracula", "cyber", "sandstone", "tokyo-night"]) {
      const idx = css.indexOf(`.theme-${theme} {\n  --color-blue-50`);
      expect(idx, `theme-${theme} ramp`).toBeGreaterThan(-1);
    }
  });
});

describe("scale tokens", () => {
  it("defines text-2xs (11px) and text-3xs (10px)", () => {
    expect(css).toContain("--text-2xs: 0.6875rem;");
    expect(css).toContain("--text-3xs: 0.625rem;");
    expect(css).toContain("--text-2xs--line-height:");
    expect(css).toContain("--text-3xs--line-height:");
  });

  it("defines the z-index ladder in ascending order", () => {
    const ladder = ["sticky: 40", "dropdown: 50", "overlay: 100", "toast: 200", "tooltip: 300"];
    let last = -1;
    for (const step of ladder) {
      const idx = css.indexOf(`--z-index-${step};`);
      expect(idx, step).toBeGreaterThan(last);
      last = idx;
    }
  });
});

describe("status tokens", () => {
  it("declares success, warning, danger with tints on :root", () => {
    const root = css.slice(css.indexOf(":root {"), css.indexOf("\n.dark {"));
    expect(root).toContain("--success: #10b981;");
    expect(root).toContain("--success-tint: rgba(16, 185, 129, 0.1);");
    expect(root).toContain("--warning: #f59e0b;");
    expect(root).toContain("--warning-tint: rgba(245, 158, 11, 0.1);");
    expect(root).toContain("--danger: #ef4444;");
    expect(root).toContain("--danger-tint: rgba(239, 68, 68, 0.1);");
    expect(root).toContain("--hairline: rgba(0, 0, 0, 0.1);");
    expect(root).toContain("--backdrop: rgba(0, 0, 0, 0.5);");
  });

  it("flips the hairline to white/10 in dark mode", () => {
    const dark = css.slice(css.indexOf("\n.dark {"), css.indexOf("\n.theme-miffy {"));
    expect(dark).toContain("--hairline: rgba(255, 255, 255, 0.1);");
  });

  it("wires the tokens into Tailwind through @theme inline", () => {
    const block = themeInlineBlock();
    for (const name of ["success", "success-tint", "warning", "warning-tint", "danger", "danger-tint", "hairline", "backdrop"]) {
      expect(block).toContain(`--color-${name}: var(--${name});`);
    }
  });
});

describe("focus and motion", () => {
  it("draws a global focus-visible ring that excludes react-grid-layout items", () => {
    const idx = css.indexOf(":where(:focus-visible):not(.react-grid-item) {");
    expect(idx).toBeGreaterThan(-1);
    const rule = css.slice(idx, css.indexOf("}", idx));
    expect(rule).toContain("outline: 2px solid var(--ring);");
    expect(rule).toContain("outline-offset: 2px;");
  });

  it("collapses motion under prefers-reduced-motion but keeps animate-spin and .motion-essential", () => {
    const idx = css.indexOf("@media (prefers-reduced-motion: reduce) {\n  :where(*:not(.animate-spin):not(.motion-essential))");
    expect(idx).toBeGreaterThan(-1);
    const rule = css.slice(idx, css.indexOf("\n}", idx));
    expect(rule).toContain("animation-duration: 0.01ms !important;");
    expect(rule).toContain("transition-duration: 0.01ms !important;");
    expect(rule).toContain("animation-iteration-count: 1 !important;");
  });

  it("hosts the typing indicator keyframes", () => {
    expect(css).toContain("@keyframes typing-bounce {");
  });
});

describe("animation cleanup", () => {
  const removedUtilities = [
    ".animate-shake",
    ".animate-fade-right",
    ".animate-fade-left",
    ".animate-appear",
    ".animate-page-in",
    ".animate-sync-bar",
    ".animate-sync-glow",
    ".animate-border-spin",
    ".animate-backdrop-out",
    ".animate-dialog-out",
  ];
  const removedKeyframes = [
    "shake", "fadeRight", "fadeLeft", "appear", "calViewFade", "slideDown", "checkScale",
    "progress", "pageIn", "syncBar", "loadingBar", "syncGlow", "shimmer-slide", "spin-around",
    "borderSpin", "float",
  ];

  it("drops the unused animate-* utilities", () => {
    for (const u of removedUtilities) expect(css, u).not.toContain(`${u} {`);
  });

  it("drops the orphan keyframes", () => {
    for (const k of removedKeyframes) expect(css, k).not.toContain(`@keyframes ${k} {`);
  });

  it("keeps utilities reached through template strings and arbitrary values", () => {
    for (const keep of [
      ".animate-editor-panel-in-right", ".animate-editor-panel-out-left", ".animate-announce-card-in",
      "@keyframes lightboxIn", "@keyframes msgFadeIn", "@keyframes fadeInUp", "@keyframes overlayIn",
    ]) {
      expect(css, keep).toContain(keep);
    }
  });
});
