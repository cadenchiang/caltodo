/**
 * Tests for the client-side Google Calendar push helpers (client-push.ts).
 *
 * Verifies:
 * - isGCalConnected reads the localStorage status cache and never throws
 * - touchesGCalEvent only flags columns that appear on the calendar event
 * - pushTaskToGCal skips when disconnected with no event id, returns the
 *   attached event id on create/update, null on delete, and never rejects
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isGCalConnected,
  touchesGCalEvent,
  pushTaskToGCal,
  pushBatchDeleteToGCal,
  GCAL_DELETE_BATCH_MAX,
} from "@/lib/gcal/client-push";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

/** Minimal localStorage stand-in for the node test environment. */
function stubLocalStorage(value: string | null, throws = false) {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      if (throws) throw new Error("blocked");
      return value;
    },
  });
}

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("isGCalConnected", () => {
  it("is true only when the cache says connected", () => {
    stubLocalStorage(JSON.stringify({ connected: true }));
    expect(isGCalConnected()).toBe(true);
    stubLocalStorage(JSON.stringify({ connected: false }));
    expect(isGCalConnected()).toBe(false);
    stubLocalStorage(null);
    expect(isGCalConnected()).toBe(false);
  });

  it("returns false instead of throwing on a broken cache", () => {
    stubLocalStorage("not json");
    expect(isGCalConnected()).toBe(false);
    stubLocalStorage(null, true);
    expect(isGCalConnected()).toBe(false);
  });
});

describe("touchesGCalEvent", () => {
  it("ignores columns the event never shows", () => {
    expect(touchesGCalEvent({ color: "#fff" })).toBe(false);
    expect(touchesGCalEvent({ tags: ["a"], sort_order: 3 })).toBe(false);
    expect(touchesGCalEvent({})).toBe(false);
  });

  it("flags every column buildEventPayload reads", () => {
    expect(touchesGCalEvent({ title: "x" })).toBe(true);
    expect(touchesGCalEvent({ due_date: "2026-01-01" })).toBe(true);
    expect(touchesGCalEvent({ due_time: "10:00" })).toBe(true);
    expect(touchesGCalEvent({ is_completed: true })).toBe(true);
    expect(touchesGCalEvent({ description: "d" })).toBe(true);
    expect(touchesGCalEvent({ color: "#fff", title: "x" })).toBe(true);
  });
});

describe("pushTaskToGCal", () => {
  it("skips the request when disconnected and no event id is known", async () => {
    stubLocalStorage(JSON.stringify({ connected: false }));
    const result = await pushTaskToGCal("create", "task-1");
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still sends a delete for a known event id when disconnected", async () => {
    stubLocalStorage(null);
    fetchMock.mockResolvedValueOnce(jsonResponse({ synced: true }));
    await pushTaskToGCal("delete", "task-1", "evt-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ action: "delete", taskId: "task-1", googleEventId: "evt-1" });
  });

  it("returns the event id the server attached on create", async () => {
    stubLocalStorage(JSON.stringify({ connected: true }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ synced: true, googleEventId: "evt-new" }));
    const result = await pushTaskToGCal("create", "task-1");
    expect(result).toBe("evt-new");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.googleEventId).toBeUndefined();
  });

  it("returns null when the server did not attach an event", async () => {
    stubLocalStorage(JSON.stringify({ connected: true }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ synced: false, reason: "no_due_date" }));
    expect(await pushTaskToGCal("update", "task-1")).toBeNull();
  });

  it("returns null for delete even when the server reports synced", async () => {
    stubLocalStorage(JSON.stringify({ connected: true }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ synced: true }));
    expect(await pushTaskToGCal("delete", "task-1")).toBeNull();
  });

  it("never rejects on a non-ok response or a network error", async () => {
    stubLocalStorage(JSON.stringify({ connected: true }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Too many requests" }, false, 429));
    await expect(pushTaskToGCal("create", "task-1")).resolves.toBeNull();
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    await expect(pushTaskToGCal("create", "task-1")).resolves.toBeNull();
  });
});

describe("pushBatchDeleteToGCal", () => {
  it("sends nothing when disconnected or given no ids", async () => {
    stubLocalStorage(JSON.stringify({ connected: false }));
    await pushBatchDeleteToGCal(["t1"]);
    stubLocalStorage(JSON.stringify({ connected: true }));
    await pushBatchDeleteToGCal([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends one request per 100 ids to the batch endpoint", async () => {
    stubLocalStorage(JSON.stringify({ connected: true }));
    fetchMock.mockResolvedValue(jsonResponse({ deleted: 0, failed: 0, skipped: 0 }));
    const ids = Array.from({ length: GCAL_DELETE_BATCH_MAX + 5 }, (_, i) => `t${i}`);
    await pushBatchDeleteToGCal(ids);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/gcal/delete-batch");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).taskIds).toHaveLength(GCAL_DELETE_BATCH_MAX);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).taskIds).toHaveLength(5);
  });

  it("never rejects on a failed or errored request", async () => {
    stubLocalStorage(JSON.stringify({ connected: true }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "x" }, false, 429));
    await expect(pushBatchDeleteToGCal(["t1"])).resolves.toBeUndefined();
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    await expect(pushBatchDeleteToGCal(["t1"])).resolves.toBeUndefined();
  });
});
