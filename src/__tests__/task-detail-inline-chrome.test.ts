/**
 * Tests the detail panel's row alignment and its chromeless inline editing.
 *
 * These are layout facts a type-check cannot see and no unit test can reach
 * without a DOM: whether the icon column is the same height as the line of
 * text it sits next to, whether an editable field paints a box around that
 * text, and whether the picker's search input is outside its scroll region.
 * Each regression is silent in CI and obvious on screen, so the source is
 * parsed for the specific classes that decide them.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("row icon alignment", () => {
  const panel = read("src/components/tasks/TaskDetailPanel.tsx");
  const shared = read("src/components/tasks/shared/TaskDetailRows.tsx");
  const popover = read("src/components/tasks/TaskPreviewPopover.tsx");

  it("gives the panel's icon column the line height of its label", () => {
    expect(panel).toContain('className="shrink-0 w-5 h-5 flex items-center justify-center');
  });

  it("sizes the icon to the text, not to the box around it", () => {
    // A 20px glyph in the 20px box draws ~15px of ink against text whose
    // capitals are ~10px tall, so it reads as heavy and low even though the
    // two are centred on each other. 16px matches the cap height.
    expect(panel).toContain("const ROW_ICON_SIZE = 16;");
    expect(panel).not.toContain("size={20}");
    expect(shared).toContain("const DEFAULT_ICON_SIZE = 16;");
    expect(popover).not.toContain("<ExternalLink size={20}");
  });

  it("does not nudge the panel's icon column down the row", () => {
    // A top margin on a box that already matches the line height pushes the
    // icon below the text it labels, which is the bug this guards.
    const rowIcon = panel.slice(panel.indexOf("function RowIcon"), panel.indexOf("export default"));
    expect(rowIcon).not.toMatch(/\bmt-\d/);
  });

  it("start-aligns every panel row so icon and first line share a top edge", () => {
    const rows = panel.match(/className="flex items-\w+ gap-4 py-\d+ min-w-0"/g) ?? [];
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row).toContain("items-start");
  });

  it("applies the same sizing to the shared rows the popover renders", () => {
    const boxes = shared.match(/className="shrink-0 w-5[^"]*"/g) ?? [];
    expect(boxes.length).toBe(3);
    for (const box of boxes) {
      expect(box).toContain("w-5 h-5");
      expect(box).not.toMatch(/\bmt-/);
    }
  });

  it("sizes the popover's own source-link icon the same way", () => {
    expect(popover).toContain('className="shrink-0 w-5 h-5 flex items-center justify-center"');
  });
});

describe("chromeless inline editing", () => {
  const field = read("src/components/tasks/inline/InlineField.tsx");
  const textEdit = read("src/components/tasks/inline/InlineTextEdit.tsx");

  it("paints no hover or focus tint behind an editable field", () => {
    expect(field).not.toContain("hover:bg-");
    expect(field).not.toContain("focus-visible:bg-");
  });

  it("gives the field no padding or negative margin of its own", () => {
    // Padding here both draws a visible box and offsets the text from the
    // icon beside it, so the row alignment depends on this staying absent.
    expect(field).not.toMatch(/-mx-\d|\bpx-\d|\bpy-\d/);
  });

  it("keeps a focus ring so the field is still reachable by keyboard", () => {
    expect(field).toContain("focus-visible:ring-1");
  });

  it("still marks the field as editable through the cursor", () => {
    expect(field).toContain("cursor-text");
    expect(field).toContain("cursor-pointer");
  });

  it("edits text on a transparent, borderless, unpadded textarea", () => {
    const cls = textEdit.match(/className=\{`\$\{textClassName\}([^`]*)`\}/)?.[1] ?? "";
    expect(cls).toContain("bg-transparent");
    expect(cls).toContain("border-0");
    expect(cls).toContain("m-0 p-0");
    expect(cls).not.toContain("rounded-lg");
    expect(cls).not.toContain("focus:ring-2");
  });
});

describe("option list search box", () => {
  const list = read("src/components/tasks/inline/OptionList.tsx");

  it("does not scroll the panel that holds the search box", () => {
    const panelClass = list.match(/className="w-64 bg-popover[^"]*"/)?.[0] ?? "";
    expect(panelClass).toBeTruthy();
    expect(panelClass).not.toContain("overflow-y-auto");
    expect(panelClass).toContain("flex flex-col");
    expect(panelClass).toContain("max-h-64");
  });

  it("pins the search box above the list", () => {
    expect(list).toContain('className="shrink-0 px-2.5 pb-1.5"');
  });

  it("scrolls the options only, and can shrink to do it", () => {
    expect(list).toContain('className="flex-1 min-h-0 overflow-y-auto"');
    expect(list.match(/overflow-y-auto/g)?.length).toBe(1);
  });

  it("keeps every option inside the scrolling region", () => {
    const start = list.indexOf('className="flex-1 min-h-0 overflow-y-auto"');
    const rest = list.slice(start);
    for (const marker of ["{clearLabel}", "{filtered.map", "Add &ldquo;", "{emptyLabel}"]) {
      expect(rest).toContain(marker);
    }
  });
});
