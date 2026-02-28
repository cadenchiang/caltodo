/**
 * Client-side image compression using the browser Canvas API.
 * Compresses JPEG/PNG/WebP to JPEG at configurable quality,
 * capped at a max dimension to reduce storage costs.
 *
 * No external dependencies — uses only browser-native APIs.
 */

/** Configuration options for image compression. */
interface CompressOptions {
  /** Maximum width or height in pixels. Default: 1200. */
  maxDimension?: number;
  /** JPEG quality from 0 to 1. Default: 0.75. */
  quality?: number;
  /** Files smaller than this (bytes) are returned unchanged. Default: 153600 (150KB). */
  skipBelowBytes?: number;
}

const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Compresses an image file using the browser Canvas API.
 *
 * - Skips GIFs (would lose animation), PDFs, and non-image files.
 * - Skips files already under `skipBelowBytes` (default 150 KB).
 * - Re-encodes as JPEG at the given quality and max dimension.
 *
 * @param file - The File to compress.
 * @param opts - Optional compression settings.
 * @returns A compressed File (JPEG), or the original if skipped.
 */
export async function compressImage(
  file: File,
  opts?: CompressOptions,
): Promise<File> {
  const maxDim = opts?.maxDimension ?? 1200;
  const quality = opts?.quality ?? 0.75;
  const skipBelow = opts?.skipBelowBytes ?? 153_600;

  // Pass through non-compressible types (GIF, PDF, non-images)
  if (!COMPRESSIBLE_TYPES.has(file.type)) {
    return file;
  }

  // Skip tiny files — re-encoding adds overhead with no benefit
  if (file.size <= skipBelow) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Calculate scaled dimensions preserving aspect ratio
  let targetW = width;
  let targetH = height;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    targetW = Math.round(width * ratio);
    targetH = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // Fallback: return original if canvas context unavailable
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });

  // Derive new filename with .jpg extension
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
