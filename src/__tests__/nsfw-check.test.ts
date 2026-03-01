/**
 * Unit tests for nsfw-check utility.
 * Mocks nsfwjs to avoid real TensorFlow inference.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock nsfwjs module
vi.mock("nsfwjs", () => ({
  load: vi.fn(),
}));

// Mock browser APIs not available in Node
const mockRevokeObjectURL = vi.fn();
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");

vi.stubGlobal("URL", {
  ...URL,
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

vi.stubGlobal("Image", class {
  onload: (() => void) | null = null;
  onerror: ((err: unknown) => void) | null = null;
  private _src = "";
  get src() { return this._src; }
  set src(val: string) {
    this._src = val;
    // Simulate async image load
    setTimeout(() => this.onload?.(), 0);
  }
});

describe("nsfw-check", () => {
  let mockClassify: Mock;
  let nsfwjs: { load: Mock };

  beforeEach(async () => {
    vi.resetModules();
    mockClassify = vi.fn();
    nsfwjs = await import("nsfwjs") as unknown as { load: Mock };
    nsfwjs.load.mockClear();
    nsfwjs.load.mockResolvedValue({ classify: mockClassify });
    mockRevokeObjectURL.mockClear();
    mockCreateObjectURL.mockClear();
  });

  it("returns isSensitive: false for a safe image with high Neutral score", async () => {
    mockClassify.mockResolvedValue([
      { className: "Neutral", probability: 0.95 },
      { className: "Drawing", probability: 0.03 },
      { className: "Porn", probability: 0.01 },
      { className: "Hentai", probability: 0.005 },
      { className: "Sexy", probability: 0.005 },
    ]);

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "safe.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(false);
    expect(result.nsfwScore).toBeCloseTo(0.015);
    expect(result.predictions).toHaveLength(5);
  });

  it("returns isSensitive: true when Porn + Hentai > 0.5", async () => {
    mockClassify.mockResolvedValue([
      { className: "Neutral", probability: 0.1 },
      { className: "Drawing", probability: 0.1 },
      { className: "Porn", probability: 0.45 },
      { className: "Hentai", probability: 0.15 },
      { className: "Sexy", probability: 0.2 },
    ]);

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "nsfw.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(true);
    expect(result.nsfwScore).toBeCloseTo(0.6);
  });

  it("returns isSensitive: true when Hentai alone > 0.5", async () => {
    mockClassify.mockResolvedValue([
      { className: "Neutral", probability: 0.1 },
      { className: "Drawing", probability: 0.1 },
      { className: "Porn", probability: 0.05 },
      { className: "Hentai", probability: 0.55 },
      { className: "Sexy", probability: 0.2 },
    ]);

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "hentai.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(true);
    expect(result.nsfwScore).toBeCloseTo(0.6);
  });

  it("returns isSensitive: false when Porn + Hentai is exactly 0.5 (strictly greater than)", async () => {
    mockClassify.mockResolvedValue([
      { className: "Neutral", probability: 0.3 },
      { className: "Drawing", probability: 0.1 },
      { className: "Porn", probability: 0.3 },
      { className: "Hentai", probability: 0.2 },
      { className: "Sexy", probability: 0.1 },
    ]);

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "edge.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(false);
    expect(result.nsfwScore).toBeCloseTo(0.5);
  });

  it("returns same model promise on concurrent getModel() calls (singleton)", async () => {
    const { getModel } = await import("@/lib/nsfw-check");
    const p1 = getModel();
    const p2 = getModel();

    // Both calls return the exact same promise reference (singleton)
    expect(p1).toBe(p2);
    // Both resolve to the same model instance
    const m1 = await p1;
    const m2 = await p2;
    expect(m1).toBe(m2);
  });

  it("fails open: returns isSensitive: false when model loading fails", async () => {
    vi.resetModules();
    const nsfwjsFailing = await import("nsfwjs") as unknown as { load: Mock };
    nsfwjsFailing.load.mockRejectedValue(new Error("Network error"));

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const result = await classifyImage(file);

    expect(result.isSensitive).toBe(false);
    expect(result.nsfwScore).toBe(0);
    expect(result.predictions).toEqual([]);
  });

  it("revokes object URL after classification", async () => {
    mockClassify.mockResolvedValue([
      { className: "Neutral", probability: 0.9 },
      { className: "Drawing", probability: 0.05 },
      { className: "Porn", probability: 0.02 },
      { className: "Hentai", probability: 0.02 },
      { className: "Sexy", probability: 0.01 },
    ]);

    const { classifyImage } = await import("@/lib/nsfw-check");
    const file = new File([""], "cleanup.jpg", { type: "image/jpeg" });
    await classifyImage(file);

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
