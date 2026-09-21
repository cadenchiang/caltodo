/**
 * Tests for board-layout-sync.ts — server save with retry and error callback.
 * Validates SaveResult return type, retry logic, and error handler invocation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  saveServerLayout,
  saveWithRetry,
  registerSaveErrorHandler,
  invalidateServerLayoutCache,
  fetchServerLayout,
  STALE_SAVE_MESSAGE,
} from "@/lib/board-layout-sync";
import { getKnownLayoutVersion, setKnownLayoutVersion } from "@/lib/board-layout-version";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const V1 = "2026-09-21T10:00:00.000Z";
const V2 = "2026-09-21T10:05:00.000Z";

/** A fetch Response stand-in. */
function response(status: number, body?: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

/** A successful PUT that returns the new version. */
const saved = (version: string) => response(200, { success: true, updatedAt: version });
/** A GET returning the row at the given version. */
const read = (version: string | null) => response(200, { layout: { widgets: [] }, updatedAt: version });

beforeEach(() => {
  vi.useFakeTimers();
  mockFetch.mockReset();
  registerSaveErrorHandler(null);
  invalidateServerLayoutCache();
  setKnownLayoutVersion(V1);
});

afterEach(() => {
  vi.useRealTimers();
});

const SAMPLE_DATA = { version: 10, widgets: [], layouts: {} };

/** The JSON body of the nth fetch call. */
function sentBody(call: number): Record<string, unknown> {
  return JSON.parse(mockFetch.mock.calls[call][1].body);
}

describe("fetchServerLayout", () => {
  it("records the server version every save is then based on", async () => {
    setKnownLayoutVersion(null);
    mockFetch.mockResolvedValueOnce(read(V1));
    await fetchServerLayout();
    expect(getKnownLayoutVersion()).toBe(V1);
  });
});

describe("saveServerLayout", () => {
  it("returns { ok: true } on successful save", async () => {
    mockFetch.mockResolvedValueOnce(saved(V2));
    const result = await saveServerLayout(SAMPLE_DATA);
    expect(result).toEqual({ ok: true });
  });

  it("sends the last known version with the layout (M10)", async () => {
    mockFetch.mockResolvedValueOnce(saved(V2));
    await saveServerLayout(SAMPLE_DATA);
    expect(sentBody(0)).toEqual({ ...SAMPLE_DATA, baseUpdatedAt: V1 });
  });

  it("adopts the version the server returns for the next save", async () => {
    mockFetch.mockResolvedValueOnce(saved(V2));
    await saveServerLayout(SAMPLE_DATA);
    expect(getKnownLayoutVersion()).toBe(V2);
  });

  it("flags a 409 as stale", async () => {
    mockFetch.mockResolvedValueOnce(response(409, { updatedAt: V2 }));
    const result = await saveServerLayout(SAMPLE_DATA);
    expect(result).toEqual({ ok: false, error: "HTTP 409", stale: true });
    // The base is only moved by a read, never by a refusal.
    expect(getKnownLayoutVersion()).toBe(V1);
  });

  it("returns { ok: false, error } on HTTP error", async () => {
    mockFetch.mockResolvedValueOnce(response(500));
    const result = await saveServerLayout(SAMPLE_DATA);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("HTTP 500");
    expect(result.stale).toBe(false);
  });

  it("returns { ok: false, error } on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));
    const result = await saveServerLayout(SAMPLE_DATA);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Failed to fetch");
  });
});

describe("saveWithRetry", () => {
  it("does not retry on first success", async () => {
    mockFetch.mockResolvedValueOnce(saved(V2));
    await saveWithRetry(SAMPLE_DATA);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("re-reads the server row before retrying, then retries on the same version (M10)", async () => {
    mockFetch.mockResolvedValueOnce(response(500)); // PUT
    mockFetch.mockResolvedValueOnce(read(V1)); // GET: unchanged
    mockFetch.mockResolvedValueOnce(saved(V2)); // PUT retry

    const promise = saveWithRetry(SAMPLE_DATA);
    // First call happens immediately, then 2s delay before retry
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch.mock.calls[1][0]).toBe("/api/board-layout");
    expect(mockFetch.mock.calls[1][1]).toBeUndefined();
    expect(sentBody(2).baseUpdatedAt).toBe(V1);
  });

  it("drops the retry when the server moved on, so it cannot overwrite the newer save (M10)", async () => {
    const errorHandler = vi.fn();
    registerSaveErrorHandler(errorHandler);
    mockFetch.mockResolvedValueOnce(response(409, { updatedAt: V2 })); // PUT: stale
    mockFetch.mockResolvedValueOnce(read(V2)); // GET: another device saved

    const promise = saveWithRetry(SAMPLE_DATA);
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(errorHandler).toHaveBeenCalledWith(STALE_SAVE_MESSAGE);
    // The next save is based on what is actually on the server now.
    expect(getKnownLayoutVersion()).toBe(V2);
  });

  it("invokes error handler after both attempts fail", async () => {
    const errorHandler = vi.fn();
    registerSaveErrorHandler(errorHandler);

    mockFetch.mockResolvedValueOnce(response(500));
    mockFetch.mockResolvedValueOnce(read(V1));
    mockFetch.mockResolvedValueOnce(response(503));

    const promise = saveWithRetry(SAMPLE_DATA);
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledWith("HTTP 503");
  });

  it("still retries when the re-read itself fails", async () => {
    mockFetch.mockResolvedValueOnce(response(500));
    mockFetch.mockRejectedValueOnce(new Error("offline"));
    mockFetch.mockResolvedValueOnce(saved(V2));

    const promise = saveWithRetry(SAMPLE_DATA);
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("does not invoke error handler if none is registered", async () => {
    mockFetch.mockResolvedValueOnce(response(500));
    mockFetch.mockResolvedValueOnce(read(V1));
    mockFetch.mockResolvedValueOnce(response(500));

    const promise = saveWithRetry(SAMPLE_DATA);
    await vi.advanceTimersByTimeAsync(2000);
    // Should not throw even with no handler
    await expect(promise).resolves.toBeUndefined();
  });
});

describe("registerSaveErrorHandler", () => {
  it("clears handler when passed null", async () => {
    const handler = vi.fn();
    registerSaveErrorHandler(handler);
    registerSaveErrorHandler(null);

    mockFetch.mockResolvedValueOnce(response(500));
    mockFetch.mockResolvedValueOnce(read(V1));
    mockFetch.mockResolvedValueOnce(response(500));

    const promise = saveWithRetry(SAMPLE_DATA);
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(handler).not.toHaveBeenCalled();
  });
});
