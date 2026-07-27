import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { reportSyncFailures } from "@/lib/integration-alerts";
import type { SyncResult } from "@/lib/types";

/** Builds a SyncResult carrying the given errors on one source. */
function resultWith(source: "canvas" | "gradescope", errors: string[]): SyncResult {
  const empty = { synced: 0, errors: [] as string[] };
  return {
    canvas: source === "canvas" ? { synced: 0, errors } : { ...empty },
    gradescope: source === "gradescope" ? { synced: 0, errors } : { ...empty },
    pensieve: { ...empty },
    brightspace: { ...empty },
  } as unknown as SyncResult;
}

/** Subject lines of the alert emails sent during a call. */
function subjectsSent(fetchMock: ReturnType<typeof vi.fn>): string[] {
  return fetchMock.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string).subject);
}

describe("reportSyncFailures classification", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let uniqueUser = 0;

  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    // The module throttles per (user, source, error) for 6h at module scope,
    // so every case needs its own user id.
    uniqueUser++;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
  });

  it("does not email a Canvas 401, which is the user's expired token", async () => {
    // The exact production message. It contains none of "auth", "token
    // expired", "reconnect", "login failed" or "password", so the word-list
    // classifier mailed it out as integration breakage.
    await reportSyncFailures(
      resultWith("canvas", [
        "Canvas (berkeley): Canvas returned 401 for course 1553118",
        "Canvas (instructure): Canvas returned 401 for course 175581",
      ]),
      `user-401-${uniqueUser}`,
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not email a 403 either", async () => {
    await reportSyncFailures(
      resultWith("canvas", ["Canvas returned 403 for course 42"]),
      `user-403-${uniqueUser}`,
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still emails genuine breakage", async () => {
    // A scraper/parser failure is the maintainer's problem and must survive
    // the filter — the whole point of the alerting.
    await reportSyncFailures(
      resultWith("gradescope", ["Gradescope HTML structure changed: 0 assignments parsed"]),
      `user-real-${uniqueUser}`,
    );

    expect(subjectsSent(fetchMock)).toEqual(["[caltodo] gradescope sync failed"]);
  });

  it("emails only the genuine errors when a source reports both kinds", async () => {
    await reportSyncFailures(
      resultWith("canvas", [
        "Canvas returned 401 for course 1",
        "Canvas API error: 500 Internal Server Error",
      ]),
      `user-mixed-${uniqueUser}`,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string).text as string;
    expect(body).toContain("500 Internal Server Error");
    expect(body).not.toContain("401");
  });
});
