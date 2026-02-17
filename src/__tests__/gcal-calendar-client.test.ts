/**
 * Tests for Google Calendar client: event payload builder and CRUD operations.
 * Validates all-day events, timed events, completed tasks, and API error handling.
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
 * Override any field via the partial parameter.
 */
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    user_id: "user-1",
    title: "Test Task",
    description: "A test description",
    due_date: "2026-03-15",
    due_time: null,
    is_completed: false,
    color: "#D1D5DB",
    created_at: "2026-02-16T00:00:00Z",
    updated_at: "2026-02-16T00:00:00Z",
    source: null,
    external_id: null,
    course_name: null,
    source_url: null,
    points_possible: null,
    is_submitted: false,
    google_event_id: null,
    ...overrides,
  };
}

describe("buildEventPayload", () => {
  it("should build an all-day event when due_time is null", () => {
    const task = createMockTask({ due_date: "2026-03-15", due_time: null });
    const payload = buildEventPayload(task);

    expect(payload.summary).toBe("Test Task");
    expect(payload.start).toEqual({ date: "2026-03-15" });
    expect(payload.end).toEqual({ date: "2026-03-16" });
    expect(payload.transparency).toBe("transparent");
    expect(payload.status).toBeUndefined();
  });

  it("should build a timed event (30-min) when due_time is set", () => {
    const task = createMockTask({ due_date: "2026-03-15", due_time: "14:30" });
    const payload = buildEventPayload(task);

    expect(payload.summary).toBe("Test Task");
    expect(payload.start).toEqual({ dateTime: "2026-03-15T14:30:00" });
    // End time should be 30 minutes later
    expect(payload.end).toHaveProperty("dateTime");
    const endDateTime = (payload.end as { dateTime: string }).dateTime;
    expect(endDateTime).toContain("15:00:00");
  });

  it("should prefix completed tasks with checkmark and set cancelled status", () => {
    const task = createMockTask({ is_completed: true });
    const payload = buildEventPayload(task);

    expect(payload.summary).toBe("\u2713 Test Task");
    expect(payload.status).toBe("cancelled");
  });

  it("should include course name in description", () => {
    const task = createMockTask({ course_name: "CS 61A" });
    const payload = buildEventPayload(task);

    expect(payload.description).toContain("Course: CS 61A");
  });

  it("should include source info in description", () => {
    const task = createMockTask({
      source: "canvas",
      source_url: "https://example.com/assignment/1",
    });
    const payload = buildEventPayload(task);

    expect(payload.description).toContain("Source: canvas");
    expect(payload.description).toContain("https://example.com/assignment/1");
  });

  it("should always include caltodo footer in description", () => {
    const task = createMockTask();
    const payload = buildEventPayload(task);

    expect(payload.description).toContain("Managed by caltodo");
  });
});

describe("createCalendarEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return event ID on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "gcal-event-123" }),
    });

    const task = createMockTask();
    const eventId = await createCalendarEvent("access-token", TEST_CALENDAR_ID, task);

    expect(eventId).toBe("gcal-event-123");
    expect(fetch).toHaveBeenCalledWith(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(TEST_CALENDAR_ID)}/events`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      })
    );
  });

  it("should return null on API failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    const task = createMockTask();
    const eventId = await createCalendarEvent("bad-token", TEST_CALENDAR_ID, task);
    expect(eventId).toBeNull();
  });

  it("should return null on 429 rate limit", async () => {
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
});

describe("updateCalendarEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true on successful update", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "gcal-event-123" }),
    });

    const task = createMockTask();
    const result = await updateCalendarEvent("access-token", TEST_CALENDAR_ID, "gcal-event-123", task);

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(TEST_CALENDAR_ID)}/events/gcal-event-123`,
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("should return false on API failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not Found"),
    });

    const task = createMockTask();
    const result = await updateCalendarEvent("access-token", TEST_CALENDAR_ID, "bad-event-id", task);
    expect(result).toBe(false);
  });
});

describe("deleteCalendarEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true on 204 (deleted)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 204 });

    const result = await deleteCalendarEvent("access-token", TEST_CALENDAR_ID, "gcal-event-123");
    expect(result).toBe(true);
  });

  it("should return true on 404 (already deleted)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 404 });

    const result = await deleteCalendarEvent("access-token", TEST_CALENDAR_ID, "gone-event");
    expect(result).toBe(true);
  });

  it("should return true on 410 (gone)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 410 });

    const result = await deleteCalendarEvent("access-token", TEST_CALENDAR_ID, "gone-event");
    expect(result).toBe(true);
  });

  it("should return false on other errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const result = await deleteCalendarEvent("access-token", TEST_CALENDAR_ID, "gcal-event-123");
    expect(result).toBe(false);
  });
});
