import { describe, it, expect, vi, beforeEach } from "vitest";
import { compressImage } from "@/lib/compress-image";

/**
 * Unit tests for compressImage.
 *
 * Uses mocked browser APIs (createImageBitmap, OffscreenCanvas)
 * since Vitest runs in a Node-like environment.
 */

// --- Mocks for browser APIs ---

const mockClose = vi.fn();
const mockDrawImage = vi.fn();
const mockConvertToBlob = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();

  // Mock createImageBitmap
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width: 2000, height: 1500, close: mockClose }),
  );

  // Mock OffscreenCanvas
  vi.stubGlobal(
    "OffscreenCanvas",
    vi.fn().mockImplementation(() => ({
      getContext: () => ({ drawImage: mockDrawImage }),
      convertToBlob: mockConvertToBlob.mockResolvedValue(
        new Blob(["compressed"], { type: "image/jpeg" }),
      ),
    })),
  );
});

function createFile(
  name: string,
  type: string,
  sizeBytes: number,
): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

describe("compressImage", () => {
  it("returns GIF files unchanged", async () => {
    const gif = createFile("animation.gif", "image/gif", 500_000);
    const result = await compressImage(gif);
    expect(result).toBe(gif);
  });

  it("returns PDF files unchanged", async () => {
    const pdf = createFile("doc.pdf", "application/pdf", 500_000);
    const result = await compressImage(pdf);
    expect(result).toBe(pdf);
  });

  it("returns non-image files unchanged", async () => {
    const txt = createFile("notes.txt", "text/plain", 500_000);
    const result = await compressImage(txt);
    expect(result).toBe(txt);
  });

  it("returns small images (<150KB) unchanged", async () => {
    const small = createFile("tiny.png", "image/png", 100_000);
    const result = await compressImage(small);
    expect(result).toBe(small);
  });

  it("compresses large JPEG and returns image/jpeg File", async () => {
    const large = createFile("photo.jpg", "image/jpeg", 5_000_000);
    const result = await compressImage(large);

    expect(result).not.toBe(large);
    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("photo.jpg");
  });

  it("compresses large PNG and changes extension to .jpg", async () => {
    const large = createFile("screenshot.png", "image/png", 3_000_000);
    const result = await compressImage(large);

    expect(result).not.toBe(large);
    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("screenshot.jpg");
  });

  it("compresses large WebP and changes extension to .jpg", async () => {
    const large = createFile("image.webp", "image/webp", 2_000_000);
    const result = await compressImage(large);

    expect(result).not.toBe(large);
    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("image.jpg");
  });

  it("scales down images exceeding maxDimension", async () => {
    const large = createFile("big.jpg", "image/jpeg", 5_000_000);
    await compressImage(large, { maxDimension: 800 });

    // OffscreenCanvas should be created with scaled dimensions
    // Original: 2000x1500, ratio = 800/2000 = 0.4 → 800x600
    const OffscreenCanvasMock = vi.mocked(OffscreenCanvas);
    expect(OffscreenCanvasMock).toHaveBeenCalledWith(800, 600);
  });

  it("respects custom quality option", async () => {
    const large = createFile("photo.jpg", "image/jpeg", 5_000_000);
    await compressImage(large, { quality: 0.5 });

    expect(mockConvertToBlob).toHaveBeenCalledWith({
      type: "image/jpeg",
      quality: 0.5,
    });
  });

  it("cleans up ImageBitmap after compression", async () => {
    const large = createFile("photo.jpg", "image/jpeg", 5_000_000);
    await compressImage(large);

    expect(mockClose).toHaveBeenCalled();
  });
});
