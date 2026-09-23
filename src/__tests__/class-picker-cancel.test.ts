/**
 * Tests for the class picker's cancel semantics (audit 2.4).
 *
 * Previously X, backdrop, Escape and Done all saved. Now only Done commits;
 * every other exit restores the selection the picker opened with, and Done is
 * disabled while nothing has changed. CourseSelectModal itself sits on Modal
 * so it has the dialog role, focus trap, stacked Escape and the z ladder.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { selectionsDiffer } from "@/components/settings/AccountClasses";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("selectionsDiffer", () => {
  it("is false for equal sets in any order", () => {
    expect(selectionsDiffer(new Set(["a", "b"]), new Set(["b", "a"]))).toBe(false);
    expect(selectionsDiffer(new Set(), new Set())).toBe(false);
  });

  it("is true when an id is added, removed, or swapped", () => {
    expect(selectionsDiffer(new Set(["a"]), new Set(["a", "b"]))).toBe(true);
    expect(selectionsDiffer(new Set(["a", "b"]), new Set(["a"]))).toBe(true);
    expect(selectionsDiffer(new Set(["a"]), new Set(["b"]))).toBe(true);
  });
});

describe("AccountClasses", () => {
  const src = read("components/settings/AccountClasses.tsx");

  it("remembers the opened selection and restores it on cancel", () => {
    expect(src).toContain("setOpened(seeded);");
    expect(src).toMatch(/function cancel\(\) \{\s*setEditing\(false\);\s*setDraft\(opened\);/);
  });

  it("wires cancel to onClose and commit to onDone, disabling Done when unchanged", () => {
    expect(src).toContain("onClose={cancel}");
    expect(src).toContain("onDone={commit}");
    expect(src).toContain("doneDisabled={!selectionsDiffer(draft, opened)}");
    expect(src).not.toContain("onClose={commit}");
  });

  it("uses tokens for the action colour and readable muted copy", () => {
    expect(src).not.toContain("#0e89d6");
    expect(src).not.toContain("text-subtle-foreground");
    expect(src).not.toContain("text-[11px]");
  });

  it("passes the error variant on failure toasts", () => {
    const failures = src.match(/showToast\([^;]*Failed[^;]*\);/g) ?? [];
    expect(failures.length).toBe(2);
    for (const call of failures) expect(call).toContain('variant: "error"');
  });
});

describe("CourseSelectModal", () => {
  const src = read("components/ui/CourseSelectModal.tsx");

  it("is built on Modal, so Escape, backdrop and the close button all cancel", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).toContain("onClose={onClose}");
    expect(src).not.toContain("createPortal");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("animate-modal-in");
    expect(src).not.toContain("addEventListener");
  });

  it("commits only through Done and honours doneDisabled", () => {
    expect(src).toContain("onClick={onDone ?? onClose} disabled={doneDisabled}");
    expect(src).toMatch(/<Button variant="ghost" onClick=\{onClose\}>\s*Cancel/);
  });

  it("uses the theme accent for checked boxes and exposes checkbox semantics", () => {
    expect(src).not.toContain("#0e89d6");
    expect(src).toContain('role="checkbox"');
    expect(src).toContain("aria-checked={checked}");
  });

  it("is under 300 lines", () => {
    expect(src.split("\n").length).toBeLessThan(300);
  });
});
