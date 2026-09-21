/**
 * Tests for propagate-sync, which pushes server-side assignment sync changes
 * (title/due date edits and auto-dismissals) to Google Calendar.
 *
 * Verifies only genuinely changed tasks with an event are touched, the
 * not-found and no-due-date cases clear the id, the per-run cap logs the
 * remainder, disconnected users cost no Google call, and nothing throws.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const loggerMock = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: loggerMock }));

const mockToken = vi.fn();
const mockCalendarId = vi.fn();
vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: (...args: unknown[]) => mockToken(...args),
  getCalendarId: (...args: unknown[]) => mockCalendarId(...args),
}));

const mockUpdateEvent = vi.fn();
const mockDeleteEvent = vi.fn();
vi.mock("@/lib/gcal/calendar-sync", () => ({
  updateCalendarEvent: (...args: unknown[]) => mockUpdateEvent(...args),
  deleteCalendarEvent: (...args: unknown[]) => mockDeleteEvent(...args),
}));

import {
  propagateUpsertedAssignments,
  propagateDismissedTasks,
  MAX_EVENTS_PER_RUN,
  type PreUpsertRow,
} from "@/lib/gcal/propagate-sync";

/** Current rows the "after" read returns, keyed by id. */
let currentRows: Array<Record<string, unknown>> = [];
/** Ids whose google_event_id was cleared. */
const cleared: string[] = [];
let loadError: { message: string } | null = null;

const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        in: async (_col: string, ids: string[]) => ({
          data: loadError ? null : currentRows.filter((r) => ids.includes(r.id as string)),
          error: loadError,
        }),
      }),
    }),
    update: (payload: { google_event_id: null }) => ({
      eq: async (_col: string, id: string) => {
        if (payload.google_event_id === null) cleared.push(id);
        return { error: null };
      },
    }),
  }),
} as unknown as import("@supabase/supabase-js").SupabaseClient;

function before(id: string, overrides: Partial<PreUpsertRow> = {}): PreUpsertRow {
  return { id, external_id: `ext-${id}`, title: "Old", due_date: "2026-09-25", due_time: null, google_event_id: `evt-${id}`, ...overrides };
}

function now(id: string, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id, title: "Old", description: "", due_date: "2026-09-25", due_time: null, is_completed: false,
    course_name: "CS 61A", source_url: null, google_event_id: `evt-${id}`, ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  currentRows = [];
  cleared.length = 0;
  loadError = null;
  mockToken.mockResolvedValue("access-token");
  mockCalendarId.mockResolvedValue("caltodo-cal");
  mockUpdateEvent.mockResolvedValue(true);
  mockDeleteEvent.mockResolvedValue(true);
});

describe("propagateUpsertedAssignments", () => {
  it("updates only tasks whose title or due date/time actually changed", async () => {
    currentRows = [
      now("a", { due_date: "2026-09-30" }),
      now("b"),
      now("c", { title: "New title" }),
    ];
    const result = await propagateUpsertedAssignments(
      supabase, "user-1", "canvas", [before("a"), before("b"), before("c")], ["ext-a", "ext-b", "ext-c"],
    );
    expect(result).toEqual({ propagated: 2, failed: 0, remaining: 0 });
    const updatedIds = mockUpdateEvent.mock.calls.map((c) => c[2]).sort();
    expect(updatedIds).toEqual(["evt-a", "evt-c"]);
  });

  it("ignores tasks without an event, tasks not upserted, and costs nothing when none qualify", async () => {
    currentRows = [now("a", { title: "changed" })];
    const result = await propagateUpsertedAssignments(
      supabase, "user-1", "canvas",
      [before("a", { google_event_id: null }), before("x")],
      ["ext-a"],
    );
    expect(result).toEqual({ propagated: 0, failed: 0, remaining: 0 });
    expect(mockToken).not.toHaveBeenCalled();
    expect(mockUpdateEvent).not.toHaveBeenCalled();
  });

  it("makes no Google call when the user is not connected", async () => {
    currentRows = [now("a", { title: "changed" })];
    mockToken.mockResolvedValue(null);
    const result = await propagateUpsertedAssignments(supabase, "user-1", "canvas", [before("a")], ["ext-a"]);
    expect(result.propagated).toBe(0);
    expect(mockUpdateEvent).not.toHaveBeenCalled();
  });

  it("clears the id when Google no longer has the event, and deletes when the due date was removed", async () => {
    currentRows = [now("a", { title: "changed" }), now("b", { due_date: null })];
    mockUpdateEvent.mockResolvedValue("not_found");
    const result = await propagateUpsertedAssignments(
      supabase, "user-1", "gradescope", [before("a"), before("b")], ["ext-a", "ext-b"],
    );
    expect(result).toEqual({ propagated: 2, failed: 0, remaining: 0 });
    expect(mockDeleteEvent).toHaveBeenCalledWith("access-token", "caltodo-cal", "evt-b");
    expect(cleared.sort()).toEqual(["a", "b"]);
  });

  it("counts a Google failure and never throws", async () => {
    currentRows = [now("a", { title: "changed" })];
    mockUpdateEvent.mockResolvedValue(false);
    const result = await propagateUpsertedAssignments(supabase, "user-1", "canvas", [before("a")], ["ext-a"]);
    expect(result).toEqual({ propagated: 0, failed: 1, remaining: 0 });
    expect(cleared).toEqual([]);
  });

  it("stops at the per-run cap and logs the remainder", async () => {
    const n = MAX_EVENTS_PER_RUN + 4;
    const ids = Array.from({ length: n }, (_, i) => `t${i}`);
    currentRows = ids.map((id) => now(id, { title: "changed" }));
    const result = await propagateUpsertedAssignments(
      supabase, "user-1", "canvas", ids.map((id) => before(id)), ids.map((id) => `ext-${id}`),
    );
    expect(result).toEqual({ propagated: MAX_EVENTS_PER_RUN, failed: 0, remaining: 4 });
    expect(mockUpdateEvent).toHaveBeenCalledTimes(MAX_EVENTS_PER_RUN);
    expect(loggerMock.warn).toHaveBeenCalledWith(
      "propagate-sync: cap reached, some changed events not updated",
      expect.objectContaining({ remaining: 4 }),
    );
  });

  it("logs and returns when the current rows cannot be loaded", async () => {
    loadError = { message: "db down" };
    const result = await propagateUpsertedAssignments(supabase, "user-1", "canvas", [before("a")], ["ext-a"]);
    expect(result).toEqual({ propagated: 0, failed: 0, remaining: 0 });
    expect(loggerMock.error).toHaveBeenCalled();
  });
});

describe("propagateDismissedTasks", () => {
  it("deletes the events of dismissed tasks and clears their ids", async () => {
    currentRows = [now("a"), now("b", { google_event_id: null }), now("c")];
    const result = await propagateDismissedTasks(supabase, "user-1", ["a", "b", "c"]);
    expect(result).toEqual({ propagated: 2, failed: 0, remaining: 0 });
    expect(mockDeleteEvent).toHaveBeenCalledTimes(2);
    expect(cleared.sort()).toEqual(["a", "c"]);
  });

  it("keeps the id when Google refuses the delete", async () => {
    currentRows = [now("a")];
    mockDeleteEvent.mockResolvedValue(false);
    const result = await propagateDismissedTasks(supabase, "user-1", ["a"]);
    expect(result).toEqual({ propagated: 0, failed: 1, remaining: 0 });
    expect(cleared).toEqual([]);
  });

  it("does nothing for an empty list or a disconnected user", async () => {
    expect(await propagateDismissedTasks(supabase, "user-1", [])).toEqual({ propagated: 0, failed: 0, remaining: 0 });
    currentRows = [now("a")];
    mockToken.mockResolvedValue(null);
    expect(await propagateDismissedTasks(supabase, "user-1", ["a"])).toEqual({ propagated: 0, failed: 0, remaining: 0 });
    expect(mockDeleteEvent).not.toHaveBeenCalled();
  });

  it("stops at the per-run cap and logs the remainder", async () => {
    const ids = Array.from({ length: MAX_EVENTS_PER_RUN + 1 }, (_, i) => `t${i}`);
    currentRows = ids.map((id) => now(id));
    const result = await propagateDismissedTasks(supabase, "user-1", ids);
    expect(result).toEqual({ propagated: MAX_EVENTS_PER_RUN, failed: 0, remaining: 1 });
    expect(loggerMock.warn).toHaveBeenCalledWith(
      "propagate-sync: cap reached, some dismissed events not removed",
      expect.objectContaining({ remaining: 1 }),
    );
  });
});
