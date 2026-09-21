/**
 * Tests for the server-side task preload and for every task list query
 * being paged with a total order (L10).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { loadInitialTasks } from "@/lib/tasks-loader";
import { TASK_PAGE_SIZE } from "@/lib/task-pages";
import { logger } from "@/lib/logger";

/** A chainable query stub whose `.range` resolves from `pages` in order. */
function stubClient(pages: Array<{ data: unknown[] | null; error: { message: string } | null }>) {
  const order = vi.fn();
  const range = vi.fn();
  const b: Record<string, unknown> = {};
  const chain = () => b;
  b.select = vi.fn(chain);
  b.is = vi.fn(chain);
  b.order = order.mockImplementation(chain);
  b.range = range.mockImplementation(() => Promise.resolve(pages.shift() ?? { data: [], error: null }));
  const from = vi.fn(() => b);
  return { client: { from } as unknown as SupabaseClient, order, range };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadInitialTasks", () => {
  it("returns the rows of a short list from one page", async () => {
    const { client, range } = stubClient([{ data: [{ id: "a" }, { id: "b" }], error: null }]);
    const tasks = await loadInitialTasks(client, "user-1");
    expect(tasks).toEqual([{ id: "a" }, { id: "b" }]);
    expect(range).toHaveBeenCalledWith(0, TASK_PAGE_SIZE - 1);
  });

  it("orders by created_at then id so pages do not overlap", async () => {
    const { client, order } = stubClient([{ data: [], error: null }]);
    await loadInitialTasks(client, "user-1");
    expect(order.mock.calls).toEqual([
      ["created_at", { ascending: false }],
      ["id", { ascending: false }],
    ]);
  });

  it("keeps reading while pages come back full", async () => {
    const full = Array.from({ length: TASK_PAGE_SIZE }, (_, i) => ({ id: String(i) }));
    const { client, range } = stubClient([
      { data: full, error: null },
      { data: [{ id: "last" }], error: null },
    ]);
    const tasks = await loadInitialTasks(client, "user-1");
    expect(tasks).toHaveLength(TASK_PAGE_SIZE + 1);
    expect(range).toHaveBeenCalledTimes(2);
  });

  it("returns null and logs when the read fails, so the client fetches itself", async () => {
    const { client } = stubClient([{ data: null, error: { message: "boom" } }]);
    const tasks = await loadInitialTasks(client, "user-1");
    expect(tasks).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(
      "loadInitialTasks: preload failed, client will fetch",
      { userId: "user-1", error: "boom" },
    );
  });
});

describe("every task list query is paged with a total order", () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

  it.each([
    ["src/contexts/TaskContext.tsx", "TaskContext.fetchTasks", '.order("id", { ascending: false })'],
    ["src/lib/tasks-loader.ts", "loadInitialTasks", '.order("id", { ascending: false })'],
    ["src/app/api/mobile/tasks/route.ts", "GET /api/mobile/tasks", '.order("id", { ascending: false })'],
    ["src/app/api/calendar/feed/route.ts", "GET /api/calendar/feed", '.order("id", { ascending: true })'],
  ])("%s pages through fetchAllTaskPages as %s", (file, context, tiebreak) => {
    const src = read(file);
    expect(src).toContain("fetchAllTaskPages(");
    expect(src).toContain(`"${context}"`);
    expect(src).toContain(tiebreak);
    expect(src).toContain(".range(from, to)");
  });
});
