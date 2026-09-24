/**
 * Audit section 4: the board forced 4 columns at every width, blocked wheel
 * and page scroll on touch, had keyboard-dead columns, cards without
 * checkboxes, ignored snoozed_until, and hand-rolled z-[9999] menus.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Task } from "@/lib/types";
import {
  DATE_BUCKETS,
  applyColumnOrder,
  getColumnAccent,
  groupByDate,
  partitionColumnTasks,
  dominantColor,
} from "@/components/tasks/board-helpers";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

function task(overrides: Partial<Task> & { id: string }): Task {
  return {
    user_id: "u", title: overrides.id, description: "", due_date: null, due_time: null,
    is_completed: false, color: "#0e89d6", created_at: "", updated_at: "", source: null,
    external_id: null, course_name: null, source_url: null, points_possible: null,
    is_submitted: false, google_event_id: null, dismissed_at: null, repeat_interval: null,
    repeat_unit: null, repeat_end_date: null, repeat_end_count: null, late_due_date: null,
    completed_at: null, tags: [], snoozed_until: null, sort_order: null,
    due_date_manually_edited_at: null, due_time_manually_edited_at: null, ...overrides,
  } as Task;
}

describe("board helpers", () => {
  it("leaves snoozed tasks out of the active cards and treats submitted as completed", () => {
    const now = new Date("2026-09-23T12:00:00").getTime();
    const { active, completed } = partitionColumnTasks(
      [
        task({ id: "a", due_date: "2026-09-25" }),
        task({ id: "hidden", snoozed_until: "2026-09-30T00:00:00" }),
        task({ id: "sub", is_submitted: true }),
      ],
      now
    );
    expect(active.map((t) => t.id)).toEqual(["a"]);
    expect(completed.map((t) => t.id)).toEqual(["sub"]);
  });

  it("uses sentence-case date buckets and puts overdue in Today", () => {
    expect(DATE_BUCKETS).toEqual(["Today", "Next 3 days", "Next 7 days", "Later"]);
    const groups = groupByDate([task({ id: "late", due_date: "2026-09-01" }), task({ id: "soon", due_date: "2026-09-25" })], new Date("2026-09-23T10:00:00"));
    expect(groups.get("Today")!.map((t) => t.id)).toEqual(["late"]);
    expect(groups.get("Next 3 days")!.map((t) => t.id)).toEqual(["soon"]);
  });

  it("keeps saved order and appends new columns with General last", () => {
    const cols = new Map<string, Task[]>([["General", []], ["A", []], ["B", []]]);
    expect([...applyColumnOrder(cols, ["B", "stale"]).keys()]).toEqual(["B", "A", "General"]);
  });

  it("pins the blue accent to the theme ramp instead of a hex", () => {
    expect(getColumnAccent("Next 7 days").text).toBe("var(--color-blue-500)");
    expect(getColumnAccent("General").text).toBe("var(--secondary-foreground)");
    expect(dominantColor([task({ id: "a", color: "#111111" }), task({ id: "b", color: "#111111" }), task({ id: "c", color: "#222222" })])).toBe("#111111");
  });
});

describe("TaskBoardView split", () => {
  it.each([
    "components/tasks/TaskBoardView.tsx",
    "components/tasks/board-helpers.ts",
    "components/tasks/board/BoardColumn.tsx",
    "components/tasks/board/BoardTaskCard.tsx",
    "components/tasks/board/useBoardPaging.ts",
  ])("%s stays under 300 lines", (file) => {
    expect(read(file).split("\n").length).toBeLessThanOrEqual(300);
  });

  it("uses 1/2/4 columns by breakpoint with snap scrolling and a keyboard sensor", () => {
    const src = read("components/tasks/TaskBoardView.tsx");
    expect(src).toContain("basis-full md:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-3rem)/4)]");
    expect(src).toContain("overflow-x-auto snap-x snap-mandatory");
    expect(src).toContain("useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })");
    expect(src).not.toContain("overflow-x-hidden");
  });

  it("drags from a grip handle and never sets touchAction none on the column root", () => {
    const src = read("components/tasks/board/BoardColumn.tsx");
    expect(src).toContain("{...dragHandleListeners}");
    expect(src).toContain("<GripVertical");
    expect(src).not.toContain("touchAction");
    expect(src).toContain("<ClassMenu");
  });

  it("cards carry a checkbox, are keyboard buttons, and use DueDatePill", () => {
    const src = read("components/tasks/board/BoardTaskCard.tsx");
    expect(src).toContain("<TaskCheckbox");
    expect(src).toContain('role="button"');
    expect(src).toContain("<DueDatePill");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("#e8729a");
  });
});
