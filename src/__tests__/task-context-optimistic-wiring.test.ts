/**
 * Pins how TaskContext wires the pure helpers in task-merge.ts.
 *
 * The helpers themselves are covered by task-merge.test.ts; these check that
 * the provider actually routes its optimistic paths through them (H7, M2),
 * since a regression there would not show up in the pure tests.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ctx = fs.readFileSync(path.join(process.cwd(), "src/contexts/TaskContext.tsx"), "utf8");

/** The body of a top-level `async function name(` in the provider. */
function fnBody(name: string): string {
  const start = ctx.indexOf(`async function ${name}(`);
  expect(start).toBeGreaterThan(0);
  const next = ctx.indexOf("\n  async function ", start + 1);
  return ctx.slice(start, next === -1 ? undefined : next);
}

describe("fetchTasks merge", () => {
  it("goes through mergeFetchedTasks with the in-flight edit ids", () => {
    expect(ctx).toContain("mergeFetchedTasks(");
    expect(ctx).toContain("new Set(pendingEditsRef.current.keys())");
  });
});

describe("addTask (M2)", () => {
  const body = fnBody("addTask");

  it("registers the temp row in the baseline the merge reads from", () => {
    const optimistic = body.indexOf("const updated = [optimisticTask, ...prev];");
    expect(optimistic).toBeGreaterThan(0);
    const register = body.indexOf("taskBaselineRef.current = updated;", optimistic);
    const insert = body.indexOf(".insert({ ...taskColumns, user_id: userId })");
    expect(register).toBeGreaterThan(optimistic);
    expect(register).toBeLessThan(insert);
  });

  it("replaces the temp row through the duplicate-safe helper", () => {
    expect(body).toContain("replaceTempTask(prev, tempId, data as Task)");
  });

  it("drops the temp row from the baseline when the insert fails", () => {
    const failure = body.indexOf("if (insertError) {");
    const revert = body.indexOf("taskBaselineRef.current = reverted;", failure);
    expect(revert).toBeGreaterThan(failure);
  });
});

describe("updateTask (H7)", () => {
  const body = fnBody("updateTask");

  it("marks the edit pending for the duration of the write", () => {
    const mark = body.indexOf("pending.set(id, (pending.get(id) ?? 0) + 1);");
    const write = body.indexOf(".update(stampedUpdates)");
    const clear = body.indexOf("if (remaining <= 0) pending.delete(id);");
    expect(mark).toBeGreaterThan(0);
    expect(mark).toBeLessThan(write);
    expect(clear).toBeGreaterThan(write);
  });

  it("applies the optimistic edit without a client stamp", () => {
    expect(body).toContain("applyOptimisticEdit(prev, id, stampedUpdates)");
    expect(body).not.toContain("updated_at: new Date().toISOString()");
  });

  it("treats a zero-row update as a failure", () => {
    expect(body).toContain(".maybeSingle()");
    expect(body).toContain("if (updateError || !written) {");
  });
});
