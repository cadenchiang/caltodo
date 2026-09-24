/**
 * Audit section 4, editors: repeat end date/count shown but never saved,
 * "14" committing 12 instead of 2 PM, a 150 ms duplicate-submit window,
 * month typing closing the date picker, and every modal hand-rolled with
 * no dialog role, focus trap or scroll lock. TaskCreateModal was 1,223 lines.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Task } from "@/lib/types";
import { parseHourInput24 } from "@/lib/time-input";
import { buildTaskInsert, buildTaskUpdates, formStateFromTask, initialFormState } from "@/components/tasks/create/useTaskForm";
import { buildEventBody } from "@/components/calendar/GCalEventCreateModal";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("parseHourInput24", () => {
  it("maps 13 to 23 to PM and keeps 1 to 12 ambiguous", () => {
    expect(parseHourInput24("14")).toEqual({ hour12: 2, ampm: "PM" });
    expect(parseHourInput24("23")).toEqual({ hour12: 11, ampm: "PM" });
    expect(parseHourInput24("0")).toEqual({ hour12: 12, ampm: "AM" });
    expect(parseHourInput24("12")).toEqual({ hour12: 12, ampm: null });
    expect(parseHourInput24("7")).toEqual({ hour12: 7, ampm: null });
    expect(parseHourInput24("99")).toEqual({ hour12: 11, ampm: "PM" });
    expect(parseHourInput24("")).toBeNull();
  });

  it("is what the TimePicker commits with", () => {
    const src = read("components/tasks/TimePicker.tsx");
    expect(src).toContain("parseHourInput24(hourDraft)");
    expect(src).toContain("parsed?.ampm ?? ampm");
  });
});

describe("task form payloads", () => {
  const task = { id: "t", title: "  Essay  ", description: " d ", due_date: "2026-10-01", due_time: "14:00", color: "#0e89d6", tags: ["a"], course_name: "CS 61A", repeat_interval: 1, repeat_unit: "week", repeat_end_date: "2026-12-01", repeat_end_count: null } as unknown as Task;

  it("threads repeat end date and count through both save paths", () => {
    const form = formStateFromTask(task);
    expect(buildTaskUpdates(form)).toMatchObject({ title: "Essay", repeat_end_date: "2026-12-01", repeat_end_count: null, repeat_interval: 1 });
    expect(buildTaskInsert({ ...form, repeatEndCount: 5 })).toMatchObject({ repeat_end_count: 5, repeat_end_date: "2026-12-01", tags: ["a"] });
  });

  it("starts create mode from the defaults", () => {
    expect(initialFormState({ defaultDate: "2026-10-02", defaultCourseName: "X" })).toMatchObject({ dueDate: "2026-10-02", courseName: "X", tags: [], repeatEndDate: null });
  });

  it("the detail panel saves the end condition from the confirmed picker", () => {
    const src = read("components/tasks/TaskDetailPanel.tsx");
    expect(src).toContain("repeat_end_date: d.repeatEndDate,");
    expect(src).toContain("repeat_end_count: d.repeatEndCount,");
    expect(src).toContain("repeatEndDate={task.repeat_end_date}");
  });
});

describe("TaskCreateModal", () => {
  const src = read("components/tasks/TaskCreateModal.tsx");
  it("guards a duplicate submit and closes the date picker only on a pick", () => {
    expect(src).toContain("if (submittingRef.current) return;");
    expect(read("components/tasks/create/TaskFormPickers.tsx")).toContain("onPick={onClose}");
    expect(read("components/tasks/DatePicker.tsx")).toContain("onPick?: () => void;");
  });

  it.each([
    "components/tasks/TaskCreateModal.tsx",
    "components/tasks/create/useTaskForm.ts",
    "components/tasks/create/TaskFormRows.tsx",
    "components/tasks/create/TaskFormPickers.tsx",
    "components/tasks/create/SearchListPicker.tsx",
    "components/tasks/create/ColorConfirmDialog.tsx",
    "components/tasks/create/PortalPopover.tsx",
  ])("%s stays under 300 lines", (file) => {
    expect(read(file).split("\n").length).toBeLessThanOrEqual(300);
  });
});

describe("modals in scope use Modal or useDialog", () => {
  it.each([
    "components/tasks/TaskCreateModal.tsx",
    "components/tasks/CustomRecurrenceModal.tsx",
    "components/ui/NewAssignmentsModal.tsx",
    "components/calendar/GCalEventCreateModal.tsx",
    "components/tasks/create/ColorConfirmDialog.tsx",
    "components/calendar/SyncClassesModal.tsx",
  ])("%s", (file) => {
    const src = read(file);
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).not.toContain("createPortal");
    expect(src).not.toMatch(/z-\[\d+\]/);
  });

  it("TaskPreviewPopover and DayOverflowPopover use useDialog", () => {
    expect(read("components/tasks/TaskPreviewPopover.tsx")).toContain("useDialog({");
    expect(read("components/calendar/DayOverflowPopover.tsx")).toContain("useDialog({");
  });

  it("Popover stops Tab from reaching a Modal underneath", () => {
    const src = read("components/ui/Popover.tsx");
    expect(src.indexOf("trapTab(event, node);\n        // The panel owns focus")).toBeGreaterThan(-1);
    expect(src).toContain("event.stopPropagation();\n      }");
  });
});

describe("buildEventBody", () => {
  it("rejects an end before the start and builds an all-day range", () => {
    expect(buildEventBody({ title: "x", date: "2026-10-01", allDay: false, startTime: "10:00", endTime: "09:00", location: "", description: "" })).toEqual({ error: "End time must be after start time" });
    const built = buildEventBody({ title: "x", date: "2026-10-01", allDay: true, startTime: "", endTime: "", location: " L ", description: "" });
    expect("body" in built && built.body).toMatchObject({ start: "2026-10-01", end: "2026-10-02", location: "L", allDay: true });
    expect(buildEventBody({ title: "x", date: "bad", allDay: true, startTime: "", endTime: "", location: "", description: "" })).toEqual({ error: "Invalid date" });
  });
});
