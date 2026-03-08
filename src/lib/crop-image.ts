/**
 * Crops an image to a specified pixel region using the browser Canvas API.
 * Designed to work with `react-easy-crop`'s `croppedAreaPixels` output.
 *
 * No external dependencies — uses only browser-native APIs.
 */

/** Pixel region returned by react-easy-crop's onCropComplete callback. */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crops an image to the given pixel region and returns a JPEG Blob.
 *
 * @param imageSrc - Object URL or data URL of the source image.
 * @param pixelCrop - The { x, y, width, height } region to extract.
 * @param quality - JPEG quality from 0 to 1. Default: 0.9.
 * @returns A JPEG Blob of the cropped region.
 * @throws If the image fails to load or canvas context is unavailable.
 */
export async function cropImage(
  imageSrc: string,
  pixelCrop: CropArea,
  quality = 0.9,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const canvas = new OffscreenCanvas(pixelCrop.width, pixelCrop.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas 2d context for cropping");
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return canvas.convertToBlob({ type: "image/jpeg", quality });
}

/**
 * Loads an image from a URL and returns it as an HTMLImageElement.
 *
 * @param src - Image URL to load.
 * @returns Resolved HTMLImageElement once loaded.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
