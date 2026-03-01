/**
 * Canvas-based dominant color extraction from images.
 * Zero external dependencies — uses only the browser Canvas API.
 *
 * Loads an image onto a small canvas, samples pixel data,
 * quantizes into ~5 dominant distinct colors, and filters
 * near-white/near-black values.
 *
 * @module extract-palette
 */

/** Minimum distance between two colors (in RGB space) to be considered distinct. */
const MIN_COLOR_DISTANCE = 60;

/** Lightness thresholds to filter boring near-white and near-black colors. */
const MIN_LIGHTNESS = 25;
const MAX_LIGHTNESS = 230;

/** Target number of palette colors to return. */
const TARGET_COLORS = 5;

/** Downscaled canvas size for fast pixel sampling. */
const SAMPLE_SIZE = 100;

/**
 * Converts RGB values to a hex color string.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns Hex color string (e.g. "#3b82f6")
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.round(c).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Computes Euclidean distance between two RGB colors.
 *
 * @param a - First color as [r, g, b]
 * @param b - Second color as [r, g, b]
 * @returns Distance in RGB space (0-441)
 */
export function colorDistance(
  a: [number, number, number],
  b: [number, number, number]
): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

/**
 * Checks if a color is "boring" (near-white or near-black).
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns True if the color should be filtered out
 */
export function isBoringColor(r: number, g: number, b: number): boolean {
  const avg = (r + g + b) / 3;
  return avg < MIN_LIGHTNESS || avg > MAX_LIGHTNESS;
}

/**
 * Simple k-means-style quantization of pixel data into dominant color buckets.
 * Groups similar pixels, then returns the top N bucket centroids by frequency.
 *
 * @param pixels - Flat RGBA pixel array from getImageData
 * @param count - Target number of colors to return
 * @returns Array of [r, g, b] tuples sorted by frequency (descending)
 */
export function quantizePixels(
  pixels: Uint8ClampedArray,
  count: number
): [number, number, number][] {
  // Step 1: Build frequency buckets by rounding to nearest 8 (reduces noise)
  const buckets = new Map<string, { sum: [number, number, number]; count: number }>();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Skip boring colors
    if (isBoringColor(r, g, b)) continue;

    // Round to reduce noise and group similar colors
    const kr = Math.round(r / 8) * 8;
    const kg = Math.round(g / 8) * 8;
    const kb = Math.round(b / 8) * 8;
    const key = `${kr},${kg},${kb}`;

    const existing = buckets.get(key);
    if (existing) {
      existing.sum[0] += r;
      existing.sum[1] += g;
      existing.sum[2] += b;
      existing.count += 1;
    } else {
      buckets.set(key, { sum: [r, g, b], count: 1 });
    }
  }

  // Step 2: Sort buckets by frequency (most common first)
  const sorted = Array.from(buckets.values())
    .sort((a, b) => b.count - a.count);

  // Step 3: Pick top colors that are distinct from each other
  const result: [number, number, number][] = [];

  for (const bucket of sorted) {
    if (result.length >= count) break;

    const avg: [number, number, number] = [
      Math.round(bucket.sum[0] / bucket.count),
      Math.round(bucket.sum[1] / bucket.count),
      Math.round(bucket.sum[2] / bucket.count),
    ];

    // Ensure this color is distinct from all already-selected colors
    const tooSimilar = result.some(
      (existing) => colorDistance(existing, avg) < MIN_COLOR_DISTANCE
    );
    if (!tooSimilar) {
      result.push(avg);
    }
  }

  return result;
}

/**
 * Extracts a palette of dominant colors from an image URL.
 * Uses a small offscreen canvas for fast pixel sampling.
 *
 * @param imageUrl - URL of the image to analyze (must be CORS-accessible or same-origin)
 * @param count - Number of palette colors to extract (default: 5)
 * @returns Promise resolving to an array of hex color strings
 *
 * @example
 * const colors = await extractPalette("https://example.com/photo.jpg");
 * // => ["#3b82f6", "#f59e0b", "#10b981", "#6366f1", "#ef4444"]
 */
export async function extractPalette(
  imageUrl: string,
  count: number = TARGET_COLORS
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve([]);
          return;
        }

        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const colors = quantizePixels(imageData.data, count);
        resolve(colors.map(([r, g, b]) => rgbToHex(r, g, b)));
      } catch (err) {
        console.error("[extract-palette] Failed to extract colors:", err);
        resolve([]);
      }
    };

    img.onerror = () => {
      console.error("[extract-palette] Failed to load image:", imageUrl);
      resolve([]);
    };

    img.src = imageUrl;
  });
}
