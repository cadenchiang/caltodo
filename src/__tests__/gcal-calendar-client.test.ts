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
    dismissed_at: null,
    repeat_interval: null,
    repeat_unit: null,
    repeat_end_date: null,
    repeat_end_count: null,
    late_due_date: null,
    completed_at: null,
    tags: [],
    snoozed_until: null,
    sort_order: null,
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

  it("should build an all-day event with time in title when due_time is set", () => {
    const task = createMockTask({ due_date: "2026-03-15", due_time: "14:30" });
    const payload = buildEventPayload(task);

    expect(payload.summary).toBe("Test Task [due @ 2:30 PM]");
    expect(payload.start).toEqual({ date: "2026-03-15" });
    expect(payload.end).toEqual({ date: "2026-03-16" });
  });

  it("should format midnight and noon times correctly in title", () => {
    const midnight = createMockTask({ due_date: "2026-03-15", due_time: "00:00" });
    expect(buildEventPayload(midnight).summary).toBe("Test Task [due @ 12:00 AM]");

    const noon = createMockTask({ due_date: "2026-03-15", due_time: "12:00" });
    expect(buildEventPayload(noon).summary).toBe("Test Task [due @ 12:00 PM]");

    const evening = createMockTask({ due_date: "2026-03-15", due_time: "23:59" });
    expect(buildEventPayload(evening).summary).toBe("Test Task [due @ 11:59 PM]");
  });

  it("should prefix completed tasks with checkmark and set cancelled status", () => {
    const task = createMockTask({ is_completed: true });
    const payload = buildEventPayload(task);

    // Completed: checkmark + strikethrough via U+0336 combining chars
    expect(payload.summary).toContain("\u2713");
    expect(payload.summary).toContain("\u0336");
    expect(payload.status).toBe("cancelled");
  });

  it("should include course name in description", () => {
    const task = createMockTask({ course_name: "CS 61A" });
    const payload = buildEventPayload(task);

    expect(payload.description).toContain("CS 61A");
  });

  it("should include source URL in description", () => {
    const task = createMockTask({
      source: "canvas",
      source_url: "https://example.com/assignment/1",
    });
    const payload = buildEventPayload(task);

    expect(payload.description).toContain("https://example.com/assignment/1");
  });

  it("should not include footer text in description", () => {
    const task = createMockTask();
    const payload = buildEventPayload(task);

    expect(payload.description).not.toContain("Managed by caltodo");
  });

  it("should compute correct end date for month boundaries", () => {
    // Feb 28 (non-leap year) → Mar 1
    const feb28 = createMockTask({ due_date: "2026-02-28" });
    expect(buildEventPayload(feb28).end).toEqual({ date: "2026-03-01" });

    // Dec 31 → Jan 1 of next year
    const dec31 = createMockTask({ due_date: "2026-12-31" });
    expect(buildEventPayload(dec31).end).toEqual({ date: "2027-01-01" });

    // Leap year: Feb 29 → Mar 1
    const feb29 = createMockTask({ due_date: "2028-02-29" });
    expect(buildEventPayload(feb29).end).toEqual({ date: "2028-03-01" });
  });

  it("should compute correct end date near DST transitions", () => {
    // US DST spring forward (Mar 8, 2026) — end date must still be +1 day
    const dstSpring = createMockTask({ due_date: "2026-03-08" });
    expect(buildEventPayload(dstSpring).end).toEqual({ date: "2026-03-09" });

    // US DST fall back (Nov 1, 2026) — end date must still be +1 day
    const dstFall = createMockTask({ due_date: "2026-11-01" });
    expect(buildEventPayload(dstFall).end).toEqual({ date: "2026-11-02" });
  });

  it("should handle empty start/end when due_date is null", () => {
    const task = createMockTask({ due_date: null });
    const payload = buildEventPayload(task);

    expect(payload.start).toEqual({ date: "" });
    expect(payload.end).toEqual({ date: "" });
    expect(payload.transparency).toBeUndefined();
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
    const mockResponse = {
      ok: false,
      status: 429,
      text: () => Promise.resolve("Rate limit exceeded"),
      clone: () => mockResponse,
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

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

  it("should retry on 403 rateLimitExceeded", async () => {
    vi.useFakeTimers();
    const rateLimitBody = JSON.stringify({ error: { errors: [{ reason: "rateLimitExceeded" }] } });
    const mockRateLimited = {
      ok: false,
      status: 403,
      text: () => Promise.resolve(rateLimitBody),
      clone: () => mockRateLimited,
    };
    global.fetch = vi.fn()
      .mockResolvedValueOnce(mockRateLimited)
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: "gcal-event-456" }) });

    const task = createMockTask();
    const promise = createCalendarEvent("access-token", TEST_CALENDAR_ID, task);

    await vi.advanceTimersByTimeAsync(1500);

    const eventId = await promise;
    expect(eventId).toBe("gcal-event-456");
    expect(fetch).toHaveBeenCalledTimes(2);
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
    expect(result).toBe("not_found");
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
