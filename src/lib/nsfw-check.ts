/**
 * Client-side NSFW image classification using nsfwjs (TensorFlow.js).
 * Lazy-loads the model on first use (~5MB). Fail-open: on any error,
 * images are treated as safe so legitimate uploads are never blocked.
 */

import type * as nsfwjsModule from "nsfwjs";

/**
 * Result of NSFW classification for a single image.
 *
 * @property isSensitive - true if combined Porn + Hentai probability > 0.5
 * @property nsfwScore - Combined Porn + Hentai probability (0–1)
 * @property predictions - Raw nsfwjs prediction array
 */
export interface NsfwResult {
  isSensitive: boolean;
  nsfwScore: number;
  predictions: Array<{ className: string; probability: number }>;
}

/** Threshold: flag as sensitive if Porn + Hentai combined > this value. */
const SENSITIVITY_THRESHOLD = 0.5;

/** Singleton promise for the loaded nsfwjs model. */
let modelPromise: Promise<nsfwjsModule.NSFWJS> | null = null;

/**
 * Returns the singleton nsfwjs model, loading it on first call.
 * Subsequent calls return the same promise.
 *
 * @returns Promise resolving to the loaded NSFWJS model
 */
export function getModel(): Promise<nsfwjsModule.NSFWJS> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const nsfwjs = await import("nsfwjs");
      return nsfwjs.load("MobileNetV2");
    })();
  }
  return modelPromise;
}

/**
 * Classifies an image file for NSFW content.
 * Creates a temporary HTMLImageElement, runs the model, and cleans up.
 * Fail-open: returns { isSensitive: false } on any error.
 *
 * @param file - The image File to classify
 * @returns NsfwResult with sensitivity flag and scores
 */
export async function classifyImage(file: File): Promise<NsfwResult> {
  try {
    const model = await getModel();
    const url = URL.createObjectURL(file);

    try {
      const img = await loadImage(url);
      const predictions = await model.classify(img);

      const pornScore = predictions.find((p) => p.className === "Porn")?.probability ?? 0;
      const hentaiScore = predictions.find((p) => p.className === "Hentai")?.probability ?? 0;
      const nsfwScore = pornScore + hentaiScore;

      return {
        isSensitive: nsfwScore > SENSITIVITY_THRESHOLD,
        nsfwScore,
        predictions: predictions.map((p) => ({
          className: p.className,
          probability: p.probability,
        })),
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("[nsfw-check] Classification failed, failing open:", error);
    return { isSensitive: false, nsfwScore: 0, predictions: [] };
  }
}

/**
 * Loads an image from a URL into an HTMLImageElement.
 *
 * @param src - The image source URL (typically a blob URL)
 * @returns Promise resolving to the loaded HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
