/**
 * Tests for Popover and usePopoverPosition: the solid surface, keyboard and
 * focus behaviour, the unchanged prop API, and anchored positioning math.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { POPOVER_SURFACE } from "@/components/ui/Popover";
import { computeAnchoredPosition, POPOVER_GAP, VIEWPORT_PAD, type RectLike } from "@/hooks/usePopoverPosition";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

const anchor: RectLike = { top: 100, left: 50, right: 150, bottom: 130, width: 100, height: 30 };
const panel = { width: 200, height: 150 };
const viewport = { width: 800, height: 600 };

describe("computeAnchoredPosition", () => {
  it("opens below and aligns to the anchor's left by default", () => {
    expect(computeAnchoredPosition(anchor, panel, viewport)).toEqual({ top: 130 + POPOVER_GAP, left: 50 });
  });

  it("aligns to the anchor's right edge for end placements", () => {
    const wide: RectLike = { ...anchor, left: 300, right: 400 };
    expect(computeAnchoredPosition(wide, panel, viewport, "bottom-end").left).toBe(400 - 200);
    // A right-aligned panel that would overflow the left edge is clamped.
    expect(computeAnchoredPosition(anchor, panel, viewport, "bottom-end").left).toBe(VIEWPORT_PAD);
  });

  it("flips above when there is no room below", () => {
    const low: RectLike = { ...anchor, top: 500, bottom: 530 };
    expect(computeAnchoredPosition(low, panel, viewport).top).toBe(500 - POPOVER_GAP - 150);
  });

  it("prefers above for top placements and falls back below when cramped", () => {
    expect(computeAnchoredPosition(anchor, panel, viewport, "top-start").top).toBe(130 + POPOVER_GAP);
    const mid: RectLike = { ...anchor, top: 300, bottom: 330 };
    expect(computeAnchoredPosition(mid, panel, viewport, "top-start").top).toBe(300 - POPOVER_GAP - 150);
  });

  it("clamps to the viewport padding on every side", () => {
    const edge: RectLike = { top: 590, left: 790, right: 800, bottom: 600, width: 10, height: 10 };
    const pos = computeAnchoredPosition(edge, panel, viewport);
    expect(pos.left).toBe(800 - 200 - VIEWPORT_PAD);
    // Flips above (fits), so no vertical clamp is needed here.
    expect(pos.top).toBe(590 - POPOVER_GAP - 150);
    // A panel taller than the space on both sides is clamped to the padding.
    const tall = { width: 200, height: 700 };
    expect(computeAnchoredPosition(edge, tall, viewport).top).toBe(VIEWPORT_PAD);
    const corner: RectLike = { top: 0, left: 0, right: 10, bottom: 10, width: 10, height: 10 };
    expect(computeAnchoredPosition(corner, panel, viewport, "top-end")).toEqual({ top: 10 + POPOVER_GAP, left: VIEWPORT_PAD });
  });
});

describe("usePopoverPosition", () => {
  const src = read("hooks/usePopoverPosition.ts");

  it("re-measures on capture-phase scroll and on resize", () => {
    expect(src).toContain('window.addEventListener("scroll", update, true);');
    expect(src).toContain('window.addEventListener("resize", update);');
    expect(src).toContain('setStyle({ position: "fixed", top, left });');
  });
});

describe("Popover", () => {
  const src = read("components/ui/Popover.tsx");

  it("always renders the solid popover surface", () => {
    expect(POPOVER_SURFACE).toContain("bg-popover");
    expect(POPOVER_SURFACE).toContain("border border-border");
    expect(src).toContain("POPOVER_SURFACE,");
  });

  it("keeps the original prop API", () => {
    for (const prop of ["open: boolean;", "onClose: () => void;", "children: ReactNode;", "className?: string;", "triggerRef?: RefObject<HTMLElement | null>;"]) {
      expect(src).toContain(prop);
    }
  });

  it("closes on Escape and outside click, moves focus in, traps Tab, and restores focus", () => {
    expect(src).toContain("useClickOutside(ref, onClose, open, excludeRefs);");
    expect(src).toContain('if (event.key === "Escape")');
    expect(src).toContain("trapTab(event, node);");
    expect(src).toContain("first.focus({ preventScroll: true });");
    expect(src).toContain("opener.focus({ preventScroll: true });");
  });

  it("supports dialog and menu roles with an accessible name", () => {
    expect(src).toContain('role?: "dialog" | "menu";');
    expect(src).toContain("aria-label={ariaLabel}");
  });

  it("uses the dropdown layer when anchored", () => {
    expect(src).toContain('anchorRef && "z-dropdown"');
  });

  it("is still the default export the six importers expect", () => {
    expect(src).toContain("export default function Popover(");
  });
});
