/**
 * Tests for the MCP tool registry.
 * Mocks the assignment queries to test argument coercion, validation,
 * formatting, and error normalization.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockList = vi.fn();
const mockSync = vi.fn();

vi.mock("@/lib/mcp/assignments", () => ({
  listAssignments: (...args: unknown[]) => mockList(...args),
  syncAssignments: (...args: unknown[]) => mockSync(...args),
}));

import { MCP_TOOLS, findTool, callTool } from "@/lib/mcp/tools";

const USER_ID = "user-abc-123";

const ASSIGNMENT = {
  id: "task-1",
  title: "Problem Set 3",
  course: "UGBA 101A",
  source: "canvas",
  due_date: "2026-08-25",
  due_time: "23:59",
  is_completed: false,
  is_submitted: false,
  points_possible: 20,
  url: "https://canvas.example/a/1",
};

describe("MCP_TOOLS", () => {
  it("exposes list_assignments and sync_assignments", () => {
    expect(MCP_TOOLS.map((t) => t.name).sort()).toEqual([
      "list_assignments",
      "sync_assignments",
    ]);
  });

  it("gives every tool a description and an object input schema", () => {
    for (const tool of MCP_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.inputSchema.additionalProperties).toBe(false);
    }
  });
});

describe("findTool", () => {
  it("finds a known tool", () => {
    expect(findTool("list_assignments")?.name).toBe("list_assignments");
  });

  it("returns undefined for an unknown tool", () => {
    expect(findTool("delete_everything")).toBeUndefined();
  });
});

describe("callTool: list_assignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue([ASSIGNMENT]);
  });

  it("passes no filters through when called with empty arguments", async () => {
    await callTool("list_assignments", {}, USER_ID);
    expect(mockList).toHaveBeenCalledWith(USER_ID, {
      source: undefined,
      status: undefined,
      includeCompleted: undefined,
      daysAhead: undefined,
      course: undefined,
      limit: undefined,
      timezone: undefined,
    });
  });

  it("maps snake_case arguments onto the query filters", async () => {
    await callTool(
      "list_assignments",
      {
        source: "gradescope",
        status: "overdue",
        include_completed: true,
        days_ahead: 30,
        course: "101A",
        limit: 5,
        timezone: "UTC",
      },
      USER_ID
    );
    expect(mockList).toHaveBeenCalledWith(USER_ID, {
      source: "gradescope",
      status: "overdue",
      includeCompleted: true,
      daysAhead: 30,
      course: "101A",
      limit: 5,
      timezone: "UTC",
    });
  });

  it("coerces stringified numbers and booleans", async () => {
    await callTool(
      "list_assignments",
      { days_ahead: "7", limit: "10", include_completed: "false" },
      USER_ID
    );
    expect(mockList).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({ daysAhead: 7, limit: 10, includeCompleted: false })
    );
  });

  it("rejects an unknown source without querying", async () => {
    const result = await callTool("list_assignments", { source: "moodle" }, USER_ID);
    expect(result.isError).toBe(true);
    expect(result.text).toMatch(/Invalid source/);
    expect(mockList).not.toHaveBeenCalled();
  });

  it("rejects an unknown status without querying", async () => {
    const result = await callTool("list_assignments", { status: "someday" }, USER_ID);
    expect(result.isError).toBe(true);
    expect(result.text).toMatch(/Invalid status/);
    expect(mockList).not.toHaveBeenCalled();
  });

  it("formats assignments with course, due date, points and link", async () => {
    const result = await callTool("list_assignments", {}, USER_ID);
    expect(result.isError).toBe(false);
    expect(result.text).toContain("1 assignment:");
    expect(result.text).toContain("Problem Set 3");
    expect(result.text).toContain("[UGBA 101A]");
    expect(result.text).toContain("due 2026-08-25 23:59");
    expect(result.text).toContain("(20 pts)");
    expect(result.text).toContain("https://canvas.example/a/1");
  });

  it("handles assignments with no due date, course, points, or link", async () => {
    mockList.mockResolvedValue([
      {
        ...ASSIGNMENT,
        course: null,
        due_date: null,
        due_time: null,
        points_possible: null,
        url: null,
      },
    ]);
    const result = await callTool("list_assignments", {}, USER_ID);
    expect(result.text).toContain("no due date");
    expect(result.text).not.toContain("[null]");
  });

  it("marks completed assignments in the output", async () => {
    mockList.mockResolvedValue([{ ...ASSIGNMENT, is_completed: true }]);
    const result = await callTool("list_assignments", { include_completed: true }, USER_ID);
    expect(result.text).toContain("(completed)");
  });

  it("returns a plain sentence when nothing matches", async () => {
    mockList.mockResolvedValue([]);
    const result = await callTool("list_assignments", {}, USER_ID);
    expect(result.isError).toBe(false);
    expect(result.text).toBe("No assignments match that filter.");
  });

  it("returns an isError result when the query throws", async () => {
    mockList.mockRejectedValue(new Error("connection reset"));
    const result = await callTool("list_assignments", {}, USER_ID);
    expect(result).toEqual({ text: "connection reset", isError: true });
  });
});

describe("callTool: sync_assignments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("summarizes per-source counts on success", async () => {
    mockSync.mockResolvedValue({
      canvas: { synced: 3, errors: [] },
      gradescope: { synced: 1, errors: [] },
    });
    const result = await callTool("sync_assignments", {}, USER_ID);
    expect(mockSync).toHaveBeenCalledWith(USER_ID, undefined);
    expect(result).toEqual({
      text: "Synced 3 Canvas and 1 Gradescope assignments.",
      isError: false,
    });
  });

  it("passes an explicit timezone through", async () => {
    mockSync.mockResolvedValue({
      canvas: { synced: 0, errors: [] },
      gradescope: { synced: 0, errors: [] },
    });
    await callTool("sync_assignments", { timezone: "UTC" }, USER_ID);
    expect(mockSync).toHaveBeenCalledWith(USER_ID, "UTC");
  });

  it("appends per-source errors to the summary", async () => {
    mockSync.mockResolvedValue({
      canvas: { synced: 2, errors: [] },
      gradescope: { synced: 0, errors: ["Gradescope login failed"] },
    });
    const result = await callTool("sync_assignments", {}, USER_ID);
    expect(result.isError).toBe(false);
    expect(result.text).toContain("Errors: Gradescope login failed");
  });

  it("returns an isError result when the sync throws", async () => {
    mockSync.mockRejectedValue(new Error("canvas token expired"));
    const result = await callTool("sync_assignments", {}, USER_ID);
    expect(result).toEqual({ text: "canvas token expired", isError: true });
  });
});

describe("callTool: unknown tool", () => {
  it("returns an isError result naming the tool", async () => {
    const result = await callTool("drop_tables", {}, USER_ID);
    expect(result.isError).toBe(true);
    expect(result.text).toContain("drop_tables");
  });
});
