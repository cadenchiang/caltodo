/**
 * Tests for POST /api/gcal/initial-sync and its limits.
 *
 * Verifies the 30-day date floor (query bound plus logged skip count), the
 * per-task event id on progress events, and the elapsed-time guard that
 * ends the run with a partial "done" event instead of being killed.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { syncFloorDate, withinTimeBudget, TIME_BUDGET_MS, SYNC_FLOOR_DAYS } from "@/lib/gcal/initial-sync-limits";

const mockGetUser = vi.fn();
/** Rows returned by the task list query. */
let taskRows: Array<Record<string, unknown>> = [];
/** Count returned by the below-floor count query. */
let belowFloorCount = 0;
/** Filters applied to the list query, for assertions. */
let listFilters: Array<[string, ...unknown[]]> = [];
/** Result of the conditional google_event_id attach. */
const mockAttach = vi.fn();

/**
 * A minimal chainable query builder: every filter returns the builder and
 * awaiting it resolves to the list rows, the count, or the attach result
 * depending on how it was built.
 */
function builder() {
  const state = { count: false, update: false, filters: [] as Array<[string, ...unknown[]]> };
  const b: Record<string, unknown> = {};
  const chain = (name: string) => (...args: unknown[]) => {
    state.filters.push([name, ...args]);
    return b;
  };
  b.select = (cols: string, opts?: { count?: string }) => {
    if (opts?.count) state.count = true;
    state.filters.push(["select", cols]);
    return b;
  };
  b.update = () => { state.update = true; return b; };
  for (const name of ["eq", "not", "gte", "lt", "is", "order"]) b[name] = chain(name);
  b.maybeSingle = () => mockAttach();
  b.then = (resolve: (v: unknown) => void) => {
    if (state.count) return resolve({ count: belowFloorCount, error: null });
    listFilters = state.filters;
    return resolve({ data: taskRows, error: null });
  };
  return b;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve({ auth: { getUser: mockGetUser }, from: () => builder() })),
}));
vi.mock("@/lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => ({ allowed: true })) }));
vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: vi.fn(async () => "access-token"),
  getCalendarId: vi.fn(async () => "caltodo-cal"),
}));
const mockCreate = vi.fn();
vi.mock("@/lib/gcal/calendar-sync", () => ({
  createCalendarEvent: (...args: unknown[]) => mockCreate(...args),
  deleteCalendarEvent: vi.fn(async () => true),
}));

import { POST } from "@/app/api/gcal/initial-sync/route";

/** Reads every NDJSON event from the streamed response. */
async function readEvents(res: Response) {
  const text = await res.text();
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  taskRows = [];
  belowFloorCount = 0;
  listFilters = [];
  mockAttach.mockResolvedValue({ data: { id: "won" } });
  mockCreate.mockImplementation(async (_t: string, _c: string, task: { id: string }) => `evt-${task.id}`);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("initial-sync limits", () => {
  it("floors at SYNC_FLOOR_DAYS before now", () => {
    expect(SYNC_FLOOR_DAYS).toBe(30);
    expect(syncFloorDate(new Date(2026, 8, 21, 12))).toBe("2026-08-22");
    expect(syncFloorDate(new Date(2026, 0, 15, 12))).toBe("2025-12-16");
  });

  it("is within budget until TIME_BUDGET_MS has elapsed", () => {
    expect(withinTimeBudget(1000, 1000 + TIME_BUDGET_MS - 1)).toBe(true);
    expect(withinTimeBudget(1000, 1000 + TIME_BUDGET_MS)).toBe(false);
  });
});

describe("POST /api/gcal/initial-sync", () => {
  it("bounds the query at the date floor and reports the skipped count", async () => {
    belowFloorCount = 7;
    const res = await POST();
    const body = await res.json();
    expect(body).toEqual({ synced: 0, total: 0, skippedOlder: 7 });
    const gte = listFilters.find(([name]) => name === "gte");
    expect(gte).toEqual(["gte", "due_date", syncFloorDate()]);
  });

  it("streams each attached event id and finishes with partial: false", async () => {
    taskRows = [{ id: "t1", due_date: "2026-09-22" }, { id: "t2", due_date: "2026-09-23" }];
    const events = await readEvents(await POST());
    expect(events[0]).toEqual({ type: "start", total: 2 });
    const progress = events.filter((e) => e.type === "progress");
    expect(progress.map((e) => [e.taskId, e.googleEventId]).sort()).toEqual([["t1", "evt-t1"], ["t2", "evt-t2"]]);
    const done = events.at(-1);
    expect(done).toMatchObject({ type: "done", synced: 2, total: 2, partial: false, remaining: 0 });
  });

  it("omits the event id when another run attached first", async () => {
    taskRows = [{ id: "t1", due_date: "2026-09-22" }];
    mockAttach.mockResolvedValue({ data: null });
    const events = await readEvents(await POST());
    const progress = events.find((e) => e.type === "progress");
    expect(progress.taskId).toBeUndefined();
    expect(events.at(-1)).toMatchObject({ synced: 0, total: 1, partial: false });
  });

  it("stops enqueuing at the time budget and reports the remainder", async () => {
    taskRows = [{ id: "t1", due_date: "2026-09-22" }, { id: "t2", due_date: "2026-09-23" }, { id: "t3", due_date: "2026-09-24" }];
    const start = 1_000_000;
    let calls = 0;
    // First call stamps startedAt; every later call is past the budget.
    vi.spyOn(Date, "now").mockImplementation(() => (calls++ === 0 ? start : start + TIME_BUDGET_MS + 1));
    const events = await readEvents(await POST());
    expect(mockCreate).not.toHaveBeenCalled();
    expect(events.at(-1)).toMatchObject({ type: "done", synced: 0, total: 3, partial: true, remaining: 3 });
  });
});
