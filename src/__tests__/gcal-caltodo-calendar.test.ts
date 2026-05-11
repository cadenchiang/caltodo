/**
 * Tests for findOrCreateCaltodoCalendar in calendar-list.ts.
 *
 * Verifies:
 * - Returns existing calendar ID when a writable "caltodo" calendar exists
 * - Creates a new calendar when none exists
 * - Matches by summary case-insensitively + ignores reader-only calendars
 * - Returns null on Google API failure during create
 * - Returns null when the create response has no ID
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { findOrCreateCaltodoCalendar } from "@/lib/gcal/calendar-list";

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const TOKEN = "mock-token";
const LIST_URL = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
const CREATE_URL = "https://www.googleapis.com/calendar/v3/calendars";

function ok(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function fail(status: number, body = "error"): Response {
  return {
    ok: false,
    status,
    json: async () => ({ error: body }),
    text: async () => body,
  } as unknown as Response;
}

describe("findOrCreateCaltodoCalendar", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns the existing calendar ID when a writable 'caltodo' calendar already exists", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      ok({
        items: [
          { id: "other-id", summary: "Personal", accessRole: "owner", primary: true, backgroundColor: "#000" },
          { id: "caltodo-id", summary: "caltodo", accessRole: "owner", primary: false, backgroundColor: "#fff" },
        ],
      }),
    );

    const id = await findOrCreateCaltodoCalendar(TOKEN);
    expect(id).toBe("caltodo-id");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("matches the calendar summary case-insensitively and trims whitespace", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      ok({
        items: [
          { id: "match", summary: "  CalToDo  ", accessRole: "writer", primary: false, backgroundColor: "#fff" },
        ],
      }),
    );

    const id = await findOrCreateCaltodoCalendar(TOKEN);
    expect(id).toBe("match");
  });

  it("does NOT match read-only calendars even if the summary is 'caltodo'", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      ok({
        items: [
          { id: "read-only-caltodo", summary: "caltodo", accessRole: "reader", primary: false, backgroundColor: "#fff" },
        ],
      }),
    );
    // Since no writable match was found, it falls through to create.
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(ok({ id: "newly-created" }));

    const id = await findOrCreateCaltodoCalendar(TOKEN);
    expect(id).toBe("newly-created");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("creates a new 'caltodo' calendar when none exists", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(ok({ items: [] }));
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(ok({ id: "new-cal" }));

    const id = await findOrCreateCaltodoCalendar(TOKEN);
    expect(id).toBe("new-cal");

    const createCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[1];
    expect(createCall[0]).toBe(CREATE_URL);
    expect(createCall[1].method).toBe("POST");
    const sentBody = JSON.parse(createCall[1].body);
    expect(sentBody.summary).toBe("caltodo");
    expect(sentBody.description).toContain("caltodo");
    expect(typeof sentBody.timeZone).toBe("string");
  });

  it("returns null when create fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(ok({ items: [] }));
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(fail(500));

    const id = await findOrCreateCaltodoCalendar(TOKEN);
    expect(id).toBeNull();
  });

  it("returns null when create response omits the id field", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(ok({ items: [] }));
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(ok({})); // missing id

    const id = await findOrCreateCaltodoCalendar(TOKEN);
    expect(id).toBeNull();
  });

  it("calls list before create (sequence matters — never duplicate calendars)", async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(ok({ items: [] }));
    fetchMock.mockResolvedValueOnce(ok({ id: "new" }));

    await findOrCreateCaltodoCalendar(TOKEN);

    expect(fetchMock.mock.calls[0][0]).toBe(LIST_URL);
    expect(fetchMock.mock.calls[1][0]).toBe(CREATE_URL);
  });
});
