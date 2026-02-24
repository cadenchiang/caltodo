/**
 * Tests for Google Calendar attendee management functions.
 * Validates add/remove attendee behavior including error handling.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { addAttendeeToEvent, removeAttendeeFromEvent } from "@/lib/gcal/calendar-attendees";

// Mock logger to prevent console output during tests
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const TOKEN = "fake-access-token";
const CALENDAR_ID = "cal-123";
const EVENT_ID = "evt-456";
const EMAIL = "classmate@example.com";

/** Creates a mock Response with JSON body. */
function mockJsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as unknown as Response;
}

/** Creates a mock Response with text body for errors. */
function mockErrorResponse(body: string, status: number): Response {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("addAttendeeToEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should add attendee to event with no existing attendees", async () => {
    const fetchMock = vi.fn()
      // GET event — no existing attendees
      .mockResolvedValueOnce(mockJsonResponse({ attendees: [] }))
      // PATCH event — success
      .mockResolvedValueOnce(mockJsonResponse({ id: EVENT_ID }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await addAttendeeToEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Verify PATCH body includes the new attendee
    const patchCall = fetchMock.mock.calls[1];
    const patchBody = JSON.parse(patchCall[1].body);
    expect(patchBody.attendees).toEqual([
      { email: EMAIL, responseStatus: "needsAction" },
    ]);

    // Verify sendUpdates=all is in the URL
    expect(patchCall[0]).toContain("sendUpdates=all");
  });

  it("should append attendee to existing attendees list", async () => {
    const existingAttendees = [
      { email: "existing@example.com", responseStatus: "accepted" },
    ];

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({ attendees: existingAttendees }))
      .mockResolvedValueOnce(mockJsonResponse({ id: EVENT_ID }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await addAttendeeToEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(true);
    const patchBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(patchBody.attendees).toHaveLength(2);
    expect(patchBody.attendees[0].email).toBe("existing@example.com");
    expect(patchBody.attendees[1].email).toBe(EMAIL);
  });

  it("should return false when GET event fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockErrorResponse("Not Found", 404));

    vi.stubGlobal("fetch", fetchMock);

    const result = await addAttendeeToEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should return false when PATCH fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({ attendees: [] }))
      .mockResolvedValueOnce(mockErrorResponse("Forbidden", 403));

    vi.stubGlobal("fetch", fetchMock);

    const result = await addAttendeeToEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(false);
  });

  it("should handle event with undefined attendees field", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({}))
      .mockResolvedValueOnce(mockJsonResponse({ id: EVENT_ID }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await addAttendeeToEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(true);
    const patchBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(patchBody.attendees).toHaveLength(1);
  });
});

describe("removeAttendeeFromEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should remove attendee from event", async () => {
    const existingAttendees = [
      { email: EMAIL, responseStatus: "accepted" },
      { email: "other@example.com", responseStatus: "accepted" },
    ];

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({ attendees: existingAttendees }))
      .mockResolvedValueOnce(mockJsonResponse({ id: EVENT_ID }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await removeAttendeeFromEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(true);
    const patchBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(patchBody.attendees).toHaveLength(1);
    expect(patchBody.attendees[0].email).toBe("other@example.com");
  });

  it("should handle case-insensitive email matching", async () => {
    const existingAttendees = [
      { email: "Classmate@Example.COM", responseStatus: "accepted" },
    ];

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({ attendees: existingAttendees }))
      .mockResolvedValueOnce(mockJsonResponse({ id: EVENT_ID }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await removeAttendeeFromEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(true);
    const patchBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(patchBody.attendees).toHaveLength(0);
  });

  it("should succeed even when attendee not in list", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({ attendees: [{ email: "other@example.com" }] }))
      .mockResolvedValueOnce(mockJsonResponse({ id: EVENT_ID }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await removeAttendeeFromEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(true);
  });

  it("should return false when GET event fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockErrorResponse("Gone", 410));

    vi.stubGlobal("fetch", fetchMock);

    const result = await removeAttendeeFromEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(false);
  });

  it("should return false when PATCH fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({ attendees: [] }))
      .mockResolvedValueOnce(mockErrorResponse("Internal Server Error", 500));

    vi.stubGlobal("fetch", fetchMock);

    const result = await removeAttendeeFromEvent(TOKEN, CALENDAR_ID, EVENT_ID, EMAIL);

    expect(result).toBe(false);
  });
});
