/**
 * Client-side NSFW image classification via server API.
 * Sends the image to /api/nsfw-check and returns the result.
 * Fail-open: on any error (network, server), images are treated as safe
 * so legitimate uploads are never blocked.
 *
 * @module nsfw-check
 */

/**
 * Result of NSFW classification for a single image.
 *
 * @property isSensitive - true if combined Porn + Hentai probability > 0.5
 * @property nsfwScore - Combined Porn + Hentai probability (0-1)
 * @property predictions - Raw nsfwjs prediction array
 */
export interface NsfwResult {
  isSensitive: boolean;
  nsfwScore: number;
  predictions: Array<{ className: string; probability: number }>;
}

/** Safe fallback returned when classification fails (fail-open). */
const SAFE_FALLBACK: NsfwResult = {
  isSensitive: false,
  nsfwScore: 0,
  predictions: [],
};

/**
 * Classifies an image file for NSFW content by sending it to the server.
 * Fail-open: returns { isSensitive: false } on any error.
 *
 * @param file - The image File to classify
 * @returns NsfwResult with sensitivity flag and scores
 */
export async function classifyImage(file: File): Promise<NsfwResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/nsfw-check", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(
        `[nsfw-check] Server returned ${response.status}, failing open`
      );
      return SAFE_FALLBACK;
    }

    const result: NsfwResult = await response.json();
    return result;
  } catch (error) {
    console.error("[nsfw-check] Classification failed, failing open:", error);
    return SAFE_FALLBACK;
  }
}
