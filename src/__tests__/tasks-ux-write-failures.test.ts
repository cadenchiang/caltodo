/**
 * Audit section 4, blocker: a failed write (including offline) used to
 * replace the whole list or board with the raw Supabase message and a hard
 * reload button, after the create modal had already toasted success.
 *
 * Now: write failures roll back and toast (variant "error", plain copy,
 * Retry action); the list-level error is reserved for a failed initial
 * load with a plain message; the create modal toasts only after the insert
 * resolves; delete is announced through the undo stack.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LOAD_FAILED_MESSAGE } from "@/contexts/TaskContext";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("TaskContext write failures", () => {
  const src = read("contexts/TaskContext.tsx");

  it("reports write failures through an error toast with Retry", () => {
    expect(src).toContain("const reportWriteFailure = useCallback(");
    expect(src).toContain('variant: "error"');
    expect(src).toContain('label: "Retry"');
  });

  it("never routes a write failure through the list-level error", () => {
    // The only setError calls left are the reset in fetchTasks and the
    // failed-initial-load branch.
    const calls = src.match(/setError\(/g) ?? [];
    expect(calls.length).toBe(2);
    expect(src).toContain("setError(LOAD_FAILED_MESSAGE)");
    expect(src).not.toMatch(/setError\((insertError|updateError|deleteError|clearError|dismissError|undismissError|upsertError|failure\.error)\.message\)/);
    expect(src).not.toContain('setError("Not authenticated');
  });

  it("uses plain copy for the load failure", () => {
    expect(LOAD_FAILED_MESSAGE).toBe("Couldn't load your tasks.");
    expect(src).toContain("const nothingToShow = !hasCacheRef.current && taskBaselineRef.current.length === 0;");
  });

  it("resolves addTask with a boolean so callers can wait for the insert", () => {
    expect(src).toContain("async function addTask(taskData: TaskInsert): Promise<boolean>");
    expect(src).toContain("addTask: (data: TaskInsert) => Promise<boolean>;");
  });

  it("announces delete through pushUndo so Cmd+Z restores it", () => {
    expect(src).toContain('label: "Task deleted",');
    expect(src).not.toContain('showToast("Task deleted"');
  });

  it("does not put a failed sync into the list-level error", () => {
    expect(src).not.toContain("setError(message)");
  });
});

describe("TaskCreateModal success toast", () => {
  const src = read("components/tasks/TaskCreateModal.tsx");

  it("toasts Task created only after onAdd resolves without rollback", () => {
    expect(src).toContain("Promise.resolve(result).then((inserted) => {");
    expect(src).toContain('if (inserted !== false) showToast("Task created");');
  });
});

describe("list and board error states", () => {
  it.each([
    "components/tasks/TaskList.tsx",
    "components/tasks/TaskBoardView.tsx",
  ])("%s renders EmptyState with a retry instead of a hard reload", (file) => {
    const src = read(file);
    expect(src).not.toContain("window.location.reload()");
    expect(src).toContain('import EmptyState from "@/components/ui/EmptyState";');
    expect(src).toContain("onClick={() => fetchTasks()}");
  });
});

describe("onAdd wrappers return the insert promise", () => {
  it.each([
    ["app/app/inbox/page.tsx", "return addTask(task);"],
    ["components/home/widgets/TasksTodayWidget.tsx", "return addTask(task);"],
    ["components/calendar/CalendarPanel.tsx", "return addTask(task);"],
    ["components/tasks/board/BoardColumn.tsx", "return onAdd({ ...task, course_name: name });"],
  ])("%s", (file, needle) => {
    expect(read(file)).toContain(needle);
  });
});
