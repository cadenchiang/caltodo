/**
 * Tests for board-layout-sync.ts — server save with retry and error callback.
 * Validates SaveResult return type, retry logic, and error handler invocation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  saveServerLayout,
  saveWithRetry,
  registerSaveErrorHandler,
} from "@/lib/board-layout-sync";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.useFakeTimers();
  mockFetch.mockReset();
  registerSaveErrorHandler(null);
});

afterEach(() => {
  vi.useRealTimers();
});

const SAMPLE_DATA = { version: 10, widgets: [], layouts: {} };

describe("saveServerLayout", () => {
  it("returns { ok: true } on successful save", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const result = await saveServerLayout(SAMPLE_DATA);
    expect(result).toEqual({ ok: true });
  });

  it("returns { ok: false, error } on HTTP error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const result = await saveServerLayout(SAMPLE_DATA);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("HTTP 500");
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
    mockFetch.mockResolvedValueOnce({ ok: true });
    await saveWithRetry(SAMPLE_DATA);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries once after failure and succeeds", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mockFetch.mockResolvedValueOnce({ ok: true });

    const promise = saveWithRetry(SAMPLE_DATA);
    // First call happens immediately, then 2s delay before retry
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("invokes error handler after both attempts fail", async () => {
    const errorHandler = vi.fn();
    registerSaveErrorHandler(errorHandler);

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const promise = saveWithRetry(SAMPLE_DATA);
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledWith("HTTP 503");
  });

  it("does not invoke error handler if none is registered", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

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

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const promise = saveWithRetry(SAMPLE_DATA);
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(handler).not.toHaveBeenCalled();
  });
});
