/**
 * Tests for H19: disconnect must only report success on res.ok, and the
 * credentials refresh after a connect/disconnect must bypass the 30s cache.
 *
 * The project has no React render harness, so the component contract is
 * checked at the source level (as server-preload.test.ts does), while the
 * cache bypass is exercised for real against credentials-client.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("credentials-client cache bypass", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
  });

  it("serves the cached snapshot within the TTL unless force is passed", async () => {
    const { getCredentials } = await import("@/lib/credentials-client");
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ has_google_calendar: true }) });

    await getCredentials();
    await getCredentials();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ has_google_calendar: false }) });
    const fresh = await getCredentials(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fresh).toEqual({ has_google_calendar: false });
  });
});

describe("IntegrationProvider.refresh", () => {
  const src = read("src/components/settings/IntegrationSettings.tsx");

  it("forwards force to the shared credentials client", () => {
    expect(src).toContain("getCredentials(force)");
    expect(src).toMatch(/const refresh = useCallback\(\(\) => fetchCredentials\(true\)/);
  });

  it("forces a refetch on change signals", () => {
    expect(src).toMatch(/const refresh = \(\) => fetchCredentials\(true\);/);
  });
});

describe("GoogleCalendarSettings.handleDisconnect", () => {
  const src = read("src/components/settings/GoogleCalendarSettings.tsx");
  const body = src.slice(src.indexOf("async function handleDisconnect"), src.indexOf("async function handleReconnect"));

  it("checks the response status before clearing local state", () => {
    expect(body).toContain('const res = await fetch("/api/gcal/disconnect"');
    expect(body.indexOf("if (!res.ok)")).toBeGreaterThan(-1);
    expect(body.indexOf("if (!res.ok)")).toBeLessThan(body.indexOf("localStorage.removeItem(GCAL_CACHE_KEY)"));
    expect(body.indexOf("if (!res.ok)")).toBeLessThan(body.indexOf("await refresh()"));
  });

  it("returns without the success toast on a failed disconnect", () => {
    const failBranch = body.slice(body.indexOf("if (!res.ok)"), body.indexOf("localStorage.removeItem"));
    expect(failBranch).toContain("return;");
    expect(failBranch).not.toContain("disconnected.");
  });
});
