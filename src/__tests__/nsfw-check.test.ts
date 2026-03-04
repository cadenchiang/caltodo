/**
 * Unit tests for nsfw-check client module.
 * Mocks fetch() to avoid real server calls.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("nsfw-check (client)", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  it("returns safe result for a safe image", async () => {
    const serverResult = {
      isSensitive: false,
      nsfwScore: 0.015,
      predictions: [
        { className: "Neutral", probability: 0.95 },
        { className: "Porn", probability: 0.01 },
        { className: "Hentai", probability: 0.005 },
      ],
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(serverResult),
    });

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "safe.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(false);
    expect(result.nsfwScore).toBeCloseTo(0.015);
    expect(result.predictions).toHaveLength(3);
  });

  it("returns sensitive result when server flags image", async () => {
    const serverResult = {
      isSensitive: true,
      nsfwScore: 0.6,
      predictions: [
        { className: "Porn", probability: 0.45 },
        { className: "Hentai", probability: 0.15 },
      ],
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(serverResult),
    });

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "nsfw.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(true);
    expect(result.nsfwScore).toBeCloseTo(0.6);
  });

  it("fails open on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(false);
    expect(result.nsfwScore).toBe(0);
    expect(result.predictions).toEqual([]);
  });

  it("fails open on non-200 server response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(false);
    expect(result.nsfwScore).toBe(0);
    expect(result.predictions).toEqual([]);
  });

  it("sends file as FormData to the correct endpoint", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ isSensitive: false, nsfwScore: 0, predictions: [] }),
    });

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File(["pixels"], "photo.png", { type: "image/png" });
    await classifyImage(file);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/nsfw-check");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("file")).toBe(file);
  });
});
