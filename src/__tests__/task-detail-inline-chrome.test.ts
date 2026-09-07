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

  it("keeps a picker field off its parent's text baseline", () => {
    // An inline-block sits on the baseline of the line box it is in, and the
    // div holding these fields carries the panel's 16px strut rather than the
    // field's own 14px text-sm. The taller strut's baseline is lower, which
    // pushed the class and tag values a few pixels below the icons labelling
    // them while the plain-text rows stayed put. Aligning to the top of the
    // line box is what makes every row start on the same edge.
    const picker = read("src/components/tasks/inline/InlinePicker.tsx");
    expect(picker).toContain("relative inline-block align-top max-w-full");
  });
});

describe("chromeless inline editing", () => {
  const field = read("src/components/tasks/inline/InlineField.tsx");
  const textEdit = read("src/components/tasks/inline/InlineTextEdit.tsx");

  it("tints a picker under the pointer, since a click there opens a popover", () => {
    expect(field).toContain('cursor-pointer -mx-1 px-1 -my-0.5 py-0.5 hover:bg-foreground/5');
    expect(field).toContain("transition-colors");
  });

  it("paints nothing behind a field that is typed into in place", () => {
    // The text variant is the value itself, so a box around it on hover
    // would make read-only text look like a form input.
    const textVariant = field.slice(field.indexOf('cursor === "text"'));
    expect(textVariant).toMatch(/\? "cursor-text"/);
    expect(field).not.toContain("focus-visible:bg-");
  });

  it("keeps the tint's padding off the text's position", () => {
    // Padding without an equal negative margin would offset the text from
    // the icon beside it, so the row alignment depends on the two matching.
    const px = field.match(/-mx-(\d+(?:\.\d+)?) px-(\d+(?:\.\d+)?)/);
    const py = field.match(/-my-(\d+(?:\.\d+)?) py-(\d+(?:\.\d+)?)/);
    expect(px?.[1]).toBe(px?.[2]);
    expect(py?.[1]).toBe(py?.[2]);
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

describe("a row's value sits on the same centre line as its icon", () => {
  const panel = read("src/components/tasks/TaskDetailPanel.tsx");

  it("sizes the value column's strut to the row text, not the panel font", () => {
    // Without this the column's strut is the panel's 16px font (a 24px line
    // box), and an inline value baselines on that instead of on its own 20px
    // line box - about 3px below the icon beside it.
    expect(panel).toContain('const ROW_VALUE_COLUMN = "min-w-0 flex-1 text-sm";');
  });

  it("uses that column for every row, so no row drifts on its own", () => {
    const pickers = read("src/components/tasks/TaskDetailPickers.tsx");
    const rows = (panel.match(/<div className=\{ROW_VALUE_COLUMN\}>/g) ?? []).length +
      (pickers.match(/<div className=\{ROW_VALUE_COLUMN\}>/g) ?? []).length;
    // Link, class, tags, description.
    expect(rows).toBe(4);
    expect(panel).not.toContain('<div className="min-w-0 flex-1">');
    expect(pickers).not.toContain('<div className="min-w-0 flex-1">');
    // The extracted rows keep the same column, so the two files cannot drift.
    expect(pickers).toContain('const ROW_VALUE_COLUMN = "min-w-0 flex-1 text-sm";');
  });

  it("keeps the icon column 20px, matching the row text's line box", () => {
    expect(panel).toContain('className="shrink-0 w-5 h-5 flex items-center justify-center');
    expect(panel).toContain("const ROW_ICON_SIZE = 16;");
  });
});

describe("a row of pills sits flush on the content column", () => {
  const panel = read("src/components/tasks/TaskDetailPanel.tsx");
  const shared = read("src/components/tasks/shared/TaskDetailRows.tsx");

  it("does not pull the pill row left of the column", () => {
    // The pill's background is the edge the eye reads, so it lines up with
    // the text of the rows around it rather than hanging 10px left of them.
    expect(panel).not.toContain("PILL_ALIGN_OFFSET");
    expect(panel).not.toContain("-ml-2.5");
    expect(shared).not.toContain("-ml-2.5");
    expect(shared).toContain('className="flex flex-wrap gap-1.5 min-w-0"');
  });

  it("still switches between pills and the plain placeholder", () => {
    const pickers = read("src/components/tasks/TaskDetailPickers.tsx");
    expect(pickers).toContain("const hasPills = badges.length > 0 || tags.length > 0;");
    expect(pickers).toContain('<span className="text-sm text-muted-foreground/70">Add tags</span>');
  });
});

describe("option list search box", () => {
  const list = read("src/components/tasks/inline/OptionList.tsx");

  it("does not scroll the panel that holds the search box", () => {
    const panelClass = list.match(/className="w-64 bg-popover[^"]*"/)?.[0] ?? "";
    expect(panelClass).toBeTruthy();
    expect(panelClass).not.toContain("overflow-y-auto");
    expect(panelClass).toContain("flex flex-col");
    // Taller than it was: the Save footer takes a row the options used to have.
    expect(panelClass).toContain("max-h-72");
  });

  it("pins the Save footer below the list", () => {
    // A pick stages; nothing reaches the assignment until Save, which is what
    // keeps a stray click in the dropdown from editing a real due date.
    expect(list).toContain("onClick={commit}");
    expect(list).toContain("disabled={!dirty}");
    expect(list).toContain("const dirty = !sameSelection(draft, selected);");
    const footer = list.slice(list.indexOf("Save footer"));
    expect(footer).toContain("shrink-0");
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
