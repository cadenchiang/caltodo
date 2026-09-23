/**
 * Audit section 4: the inbox dropped anything due more than 30 days out,
 * drag-to-reorder snapped back on cross-date moves, snooze was silent, and
 * rows/headers were click-only divs. Covers the pure list helpers, the
 * snooze vocabulary, and the split list files.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Task } from "@/lib/types";
import {
  LATER_DAYS,
  formatCountdown,
  isSameDateSibling,
  moveTaskByStep,
  partitionTasks,
  reorderWithinDate,
} from "@/components/tasks/task-list-helpers";
import { FOREVER_HOURS, formatSnoozeDuration, isSnoozed } from "@/lib/snooze";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

function task(overrides: Partial<Task> & { id: string }): Task {
  return {
    user_id: "u",
    title: overrides.id,
    description: "",
    due_date: null,
    due_time: null,
    is_completed: false,
    color: "#0e89d6",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    source: null,
    external_id: null,
    course_name: null,
    source_url: null,
    points_possible: null,
    is_submitted: false,
    google_event_id: null,
    dismissed_at: null,
    repeat_interval: null,
    repeat_unit: null,
    repeat_end_date: null,
    repeat_end_count: null,
    late_due_date: null,
    completed_at: null,
    tags: [],
    snoozed_until: null,
    sort_order: null,
    due_date_manually_edited_at: null,
    due_time_manually_edited_at: null,
    ...overrides,
  } as Task;
}

const NOW = new Date("2026-09-23T12:00:00");

describe("partitionTasks", () => {
  it("folds tasks due more than LATER_DAYS out into later instead of dropping them", () => {
    const soon = task({ id: "soon", due_date: "2026-09-30" });
    const edge = task({ id: "edge", due_date: "2026-10-23" });
    const far = task({ id: "far", due_date: "2026-10-24" });
    const undated = task({ id: "undated" });
    const sections = partitionTasks([far, soon, edge, undated], NOW, 24);
    expect(LATER_DAYS).toBe(30);
    expect(sections.active.map((t) => t.id)).toEqual(["undated", "soon", "edge"]);
    expect(sections.later.map((t) => t.id)).toEqual(["far"]);
  });

  it("separates snoozed and completed tasks and honours the auto-hide window", () => {
    const hidden = task({ id: "hidden", snoozed_until: "2026-09-24T00:00:00" });
    const expired = task({ id: "expired", snoozed_until: "2026-09-22T00:00:00" });
    const recent = task({ id: "recent", is_completed: true, completed_at: "2026-09-23T10:00:00" });
    const old = task({ id: "old", is_completed: true, completed_at: "2026-09-20T10:00:00" });
    const sections = partitionTasks([hidden, expired, recent, old], NOW, 24);
    expect(sections.snoozed.map((t) => t.id)).toEqual(["hidden"]);
    expect(sections.active.map((t) => t.id)).toEqual(["expired"]);
    expect(sections.completed.map((t) => t.id)).toEqual(["recent"]);
    expect(partitionTasks([old], NOW, 0).completed).toHaveLength(1);
  });
});

describe("same-date reorder", () => {
  const list = [
    task({ id: "a", due_date: "2026-09-24", sort_order: 1000 }),
    task({ id: "b", due_date: "2026-09-24", sort_order: 2000 }),
    task({ id: "c", due_date: "2026-09-25", sort_order: 1000 }),
  ];

  it("allows drops only between same-date siblings", () => {
    expect(isSameDateSibling(list[0], list[1])).toBe(true);
    expect(isSameDateSibling(list[1], list[2])).toBe(false);
    expect(reorderWithinDate(list, "a", 2)).toBeNull();
  });

  it("renumbers only the siblings of the moved task", () => {
    const updates = reorderWithinDate(list, "a", 1);
    expect(updates).toEqual([
      { id: "b", sort_order: 1000 },
      { id: "a", sort_order: 2000 },
    ]);
  });

  it("moves one step by keyboard and refuses to cross a date or an edge", () => {
    expect(moveTaskByStep(list, "b", -1)).toEqual([
      { id: "b", sort_order: 1000 },
      { id: "a", sort_order: 2000 },
    ]);
    expect(moveTaskByStep(list, "b", 1)).toBeNull();
    expect(moveTaskByStep(list, "a", -1)).toBeNull();
    expect(moveTaskByStep(list, "missing", 1)).toBeNull();
  });
});

describe("snooze vocabulary", () => {
  it("labels presets, custom values and forever", () => {
    expect(formatSnoozeDuration(168)).toBe("1 week");
    expect(formatSnoozeDuration(5)).toBe("5 hours");
    expect(formatSnoozeDuration(48)).toBe("2 days");
    expect(formatSnoozeDuration(0.5)).toBe("30 minutes");
    expect(formatSnoozeDuration(FOREVER_HOURS)).toBe("until you unhide it");
  });

  it("reports an active snooze only while it has not expired", () => {
    const now = NOW.getTime();
    expect(isSnoozed("2026-09-24T00:00:00", now)).toBe(true);
    expect(isSnoozed("2026-09-22T00:00:00", now)).toBe(false);
    expect(isSnoozed(null, now)).toBe(false);
  });

  it("formats the hidden countdown", () => {
    const now = NOW.getTime();
    expect(formatCountdown("2026-09-23T14:30:00", now)).toBe("2h 30m");
    expect(formatCountdown("2026-09-25T13:00:00", now)).toBe("2d 1h");
    expect(formatCountdown("2026-09-23T11:00:00", now)).toBe("< 1m");
    expect(formatCountdown("2126-09-23T12:00:00", now)).toBe("Hidden");
  });
});

describe("snooze wiring", () => {
  it("TaskContext announces a snooze through pushUndo after the write lands", () => {
    const src = read("contexts/TaskContext.tsx");
    expect(src).toContain("label: `Hidden for ${formatSnoozeDuration(hours)}`,");
    expect(src).toContain("undo: () => unsnoozeTask(id),");
    expect(src).toContain("const written = await updateTask(id, { snoozed_until: snoozedUntil }, { announce: false });");
  });

  it("the task menu flips its submenu near the viewport edge and is a Popover menu", () => {
    const src = read("components/tasks/shared/TaskContextMenu.tsx");
    expect(src).toContain("setFlipSubmenu(rect.right + SUBMENU_WIDTH > window.innerWidth);");
    expect(src).toContain('role="menu"');
    expect(src).toContain("Hide for...");
    expect(src).toContain("Move up");
    expect(src).toContain("Delete task");
  });
});

describe("keyboard-reachable rows and headers", () => {
  it("TaskItem is a role=button row with Enter/Space and a focus-revealed More button", () => {
    const src = read("components/tasks/TaskItem.tsx");
    expect(src).toContain('role="button"');
    expect(src).toContain("tabIndex={0}");
    expect(src).toContain('if (e.key === "Enter" || e.key === " ")');
    expect(src).toContain("group-focus-within:opacity-100");
    expect(src).toContain('import DueDatePill from "@/components/ui/DueDatePill";');
    expect(src).not.toContain("getDueDateInfo");
    expect(src).not.toContain("text-[#e8729a]");
  });

  it("section headers are buttons with aria-expanded", () => {
    const src = read("components/tasks/list/ListSectionHeader.tsx");
    expect(src).toContain("aria-expanded={expanded}");
    expect(src).toContain("group-focus-within:opacity-100");
  });

  it("the checkbox keeps a 44px hit area at every size", () => {
    const src = read("components/tasks/shared/TaskCheckbox.tsx");
    expect(src).toContain('"after:-inset-[15px]"');
    expect(src).toContain("after:absolute after:content-['']");
  });
});

describe("TaskList split", () => {
  it.each([
    "components/tasks/TaskList.tsx",
    "components/tasks/TaskItem.tsx",
    "components/tasks/task-list-helpers.ts",
    "components/tasks/board-storage.ts",
    "components/tasks/list/RequestsSection.tsx",
    "components/tasks/list/HiddenSection.tsx",
    "components/tasks/list/CompletedSection.tsx",
    "components/tasks/list/LaterSection.tsx",
    "components/tasks/list/ListSectionHeader.tsx",
    "components/tasks/list/TaskListSkeleton.tsx",
    "components/tasks/list/useListReorder.ts",
    "components/tasks/shared/TaskContextMenu.tsx",
    "components/tasks/shared/SnoozeMenu.tsx",
  ])("%s stays under 300 lines", (file) => {
    expect(read(file).split("\n").length).toBeLessThanOrEqual(300);
  });

  it("TaskList renders the Later section, a skeleton and filter-aware empty copy", () => {
    const src = read("components/tasks/TaskList.tsx");
    expect(src).toContain("<LaterSection");
    expect(src).toContain("if (loading) return <TaskListSkeleton />;");
    expect(src).toContain("EMPTY_COPY[filter].title");
    expect(src).not.toContain("animate-spin");
    expect(src).not.toContain("Press + to add one");
  });

  it("the inbox no longer cuts the list at 30 days and forwards the redirect filter", () => {
    const src = read("app/app/inbox/page.tsx");
    expect(src).toContain('if (filter === "all") return tasks;');
    expect(src).not.toContain("? 7 : 30");
    expect(src).toContain('urlParams.get("filter")');
  });
});

describe("today route", () => {
  it("redirects to the inbox with the Today filter and forwards ?task=", () => {
    const src = read("app/app/today/page.tsx");
    expect(src).toContain('redirect(`/app/inbox?${query.toString()}`);');
    expect(src).toContain('new URLSearchParams({ filter: "today" })');
  });

  it("push reminders and the manifest point at the inbox", () => {
    expect(read("app/api/cron/push-reminders/route.ts")).toContain("url: `/app/inbox?task=${task.id}`");
    expect(read("app/api/cron/push-reminders/route.ts")).toContain('url: "/app/inbox?filter=today"');
    expect(read("app/manifest.ts")).toContain('start_url: "/app/inbox"');
    expect(read("app/sw.ts")).not.toContain("/app/today");
  });
});
