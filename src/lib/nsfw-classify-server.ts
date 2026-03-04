/**
 * Server-side NSFW image classification using nsfwjs + sharp.
 * Decodes images to raw RGB pixels via sharp, then classifies with nsfwjs.
 * Singleton model pattern — loaded once per process.
 * Fail-open: on any error, images are treated as safe.
 *
 * @module nsfw-classify-server
 */

import { logger } from "@/lib/logger";

/** Result of NSFW classification for a single image. */
export interface NsfwResult {
  isSensitive: boolean;
  nsfwScore: number;
  predictions: Array<{ className: string; probability: number }>;
}

/** Threshold: flag as sensitive if Porn + Hentai combined > this value. */
const SENSITIVITY_THRESHOLD = 0.5;

/** Singleton promise for the loaded nsfwjs model. */
let modelPromise: Promise<import("nsfwjs").NSFWJS> | null = null;

/**
 * Returns the singleton nsfwjs model, loading it on first call.
 * Subsequent calls return the same promise.
 *
 * @returns Promise resolving to the loaded NSFWJS model
 */
function getModel(): Promise<import("nsfwjs").NSFWJS> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const nsfwjs = await import("nsfwjs");
      return nsfwjs.load("MobileNetV2");
    })();
  }
  return modelPromise;
}

/**
 * Classifies an image buffer for NSFW content.
 * Decodes the image to raw RGB pixels using sharp, builds a tf.tensor3d,
 * and runs nsfwjs classification. Disposes the tensor in a finally block.
 * Fail-open: returns { isSensitive: false } on any error.
 *
 * @param buffer - Raw image file bytes (jpeg, png, webp, or gif)
 * @returns NsfwResult with sensitivity flag and scores
 */
export async function classifyImageBuffer(buffer: Buffer): Promise<NsfwResult> {
  let tensor: import("@tensorflow/tfjs").Tensor3D | null = null;

  try {
    const sharp = (await import("sharp")).default;
    const tf = await import("@tensorflow/tfjs");
    const model = await getModel();

    const { data, info } = await sharp(buffer)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    tensor = tf.tensor3d(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
      [info.height, info.width, 3]
    );

    const predictions = await model.classify(tensor);

    const pornScore =
      predictions.find((p) => p.className === "Porn")?.probability ?? 0;
    const hentaiScore =
      predictions.find((p) => p.className === "Hentai")?.probability ?? 0;
    const nsfwScore = pornScore + hentaiScore;

    return {
      isSensitive: nsfwScore > SENSITIVITY_THRESHOLD,
      nsfwScore,
      predictions: predictions.map((p) => ({
        className: p.className,
        probability: p.probability,
      })),
    };
  } catch (error) {
    logger.error("classifyImageBuffer: classification failed, failing open", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { isSensitive: false, nsfwScore: 0, predictions: [] };
  } finally {
    tensor?.dispose();
  }
}
