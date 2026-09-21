/**
 * Tests for the shared calendar-feed fetch.
 *
 * Audit L6: feed fetches followed redirects, so the SSRF allowlist only
 * ever saw the submitted URL. Audit M7: a 15s per-request timeout let one
 * slow feed eat the sync function's budget.
 */

import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { fetchFeedCalendar, FEED_FETCH_TIMEOUT_MS } from "@/lib/feed-fetch";
import { fetchCanvasICalAssignments } from "@/lib/canvas-ical-client";
import { fetchPensieveAssignments } from "@/lib/pensieve-client";
import { fetchBrightspaceAssignments } from "@/lib/brightspace-client";
import { fetchBlackboardAssignments } from "@/lib/blackboard-client";

const OPTIONS = {
  name: "Canvas",
  failurePrefix: "Canvas iCal fetch failed",
  notCalendarMessage: "not a calendar",
};

const ICS = "BEGIN:VCALENDAR\nEND:VCALENDAR";

function stubFetch(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue({ type: "basic", ...response });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchFeedCalendar", () => {
  it("never follows redirects", async () => {
    const fetchMock = stubFetch({ ok: true, status: 200, text: async () => ICS });

    await fetchFeedCalendar("https://a.edu/f.ics", OPTIONS);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://a.edu/f.ics",
      expect.objectContaining({ redirect: "manual" })
    );
  });

  it.each([301, 302, 303, 307, 308])("treats a %s as a failure asking for the final URL", async (status) => {
    stubFetch({ ok: false, status, text: async () => "" });

    await expect(fetchFeedCalendar("https://a.edu/f.ics", OPTIONS)).rejects.toThrow(
      "Canvas feed URL redirected; paste the final URL into Settings."
    );
  });

  it("treats an opaque redirect the same way", async () => {
    stubFetch({ ok: false, status: 0, type: "opaqueredirect", text: async () => "" });

    await expect(fetchFeedCalendar("https://a.edu/f.ics", OPTIONS)).rejects.toThrow(/redirected/);
  });

  it("keeps the provider's non-OK message shape", async () => {
    stubFetch({ ok: false, status: 404, text: async () => "" });

    await expect(fetchFeedCalendar("https://a.edu/f.ics", OPTIONS)).rejects.toThrow(
      "Canvas iCal fetch failed: 404"
    );
  });

  it("rejects a 200 that is not a calendar", async () => {
    stubFetch({ ok: true, status: 200, text: async () => "<html>login</html>" });

    await expect(fetchFeedCalendar("https://a.edu/f.ics", OPTIONS)).rejects.toThrow("not a calendar");
  });

  it("returns the body of a good feed", async () => {
    stubFetch({ ok: true, status: 200, text: async () => ICS });

    expect(await fetchFeedCalendar("https://a.edu/f.ics", OPTIONS)).toBe(ICS);
  });

  it("uses a per-request timeout well inside the 60s sync budget", () => {
    expect(FEED_FETCH_TIMEOUT_MS).toBeLessThanOrEqual(10_000);
  });
});

describe("every feed client fetches through the shared helper", () => {
  const clients: Array<[string, (url: string) => Promise<unknown>, RegExp]> = [
    ["Canvas", fetchCanvasICalAssignments, /Canvas feed URL redirected/],
    ["Pensieve", fetchPensieveAssignments, /Pensieve feed URL redirected/],
    ["Brightspace", fetchBrightspaceAssignments, /Brightspace feed URL redirected/],
    ["Blackboard", fetchBlackboardAssignments, /Blackboard feed URL redirected/],
  ];

  it.each(clients)("%s refuses a redirecting feed", async (_name, fetcher, message) => {
    const fetchMock = stubFetch({ ok: false, status: 302, text: async () => "" });

    await expect(fetcher("https://a.edu/f.ics")).rejects.toThrow(message);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: "manual" });
  });
});
