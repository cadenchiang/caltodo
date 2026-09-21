/**
 * Tests for the task list pager (L10).
 * PostgREST truncates at 1000 rows silently; the pager keeps reading in
 * ordered pages until a short page, and logs when it hits its own cap.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { fetchAllTaskPages, TASK_PAGE_SIZE, TASK_ROW_CAP } from "@/lib/task-pages";
import { logger } from "@/lib/logger";

/** A runner over `total` numbered rows, honouring range like PostgREST. */
function rowsRunner(total: number) {
  const calls: Array<[number, number]> = [];
  const run = vi.fn(async (from: number, to: number) => {
    calls.push([from, to]);
    const data = [];
    for (let i = from; i <= Math.min(to, total - 1); i++) data.push(i);
    return { data, error: null };
  });
  return { run, calls };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchAllTaskPages", () => {
  it("returns a short list in one request", async () => {
    const { run, calls } = rowsRunner(42);
    const result = await fetchAllTaskPages(run, "test");
    expect(result).toEqual({ data: [...Array(42).keys()], error: null });
    expect(calls).toEqual([[0, TASK_PAGE_SIZE - 1]]);
  });

  it("returns an empty list without paging on", async () => {
    const { run, calls } = rowsRunner(0);
    const result = await fetchAllTaskPages(run, "test");
    expect(result).toEqual({ data: [], error: null });
    expect(calls).toHaveLength(1);
  });

  it("reads past the first page when it comes back full", async () => {
    const { run, calls } = rowsRunner(TASK_PAGE_SIZE + 5);
    const result = await fetchAllTaskPages(run, "test");
    expect(result.data).toHaveLength(TASK_PAGE_SIZE + 5);
    expect(calls).toEqual([
      [0, TASK_PAGE_SIZE - 1],
      [TASK_PAGE_SIZE, 2 * TASK_PAGE_SIZE - 1],
    ]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("makes one extra request when the list is an exact multiple of the page size", async () => {
    const { run, calls } = rowsRunner(TASK_PAGE_SIZE);
    const result = await fetchAllTaskPages(run, "test");
    expect(result.data).toHaveLength(TASK_PAGE_SIZE);
    expect(calls).toHaveLength(2);
  });

  it("stops at the cap and logs who hit it", async () => {
    const { run, calls } = rowsRunner(TASK_ROW_CAP + 100);
    const result = await fetchAllTaskPages(run, "loadInitialTasks", "user-1");
    expect(result.data).toHaveLength(TASK_ROW_CAP);
    expect(calls).toHaveLength(TASK_ROW_CAP / TASK_PAGE_SIZE);
    expect(calls.at(-1)).toEqual([TASK_ROW_CAP - TASK_PAGE_SIZE, TASK_ROW_CAP - 1]);
    expect(logger.warn).toHaveBeenCalledWith(
      "loadInitialTasks: task list hit the row cap",
      expect.objectContaining({ userId: "user-1", cap: TASK_ROW_CAP }),
    );
  });

  it("returns the error from the failing page and stops", async () => {
    const run = vi.fn()
      .mockResolvedValueOnce({ data: Array(TASK_PAGE_SIZE).fill(0), error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const result = await fetchAllTaskPages(run, "test");
    expect(result).toEqual({ data: null, error: { message: "boom" } });
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("treats a null data page as empty", async () => {
    const run = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const result = await fetchAllTaskPages(run, "test");
    expect(result).toEqual({ data: [], error: null });
  });
});
