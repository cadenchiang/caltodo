/**
 * Unit tests for nsfw-classify-server module.
 * Mocks nsfwjs and sharp to avoid real inference and image processing.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock sharp
const mockSharpPipeline = {
  removeAlpha: vi.fn().mockReturnThis(),
  raw: vi.fn().mockReturnThis(),
  toBuffer: vi.fn(),
};
const mockSharp = vi.fn(() => mockSharpPipeline);
vi.mock("sharp", () => ({ default: mockSharp }));

// Mock nsfwjs
const mockClassify = vi.fn();
vi.mock("nsfwjs", () => ({
  load: vi.fn().mockResolvedValue({ classify: mockClassify }),
}));

// Mock @tensorflow/tfjs
const mockDispose = vi.fn();
const mockTensor = { dispose: mockDispose };
vi.mock("@tensorflow/tfjs", () => ({
  tensor3d: vi.fn(() => mockTensor),
}));

// Mock logger to suppress output during tests
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("nsfw-classify-server", () => {
  beforeEach(() => {
    vi.resetModules();
    mockClassify.mockReset();
    mockDispose.mockClear();
    mockSharp.mockClear();
    mockSharpPipeline.toBuffer.mockReset();
    mockSharpPipeline.removeAlpha.mockClear();
    mockSharpPipeline.raw.mockClear();

    // Default sharp pipeline: 2x2 RGB image
    mockSharpPipeline.removeAlpha.mockReturnThis();
    mockSharpPipeline.raw.mockReturnThis();
    mockSharpPipeline.toBuffer.mockResolvedValue({
      data: Buffer.alloc(12), // 2x2x3 = 12 bytes
      info: { width: 2, height: 2, channels: 3 },
    });
  });

  it("returns isSensitive: false for a safe image", async () => {
    mockClassify.mockResolvedValue([
      { className: "Neutral", probability: 0.95 },
      { className: "Drawing", probability: 0.03 },
      { className: "Porn", probability: 0.01 },
      { className: "Hentai", probability: 0.005 },
      { className: "Sexy", probability: 0.005 },
    ]);

    const { classifyImageBuffer } = await import(
      "@/lib/nsfw-classify-server"
    );
    const result = await classifyImageBuffer(Buffer.from("fake-image"));

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

    const { classifyImageBuffer } = await import(
      "@/lib/nsfw-classify-server"
    );
    const result = await classifyImageBuffer(Buffer.from("fake-image"));

    expect(result.isSensitive).toBe(true);
    expect(result.nsfwScore).toBeCloseTo(0.6);
  });

  it("fails open when sharp throws an error", async () => {
    mockSharpPipeline.toBuffer.mockRejectedValue(new Error("Corrupt image"));

    const { classifyImageBuffer } = await import(
      "@/lib/nsfw-classify-server"
    );
    const result = await classifyImageBuffer(Buffer.from("bad-data"));

    expect(result.isSensitive).toBe(false);
    expect(result.nsfwScore).toBe(0);
    expect(result.predictions).toEqual([]);
  });

  it("fails open when model classify throws an error", async () => {
    mockClassify.mockRejectedValue(new Error("Model inference failed"));

    const { classifyImageBuffer } = await import(
      "@/lib/nsfw-classify-server"
    );
    const result = await classifyImageBuffer(Buffer.from("fake-image"));

    expect(result.isSensitive).toBe(false);
    expect(result.nsfwScore).toBe(0);
    expect(result.predictions).toEqual([]);
  });

  it("disposes tensor after successful classification", async () => {
    mockClassify.mockResolvedValue([
      { className: "Neutral", probability: 0.9 },
      { className: "Porn", probability: 0.05 },
      { className: "Hentai", probability: 0.05 },
    ]);

    const { classifyImageBuffer } = await import(
      "@/lib/nsfw-classify-server"
    );
    await classifyImageBuffer(Buffer.from("fake-image"));

    expect(mockDispose).toHaveBeenCalledTimes(1);
  });

  it("disposes tensor even when classify throws", async () => {
    mockClassify.mockRejectedValue(new Error("Inference error"));

    const { classifyImageBuffer } = await import(
      "@/lib/nsfw-classify-server"
    );
    await classifyImageBuffer(Buffer.from("fake-image"));

    expect(mockDispose).toHaveBeenCalledTimes(1);
  });
});
