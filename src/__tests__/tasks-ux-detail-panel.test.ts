/**
 * Audit section 4: the detail panel had no close or Escape and two delete
 * models; TaskPreviewPopover had a stale date format, a transparent mobile
 * backdrop and no focus handling; ~2,000 lines of task UI were unreachable
 * (invites included).
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");
const exists = (rel: string) => existsSync(path.resolve(__dirname, "..", rel));

describe("TaskDetailPanel", () => {
  const src = read("components/tasks/TaskDetailPanel.tsx");

  it("has a close control and closes on Escape when nothing else owns it", () => {
    expect(src).toContain("<TaskActionBar");
    expect(src).toContain('if (e.key !== "Escape" || escapeBelongsElsewhere(e.target)) return;');
    expect(src).toContain(`document.querySelector('[role="dialog"][aria-modal="true"], [role="menu"]')`);
  });

  it("uses one delete model (single click, undo toast) and offers Hide for...", () => {
    expect(src).not.toContain("DeleteTaskButton");
    expect(src).toContain("onSnooze={(hours) => { snoozeTask(task.id, hours); onClose(); }}");
    expect(exists("components/tasks/inline/DeleteTaskButton.tsx")).toBe(false);
  });

  it("wires InviteSection so invites are reachable", () => {
    expect(src).toContain("<InviteSection key={task.id} taskId={task.id} />");
    expect(src).toContain('task.user_id !== ""');
    expect(read("components/tasks/InviteSection.tsx")).toContain("Share task");
    expect(read("components/tasks/InviteSection.tsx")).not.toContain("Send assignment");
  });

  it("no longer hardcodes the brand blue", () => {
    expect(src).not.toContain("#0e89d6");
    expect(read("components/tasks/shared/TaskDetailRows.tsx")).not.toContain("#0e89d6");
    expect(read("components/tasks/TaskLinkField.tsx")).not.toContain("#0e89d6");
  });
});

describe("TaskActionBar", () => {
  const src = read("components/tasks/shared/TaskActionBar.tsx");
  it("uses IconButtons and the shared task menu", () => {
    expect(src).toContain('import IconButton from "@/components/ui/IconButton";');
    expect(src).toContain("<TaskContextMenu");
    expect(src).toContain("aria-label={ACTIONS.close}");
    expect(src).not.toContain("Tooltip");
  });
});

describe("TaskPreviewPopover", () => {
  const src = read("components/tasks/TaskPreviewPopover.tsx");
  it("is a dialog on useDialog with a real mobile backdrop and the panel's date wording", () => {
    expect(src).toContain('import { useDialog } from "@/components/ui/useDialog";');
    expect(src).toContain("MODAL_BACKDROP");
    expect(src).toContain("getDetailDateInfo(task.due_date, task.due_time, !!task.is_completed)");
    expect(src).toContain("z-overlay");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain('"EEE, MMM d, yyyy"');
  });
});

describe("dead task UI is gone", () => {
  it.each([
    "components/tasks/TaskAddForm.tsx",
    "components/tasks/TaskAddPopover.tsx",
    "components/tasks/BoardTaskAddForm.tsx",
    "components/tasks/GuestPicker.tsx",
    "hooks/useMarqueeSelection.ts",
    "components/CalendarModal.tsx",
  ])("%s is deleted", (file) => {
    expect(exists(file)).toBe(false);
  });
});

describe("due chips pass AA", () => {
  it("getDueDateInfo returns the 600/400 pair", () => {
    const src = read("lib/task-utils.ts");
    expect(src).toContain("className: getUrgencyClass(urgency)");
    expect(src).not.toContain('"text-red-400"');
  });
});
