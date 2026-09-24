/**
 * Audit section 4: swatch menus rendered raw hex (Miffy users picked a
 * colour that was not applied), four "default" colours, hover-only class
 * header actions, and hand-rolled z-[9999] menus. One ClassMenu on Popover,
 * one ColorSwatchGrid through getThemeColor, named swatches.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { TASK_COLORS, TASK_COLOR_NAMES, getTaskColorName } from "@/lib/constants";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("TASK_COLOR_NAMES", () => {
  it("names every palette colour", () => {
    for (const c of TASK_COLORS) {
      expect(TASK_COLOR_NAMES[c.toUpperCase()]).toBeTruthy();
    }
    expect(getTaskColorName("#0e89d6")).toBe("Blue");
    expect(getTaskColorName("#123456")).toBe("#123456");
  });
});

describe("ColorSwatchGrid", () => {
  const src = read("components/tasks/shared/ColorSwatchGrid.tsx");
  it("paints through getThemeColor and labels swatches by name", () => {
    expect(src).toContain("getThemeColor(c, colorTheme)");
    expect(src).toContain("aria-label={getTaskColorName(c)}");
    expect(src).toContain("aria-pressed={selected}");
  });
});

describe("ClassMenu and ClassGroupHeader", () => {
  it("ClassMenu is a Popover menu using the swatch grid", () => {
    const src = read("components/tasks/shared/ClassMenu.tsx");
    expect(src).toContain('import Popover from "@/components/ui/Popover";');
    expect(src).toContain("<ColorSwatchGrid");
    expect(src).toContain('role="menu"');
    expect(src).not.toContain("createPortal");
  });

  it("ClassGroupHeader reveals actions on focus-within and has no z-[9999] menu", () => {
    const src = read("components/tasks/ClassGroupHeader.tsx");
    expect(src).toContain("group-focus-within:opacity-100");
    expect(src).toContain("aria-expanded={!isCollapsed}");
    expect(src).toContain("<ClassMenu");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("createPortal");
    expect(src.split("\n").length).toBeLessThanOrEqual(300);
  });

  it("ColorSwatchPicker uses the shared grid", () => {
    const src = read("components/tasks/inline/ColorSwatchPicker.tsx");
    expect(src).toContain("<ColorSwatchGrid");
    expect(src).not.toContain("aria-label={`Use ${c}`}");
  });
});
