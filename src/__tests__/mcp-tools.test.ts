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

const mockCreate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/mcp/mutations", () => ({
  createTask: (...args: unknown[]) => mockCreate(...args),
  deleteTask: (...args: unknown[]) => mockDelete(...args),
}));

const mockListEvents = vi.fn();
const mockSetColor = vi.fn();

vi.mock("@/lib/mcp/calendar", () => ({
  listCalendarEvents: (...args: unknown[]) => mockListEvents(...args),
  setEventColor: (...args: unknown[]) => mockSetColor(...args),
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
  it("exposes the read and write tools", () => {
    expect(MCP_TOOLS.map((t) => t.name).sort()).toEqual([
      "complete_task",
      "create_calendar_event",
      "create_task",
      "delete_calendar_event",
      "delete_task",
      "list_assignments",
      "list_calendar_events",
      "list_courses",
      "set_event_color",
      "sync_assignments",
      "update_calendar_event",
      "update_task",
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

  it("accepts the manual source so created tasks are listable", async () => {
    const result = await callTool("list_assignments", { source: "manual" }, USER_ID);
    expect(result.isError).toBe(false);
    expect(mockList).toHaveBeenCalledWith(USER_ID, expect.objectContaining({ source: "manual" }));
  });

  it("labels a null source as manual in the output", async () => {
    mockList.mockResolvedValue([{ ...ASSIGNMENT, source: null }]);
    const result = await callTool("list_assignments", {}, USER_ID);
    expect(result.text).toContain("[manual]");
  });

  it("rejects an unknown status without querying", async () => {
    const result = await callTool("list_assignments", { status: "someday" }, USER_ID);
    expect(result.isError).toBe(true);
    expect(result.text).toMatch(/Invalid status/);
    expect(mockList).not.toHaveBeenCalled();
  });

  it("formats assignments with course, due date, points, id and link", async () => {
    const result = await callTool("list_assignments", {}, USER_ID);
    expect(result.isError).toBe(false);
    expect(result.text).toContain("1 assignment:");
    expect(result.text).toContain("(id: task-1)");
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
      pensieve: { synced: 0, errors: [] },
      brightspace: { synced: 2, errors: [] },
      blackboard: { synced: 0, errors: [] },
      classroom: { synced: 0, errors: [] },
    });
    const result = await callTool("sync_assignments", {}, USER_ID);
    expect(mockSync).toHaveBeenCalledWith(USER_ID, undefined);
    expect(result).toEqual({
      // Names only the platforms that brought something back. The old summary
      // said "0 Canvas and 0 Gradescope" to a Brightspace student whose sync
      // had just worked.
      text: "Synced 6 assignments: 3 from Canvas, 1 from Gradescope, 2 from Brightspace.",
      isError: false,
    });
  });

  it("says so plainly when nothing new arrived", async () => {
    mockSync.mockResolvedValue({
      canvas: { synced: 0, errors: [] },
      gradescope: { synced: 0, errors: [] },
      pensieve: { synced: 0, errors: [] },
      brightspace: { synced: 0, errors: [] },
      blackboard: { synced: 0, errors: [] },
      classroom: { synced: 0, errors: [] },
    });
    const result = await callTool("sync_assignments", {}, USER_ID);
    expect(result).toEqual({
      text: "Synced. No new assignments from any connected platform.",
      isError: false,
    });
  });

  it("survives an engine that does not report every platform", async () => {
    // Code and schema deploy independently; a summary that crashed on a
    // missing key would turn a successful sync into an error.
    mockSync.mockResolvedValue({
      canvas: { synced: 1, errors: [] },
      gradescope: { synced: 0, errors: [] },
    });
    const result = await callTool("sync_assignments", {}, USER_ID);
    expect(result.isError).toBe(false);
    expect(result.text).toContain("1 from Canvas");
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

describe("callTool: create_task", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({
      id: "new-1",
      title: "Read chapter 4",
      due_date: "2026-08-30",
      due_time: "17:00",
      course_name: "UGBA 103",
    });
  });

  it("maps snake_case arguments onto the create input", async () => {
    await callTool(
      "create_task",
      {
        title: "Read chapter 4",
        description: "pages 80-110",
        due_date: "2026-08-30",
        due_time: "17:00",
        course: "UGBA 103",
        tags: ["reading"],
      },
      USER_ID
    );
    expect(mockCreate).toHaveBeenCalledWith(USER_ID, {
      title: "Read chapter 4",
      description: "pages 80-110",
      dueDate: "2026-08-30",
      dueTime: "17:00",
      course: "UGBA 103",
      tags: ["reading"],
    });
  });

  it("passes nulls for omitted optional fields", async () => {
    await callTool("create_task", { title: "Buy a notebook" }, USER_ID);
    expect(mockCreate).toHaveBeenCalledWith(USER_ID, {
      title: "Buy a notebook",
      description: undefined,
      dueDate: null,
      dueTime: null,
      course: null,
      tags: undefined,
    });
  });

  it("accepts tags as a comma-separated string", async () => {
    await callTool("create_task", { title: "x", tags: "reading, ugba" }, USER_ID);
    expect(mockCreate).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({ tags: ["reading", "ugba"] })
    );
  });

  it("confirms with the title, course, due date and new id", async () => {
    const result = await callTool("create_task", { title: "Read chapter 4" }, USER_ID);
    expect(result.isError).toBe(false);
    expect(result.text).toContain("Read chapter 4");
    expect(result.text).toContain("UGBA 103");
    expect(result.text).toContain("2026-08-30 17:00");
    expect(result.text).toContain("id: new-1");
  });

  it("rejects a blank title without writing", async () => {
    const result = await callTool("create_task", { title: "   " }, USER_ID);
    expect(result.isError).toBe(true);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a missing title without writing", async () => {
    const result = await callTool("create_task", {}, USER_ID);
    expect(result.isError).toBe(true);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns an isError result when the insert fails", async () => {
    mockCreate.mockRejectedValue(new Error("duplicate key"));
    const result = await callTool("create_task", { title: "x" }, USER_ID);
    expect(result).toEqual({ text: "duplicate key", isError: true });
  });
});

describe("callTool: delete_task", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes by id and confirms with the title", async () => {
    mockDelete.mockResolvedValue({ title: "Buy a notebook", soft: false });
    const result = await callTool("delete_task", { id: "task-9" }, USER_ID);
    expect(mockDelete).toHaveBeenCalledWith(USER_ID, "task-9");
    expect(result.isError).toBe(false);
    expect(result.text).toContain("Buy a notebook");
  });

  it("says a synced assignment stays hidden through future syncs", async () => {
    mockDelete.mockResolvedValue({ title: "Chapter 1", soft: true });
    const result = await callTool("delete_task", { id: "task-9" }, USER_ID);
    expect(result.text).toMatch(/hidden through future syncs/);
  });

  it("rejects a missing id without writing", async () => {
    const result = await callTool("delete_task", {}, USER_ID);
    expect(result.isError).toBe(true);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns an isError result when the task is not found", async () => {
    mockDelete.mockRejectedValue(new Error('No task found with id "nope".'));
    const result = await callTool("delete_task", { id: "nope" }, USER_ID);
    expect(result.isError).toBe(true);
    expect(result.text).toContain("No task found");
  });
});

describe("callTool: list_calendar_events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListEvents.mockResolvedValue([
      {
        id: "e1",
        calendarId: "primary",
        title: "Standup",
        start: "2026-08-24T09:00:00Z",
        allDay: false,
        colorId: "7",
        colorName: "Peacock",
      },
    ]);
  });

  it("maps snake_case arguments onto the listing filters", async () => {
    await callTool(
      "list_calendar_events",
      { time_min: "2026-08-24T00:00:00Z", time_max: "2026-08-25T00:00:00Z", query: "standup", limit: 5 },
      USER_ID
    );
    expect(mockListEvents).toHaveBeenCalledWith(USER_ID, {
      timeMin: "2026-08-24T00:00:00Z",
      timeMax: "2026-08-25T00:00:00Z",
      query: "standup",
      limit: 5,
    });
  });

  it("shows the color, event id and calendar id on each line", async () => {
    const result = await callTool("list_calendar_events", {}, USER_ID);
    expect(result.isError).toBe(false);
    expect(result.text).toContain("Standup");
    expect(result.text).toContain("color: Peacock");
    expect(result.text).toContain("id: e1");
    expect(result.text).toContain("calendar: primary");
  });

  it("marks all-day events", async () => {
    mockListEvents.mockResolvedValue([
      {
        id: "e2",
        calendarId: "primary",
        title: "Holiday",
        start: "2026-08-25",
        allDay: true,
        colorId: null,
        colorName: "default (calendar color)",
      },
    ]);
    const result = await callTool("list_calendar_events", {}, USER_ID);
    expect(result.text).toContain("(all day)");
  });

  it("returns a plain sentence when the range is empty", async () => {
    mockListEvents.mockResolvedValue([]);
    const result = await callTool("list_calendar_events", {}, USER_ID);
    expect(result).toEqual({ text: "No events in that range.", isError: false });
  });

  it("returns an isError result when Calendar is not connected", async () => {
    mockListEvents.mockRejectedValue(new Error("Google Calendar is not connected."));
    const result = await callTool("list_calendar_events", {}, USER_ID);
    expect(result.isError).toBe(true);
    expect(result.text).toContain("not connected");
  });
});

describe("callTool: set_event_color", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetColor.mockResolvedValue({ title: "Standup", colorName: "Peacock" });
  });

  it("resolves a plain color name to a Google colorId", async () => {
    await callTool("set_event_color", { event_id: "e1", color: "blue" }, USER_ID);
    expect(mockSetColor).toHaveBeenCalledWith(USER_ID, "e1", "7", undefined);
  });

  it("resolves an official palette name", async () => {
    await callTool("set_event_color", { event_id: "e1", color: "Tomato" }, USER_ID);
    expect(mockSetColor).toHaveBeenCalledWith(USER_ID, "e1", "11", undefined);
  });

  it("passes an explicit calendar id through", async () => {
    await callTool(
      "set_event_color",
      { event_id: "e1", color: "5", calendar_id: "work@group" },
      USER_ID
    );
    expect(mockSetColor).toHaveBeenCalledWith(USER_ID, "e1", "5", "work@group");
  });

  it("confirms with the event title and new color", async () => {
    const result = await callTool("set_event_color", { event_id: "e1", color: "blue" }, USER_ID);
    expect(result.isError).toBe(false);
    expect(result.text).toBe('Changed "Standup" to Peacock.');
  });

  it("clears the color when asked for the default", async () => {
    mockSetColor.mockResolvedValue({ title: "Standup", colorName: "default (calendar color)" });
    await callTool("set_event_color", { event_id: "e1", color: "default" }, USER_ID);
    expect(mockSetColor).toHaveBeenCalledWith(USER_ID, "e1", null, undefined);
  });

  it("rejects an unknown color without calling Google", async () => {
    const result = await callTool(
      "set_event_color",
      { event_id: "e1", color: "chartreuse" },
      USER_ID
    );
    expect(result.isError).toBe(true);
    expect(result.text).toMatch(/Unknown color/);
    expect(mockSetColor).not.toHaveBeenCalled();
  });

  it("rejects a missing event_id or color without calling Google", async () => {
    expect((await callTool("set_event_color", { color: "blue" }, USER_ID)).isError).toBe(true);
    expect((await callTool("set_event_color", { event_id: "e1" }, USER_ID)).isError).toBe(true);
    expect(mockSetColor).not.toHaveBeenCalled();
  });

  it("returns an isError result when the event is gone", async () => {
    mockSetColor.mockRejectedValue(new Error('No event "e1" on calendar "primary".'));
    const result = await callTool("set_event_color", { event_id: "e1", color: "blue" }, USER_ID);
    expect(result.isError).toBe(true);
    expect(result.text).toContain("No event");
  });
});
