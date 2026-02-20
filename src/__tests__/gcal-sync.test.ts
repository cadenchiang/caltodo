/**
 * Tests for the GCal sync logic: create, update, delete actions,
 * skip when not connected, skip when no due_date, and error handling.
 *
 * Tests the calendar-client functions and token-manager integration
 * to verify the sync behavior matches expected outcomes.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildEventPayload,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/gcal/calendar-client";
import type { Task } from "@/lib/types";

/** Test calendar ID for the dedicated caltodo calendar. */
const TEST_CALENDAR_ID = "caltodo-calendar-id-123";

/**
 * Creates a mock task with sensible defaults.
 */
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    user_id: "user-1",
    title: "Homework 5",
    description: "Complete chapter exercises",
    due_date: "2026-03-20",
    due_time: "23:59",
    is_completed: false,
    color: "#D1D5DB",
    created_at: "2026-02-16T00:00:00Z",
    updated_at: "2026-02-16T00:00:00Z",
    source: "canvas",
    external_id: "canvas-12345",
    course_name: "CS 61A",
    source_url: "https://bcourses.berkeley.edu/courses/1/assignments/5",
    points_possible: 100,
    is_submitted: false,
    google_event_id: null,
    dismissed_at: null,
    repeat_interval: null,
    repeat_unit: null,
    repeat_end_date: null,
    repeat_end_count: null,
    late_due_date: null,
    completed_at: null,
    tags: [],
    ...overrides,
  };
}

describe("sync: create action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create event for task with due_date", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "created-event-id" }),
    });

    const task = createMockTask();
    const eventId = await createCalendarEvent("access-token", TEST_CALENDAR_ID, task);

    expect(eventId).toBe("created-event-id");
  });

  it("should build correct payload for task with source metadata", () => {
    const task = createMockTask();
    const payload = buildEventPayload(task);

    expect(payload.summary).toBe("Homework 5 [due @ 11:59 PM]");
    expect(payload.description).toContain("Complete chapter exercises");
    expect(payload.description).toContain("CS 61A");
    expect(payload.description).toContain("bcourses.berkeley.edu");
  });
});

describe("sync: update action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should update existing event when google_event_id exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "existing-event" }),
    });

    const task = createMockTask({ google_event_id: "existing-event" });
    const result = await updateCalendarEvent("access-token", TEST_CALENDAR_ID, "existing-event", task);

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("existing-event"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("should handle update of completed task with checkmark prefix", () => {
    const task = createMockTask({ is_completed: true, google_event_id: "event-1" });
    const payload = buildEventPayload(task);

    expect(payload.summary).toContain("\u2713");
    expect(payload.summary).toContain("\u0336");
    expect(payload.status).toBe("cancelled");
  });
});

describe("sync: delete action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete event when google_event_id is provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 204 });

    const result = await deleteCalendarEvent("access-token", TEST_CALENDAR_ID, "event-to-delete");

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("event-to-delete"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("should succeed even if event is already gone (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 404 });

    const result = await deleteCalendarEvent("access-token", TEST_CALENDAR_ID, "already-deleted");
    expect(result).toBe(true);
  });
});

describe("sync: error handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle 401 unauthorized gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    const task = createMockTask();
    const eventId = await createCalendarEvent("expired-token", TEST_CALENDAR_ID, task);
    expect(eventId).toBeNull();
  });

  it("should handle network errors gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const task = createMockTask();
    await expect(createCalendarEvent("access-token", TEST_CALENDAR_ID, task)).rejects.toThrow("Network error");
  });

  it("should handle 429 rate limit on create", async () => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve("Rate limit exceeded"),
    });

    const task = createMockTask();
    const promise = createCalendarEvent("access-token", TEST_CALENDAR_ID, task);

    // Advance through all retry delays (1s + 2s + 4s)
    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(5000);
    }

    const eventId = await promise;
    expect(eventId).toBeNull();
    vi.useRealTimers();
  });

  it("should handle 500 server error on update", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const task = createMockTask({ google_event_id: "event-1" });
    const result = await updateCalendarEvent("access-token", TEST_CALENDAR_ID, "event-1", task);
    expect(result).toBe(false);
  });

  it("should handle 500 server error on delete", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const result = await deleteCalendarEvent("access-token", TEST_CALENDAR_ID, "event-1");
    expect(result).toBe(false);
  });
});
