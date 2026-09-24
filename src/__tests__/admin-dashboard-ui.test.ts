/**
 * Tests for the admin dashboard surface (audit 2.29, 2.31).
 *
 * Uppercase gray labels, grid-cols-3 with no mobile breakpoint, hardcoded
 * chart colours, glass cards, and a Platform Adoption chart missing four
 * platforms.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { CHART_COLOR_VARS, resolveChartColors } from "@/components/admin/useChartColors";
import { barColor, buildPlatformRows } from "@/components/admin/PlatformAdoption";
import { countSyllabusUsers } from "@/lib/admin-overview-helpers";

const DIR = path.resolve(__dirname, "..", "components/admin");
const read = (name: string) => readFileSync(path.join(DIR, name), "utf8");
const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));

describe("resolveChartColors", () => {
  it("reads theme variables and falls back per mode when unset", () => {
    const fromTheme = resolveChartColors((v) => (v === "--color-blue-500" ? "#e8729a" : ""), false);
    expect(fromTheme.primary).toBe("#e8729a");
    expect(fromTheme.grid).toBe(CHART_COLOR_VARS.grid.light);
    const dark = resolveChartColors(() => "", true);
    expect(dark.tooltipBg).toBe(CHART_COLOR_VARS.tooltipBg.dark);
  });

  it("maps every color to a documented variable", () => {
    for (const { variable } of Object.values(CHART_COLOR_VARS)) expect(variable.startsWith("--")).toBe(true);
    expect(CHART_COLOR_VARS.text.variable).toBe("--muted-foreground");
    expect(CHART_COLOR_VARS.tooltipBg.variable).toBe("--popover");
  });
});

describe("PlatformAdoption", () => {
  it("lists all eight platforms with full product names", () => {
    const rows = buildPlatformRows({
      canvas: 1, gradescope: 2, googleCalendar: 3, pensieve: 4,
      brightspace: 5, blackboard: 6, classroom: 7, syllabus: 8,
    });
    expect(rows.map((r) => r.name)).toEqual([
      "Canvas", "Gradescope", "Google Calendar", "Pensive",
      "Brightspace", "Blackboard", "Google Classroom", "Syllabus",
    ]);
    expect(rows.map((r) => r.count)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("cycles the four series colors", () => {
    const colors = resolveChartColors(() => "", false);
    expect(barColor(colors, 0)).toBe(colors.primary);
    expect(barColor(colors, 4)).toBe(colors.primary);
    expect(barColor(colors, 5)).toBe(colors.secondary);
  });
});

describe("countSyllabusUsers", () => {
  it("counts distinct owners of syllabus tasks", () => {
    expect(
      countSyllabusUsers([
        { source: "syllabus", user_id: "a" },
        { source: "syllabus", user_id: "a" },
        { source: "syllabus", user_id: "b" },
        { source: "canvas", user_id: "c" },
        { source: null, user_id: "d" },
      ])
    ).toBe(2);
    expect(countSyllabusUsers([])).toBe(0);
  });

  it("the route selects the new columns", () => {
    const route = readFileSync(path.resolve(__dirname, "..", "app/api/admin/overview/route.ts"), "utf8");
    expect(route).toContain("brightspace_calendar_url, blackboard_calendar_url, classroom_enabled");
    expect(route).toContain('.select("is_completed, source, user_id")');
    expect(route).toContain("platforms.syllabus = countSyllabusUsers(allTasks);");
  });
});

describe("admin components", () => {
  it.each(files)("%s has no uppercase gray labels, glass, or em dashes", (name) => {
    const src = read(name);
    expect(src).not.toContain("uppercase");
    expect(src).not.toContain("glass");
    expect(src).not.toContain("—");
  });

  it("use a single-column grid on phones", () => {
    for (const name of ["AdminDashboard.tsx", "RetentionMetrics.tsx", "TaskStats.tsx"]) {
      expect(read(name)).toContain("grid-cols-1 sm:grid-cols-3");
      expect(read(name)).not.toMatch(/"grid grid-cols-3 gap/);
    }
  });

  it("use PageHeader and sentence case", () => {
    const dash = read("AdminDashboard.tsx");
    expect(dash).toContain('<PageHeader title="Analytics"');
    expect(dash).not.toContain("<h1");
    expect(dash).toContain('label="Total users"');
    expect(read("TaskStats.tsx")).toContain("Tasks by source");
    expect(read("RetentionTable.tsx")).toContain("Top users by login frequency");
    expect(read("SignupsChart.tsx")).toContain("Daily signups");
  });
});
