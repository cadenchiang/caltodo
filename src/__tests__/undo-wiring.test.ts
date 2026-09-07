/**
 * Tests that the undo stack is wired where it has to be.
 *
 * The behaviour of the summary and the revert is covered by
 * task-edit-summary.test.ts; these pin the plumbing that was missing - the
 * provider being mounted, the panel recording its saves, and Cmd+Z keeping
 * out of text fields.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

describe("the provider is mounted", () => {
  const layout = read("src/app/app/layout.tsx");

  it("wraps the app", () => {
    expect(layout).toContain("<UndoProvider>");
    expect(layout).toContain("</UndoProvider>");
  });

  it("sits inside the toasts it announces through", () => {
    // An undo shows a toast, so ToastProvider has to be the outer one.
    expect(layout.indexOf("<ToastProvider>")).toBeLessThan(layout.indexOf("<UndoProvider>"));
    expect(layout.indexOf("</UndoProvider>")).toBeLessThan(layout.indexOf("</ToastProvider>"));
  });

  it("wraps the tasks whose edits it records", () => {
    expect(layout.indexOf("<UndoProvider>")).toBeLessThan(layout.indexOf("<TaskProvider"));
  });
});

describe("the detail panel records its saves", () => {
  const panel = read("src/components/tasks/TaskDetailPanel.tsx");

  it("summarises the edit before writing it", () => {
    // The snapshot has to be taken from the task as it is now; afterwards the
    // previous values are gone.
    expect(panel).toContain("const summary = summariseTaskEdit(task, updates);");
    expect(panel.indexOf("summariseTaskEdit(task, updates)")).toBeLessThan(
      panel.indexOf("onSave(id, updates)")
    );
  });

  it("drops a save that changes nothing", () => {
    // Otherwise the toast announces an edit that never happened.
    expect(panel).toContain("if (!summary) return;");
  });

  it("pushes the revert, not the edit", () => {
    expect(panel).toContain("undo: () => onSave(id, summary.revert),");
  });

  it("reverts through the same save path, so undo cannot recurse", () => {
    // The undo calls the onSave prop directly rather than save(), which would
    // record an undo for the undo.
    expect(panel).not.toContain("undo: () => save(");
  });
});

describe("the keyboard shortcut", () => {
  const ctx = read("src/contexts/UndoContext.tsx");

  it("binds Cmd+Z and Ctrl+Z", () => {
    expect(ctx).toContain('e.key.toLowerCase() !== "z"');
    expect(ctx).toContain("e.metaKey || e.ctrlKey");
  });

  it("leaves text fields their own undo", () => {
    expect(ctx).toContain("if (isTextEntry(e.target)) return;");
    expect(ctx).toContain('tag === "INPUT" || tag === "TEXTAREA"');
    expect(ctx).toContain("target.isContentEditable");
  });

  it("leaves Shift+Cmd+Z alone, having no redo to offer", () => {
    expect(ctx).toContain("if (e.shiftKey) return;");
  });

  it("does not swallow the key when there is nothing to undo", () => {
    const guard = ctx.indexOf("if (stackRef.current.length === 0) return;");
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(ctx.indexOf("e.preventDefault();"));
  });

  it("unbinds on unmount", () => {
    expect(ctx).toContain('window.removeEventListener("keydown", onKeyDown)');
  });
});

describe("the stack itself", () => {
  const ctx = read("src/contexts/UndoContext.tsx");

  it("is bounded", () => {
    expect(ctx).toContain("const MAX_ENTRIES = 25;");
    expect(ctx).toContain("if (stackRef.current.length > MAX_ENTRIES) stackRef.current.shift();");
  });

  it("survives an undo that throws or rejects", () => {
    expect(ctx).toContain('showToast("Couldn\'t undo that change", { variant: "error" });');
    expect(ctx).toContain("result.catch(");
  });

  it("logs what it records and what it reverses", () => {
    expect(ctx).toContain('console.info("UndoProvider: recorded edit"');
    expect(ctx).toContain('console.info("UndoProvider: undid edit"');
    expect(ctx).toContain('console.error("UndoProvider: undo failed"');
  });
});
