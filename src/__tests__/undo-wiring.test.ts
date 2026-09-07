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

describe("updateTask records every user edit", () => {
  const ctx = read("src/contexts/TaskContext.tsx");

  it("snapshots the task before writing, from the baseline", () => {
    expect(ctx).toContain("const before = announce ? taskBaselineRef.current.find((t) => t.id === id) : undefined;");
    expect(ctx.indexOf("summariseTaskEdit(before, updates)")).toBeLessThan(ctx.indexOf('.from("tasks")\n      .update(stampedUpdates)'));
  });

  it("announces with the revert after the write succeeds", () => {
    const push = ctx.indexOf("pushUndo({\n        label: summary.label,");
    expect(push).toBeGreaterThan(ctx.indexOf("if (updateError) {"));
    expect(ctx).toContain("undo: () => updateTask(id, summary.revert, { announce: false }),");
  });

  it("drops a write that changes nothing", () => {
    expect(ctx).toContain("if (announce && before && !summary) {");
  });

  it("lets internal callers opt out so they do not double up", () => {
    // Completion and its undo carry their own toast; snooze is a move, not
    // an edit; merging duplicates is housekeeping.
    expect(ctx).toContain("updateTask(id, { is_completed: false, completed_at: null }, { announce: false });");
    expect(ctx).toContain("updateTask(id, { snoozed_until: snoozedUntil }, { announce: false });");
    expect(ctx).toContain("updateTask(id, { snoozed_until: null }, { announce: false });");
    expect(ctx).toContain("updateTask(survivor.id, { description: newDesc }, { announce: false });");
    expect(ctx).toMatch(/await updateTask\(id, \{[\s\S]*?\}, \{ announce: false \}\);/);
  });

  it("is the only place that records, so no surface double-announces", () => {
    expect(read("src/components/tasks/TaskDetailPanel.tsx")).not.toContain("pushUndo");
    expect(read("src/components/tasks/TaskCreateModal.tsx")).not.toContain('showToast("Task updated")');
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
