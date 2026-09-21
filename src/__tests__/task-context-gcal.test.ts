/**
 * Source-level tests for the Google Calendar paths in TaskContext.
 *
 * TaskContext is a React provider and the project has no render harness, so
 * these check the contract the way server-preload.test.ts does: the create
 * result is stored, the delete is sent before the row goes, undo restores
 * with a cleared google_event_id, and non-event edits skip Google.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const src = readFileSync(join(process.cwd(), "src/contexts/TaskContext.tsx"), "utf8");

/** The body of a named function or handler, from its declaration to `marker`. */
function section(start: string, end: string): string {
  const from = src.indexOf(start);
  expect(from, `missing "${start}"`).toBeGreaterThan(-1);
  const to = src.indexOf(end, from);
  expect(to, `missing "${end}" after "${start}"`).toBeGreaterThan(from);
  return src.slice(from, to);
}

describe("TaskContext Google Calendar paths", () => {
  it("uses the shared client-push helpers instead of a local fetch", () => {
    expect(src).toContain('from "@/lib/gcal/client-push"');
    expect(src).not.toContain('fetch("/api/gcal/sync"');
  });

  it("stores the event id returned by create so a later delete can find it", () => {
    const addTask = section("async function addTask", "async function updateTask");
    expect(addTask).toMatch(/pushTaskToGCal\("create", data\.id\)\.then\(\(eventId\) => attachGoogleEventId\(data\.id, eventId\)\)/);
  });

  it("attaches ids reported by the initial-sync stream", () => {
    const sync = section("const syncUnsyncedToGCal", "const fetchTasks");
    expect(sync).toContain("onTaskSynced: attachGoogleEventId");
  });

  it("sends the calendar delete before the row is removed", () => {
    const del = section("async function deleteTask", "async function mergeDuplicates");
    const push = del.indexOf('await pushTaskToGCal("delete", id, taskToDelete?.google_event_id)');
    const rowDelete = del.indexOf(".delete()");
    expect(push).toBeGreaterThan(-1);
    expect(push).toBeLessThan(rowDelete);
  });

  it("undo restores with google_event_id cleared and then creates a fresh event", () => {
    const del = section("async function deleteTask", "async function mergeDuplicates");
    expect(del).toContain("google_event_id: null };");
    expect(del).toMatch(/update\(\{ dismissed_at: null, dismissed_by_user: false, google_event_id: null \}\)/);
    expect(del).toMatch(/const \{ dismissed_at: _ignored, \.\.\.row \} = restoredTask;/);
    expect(del.indexOf("insert(row)")).toBeLessThan(del.indexOf('pushTaskToGCal("create", taskToDelete.id)'));
  });

  it("skips Google for edits to columns the event never shows", () => {
    const update = section("async function updateTask", "async function toggleComplete");
    expect(update).toContain("if (touchesGCalEvent(stampedUpdates))");
  });

  it("lets a bulk caller skip the per-task calendar delete", () => {
    const del = section("async function deleteTask", "async function mergeDuplicates");
    expect(del).toContain("if (!opts?.skipGCal)");
  });
});

describe("bulk class delete", () => {
  const inbox = readFileSync(join(process.cwd(), "src/app/app/inbox/page.tsx"), "utf8");

  it("issues one batched calendar delete before the per-task row deletes", () => {
    const handlers = inbox.split("onDeleteClass={").slice(1);
    expect(handlers).toHaveLength(2);
    for (const h of handlers) {
      const batch = h.indexOf("await pushBatchDeleteToGCal(");
      const rowDelete = h.indexOf("deleteTask(t.id, { silent: true, skipGCal: true })");
      expect(batch).toBeGreaterThan(-1);
      expect(rowDelete).toBeGreaterThan(batch);
    }
  });

  it("does not call Google for class color changes", () => {
    const handlers = inbox.split("onColorChange={").slice(1);
    expect(handlers).toHaveLength(2);
    for (const h of handlers) {
      expect(h.slice(0, h.indexOf("}}"))).not.toMatch(/gcal/i);
    }
  });
});
