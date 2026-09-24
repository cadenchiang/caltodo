/**
 * Audit section 4: task vs assignment, class vs course, bCourses vs Canvas,
 * Title Case, banned uppercase micro-labels, hardcoded #0e89d6 and gray
 * classes, four "default" task colours.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { visibleSourceBadges } from "@/lib/hidden-source-badges";
import { getSourceBadges } from "@/lib/task-utils";
import type { Task } from "@/lib/types";

const root = path.resolve(__dirname, "..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

/** Every .ts/.tsx file under the given folders. */
function files(...dirs: string[]): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.tsx?$/.test(name)) out.push(path.relative(root, full));
    }
  };
  for (const d of dirs) walk(path.join(root, d));
  return out;
}

const SCOPE = files("components/tasks", "components/calendar", "app/app/inbox", "app/app/today").concat([
  "components/layout/MobileTabBar.tsx",
  "components/layout/SidebarNavItem.tsx",
  "components/layout/ThemeToggle.tsx",
  "components/ui/NewAssignmentsModal.tsx",
  "components/ui/CourseSelectModal.tsx",
  "contexts/TaskContext.tsx",
]);

describe("colour tokens in scope", () => {
  it.each(SCOPE)("%s has no #0e89d6 and no gray/zinc/neutral utility classes", (file) => {
    const src = read(file).replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).not.toContain("#0e89d6");
    expect(src).not.toMatch(/\b(text|bg|border|hover:bg|hover:text|dark:bg|dark:border|dark:text|dark:hover:bg)-(gray|zinc|neutral)-\d/);
  });

  it("uses one default task colour", () => {
    expect(read("contexts/TaskContext.tsx")).toContain("color: taskData.color ?? DEFAULT_TASK_COLOR,");
    expect(read("components/tasks/shared/TaskCheckbox.tsx")).not.toContain("#D1D5DB");
  });
});

describe("copy", () => {
  it("labels the Canvas source badge Canvas and honours an old bCourses dismissal", () => {
    const badges = getSourceBadges({ source: "canvas", is_submitted: false, late_due_date: null } as Task);
    expect(badges[0].label).toBe("Canvas");
    expect(visibleSourceBadges(badges, new Set(["bcourses"]))).toEqual([]);
    expect(visibleSourceBadges(badges, new Set())).toHaveLength(1);
  });

  it("uses task, class and sentence case in the surfaces it owns", () => {
    expect(read("components/tasks/TaskDetailPickers.tsx")).not.toContain("every assignment");
    expect(read("components/tasks/TaskList.tsx")).toContain("bring in their tasks");
    expect(read("components/calendar/CalendarSettingsPopover.tsx")).not.toContain("View Mode");
    expect(read("components/calendar/CalendarSettingsPopover.tsx")).not.toContain("uppercase");
    expect(read("components/calendar/CalendarWeekView.tsx")).not.toContain("uppercase");
    expect(read("components/layout/Sidebar.tsx")).toContain('"Next 7 days"');
  });

  it.each(SCOPE)("%s has no em dash in a user-facing string", (file) => {
    const src = read(file).replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
    const strings = src.match(/(["'`])(?:(?!\1)[^\\]|\\.)*\1|>[^<{]*</g) ?? [];
    for (const s of strings) expect(s, file).not.toContain("—");
  });
});
