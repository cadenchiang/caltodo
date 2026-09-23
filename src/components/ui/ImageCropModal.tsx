"use client";

/**
 * Reusable image crop modal using react-easy-crop.
 * Displays a selected image with an interactive crop area.
 * Returns the cropped image as a Blob via onCrop callback.
 *
 * Built on the Modal primitive so it stacks correctly over another dialog
 * (Escape closes only the cropper, backdrop clicks check their target).
 *
 * @param open - Whether the modal is visible
 * @param imageSrc - Object URL or data URL of the image to crop
 * @param aspect - Aspect ratio for crop area (e.g. 1 = square, 16/9). Default 1.
 * @param cropShape - "rect" or "round". Default "rect".
 * @param onCrop - Callback with the cropped Blob
 * @param onClose - Callback to close without cropping
 */

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  aspect?: number;
  cropShape?: "rect" | "round";
  onCrop: (blob: Blob) => void;
  onClose: () => void;
}

/**
 * Creates a cropped image Blob from the source image and crop area.
 * Outputs at native resolution (no upscaling) to preserve sharpness.
 * Uses high-quality JPEG at 0.92 to balance quality and file size.
 *
 * @param imageSrc - Source image URL
 * @param pixelCrop - Pixel coordinates of the crop area from react-easy-crop
 * @returns Promise resolving to a high-quality JPEG Blob
 */
/** Minimum output width for banner crops — matches preset image quality. */
const MIN_BANNER_WIDTH = 1600;

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  // Ensure minimum output width so banners stay sharp at full container width.
  // If the crop area is smaller than MIN_BANNER_WIDTH, scale up proportionally.
  let outW = pixelCrop.width;
  let outH = pixelCrop.height;
  if (outW < MIN_BANNER_WIDTH) {
    const scale = MIN_BANNER_WIDTH / outW;
    outW = MIN_BANNER_WIDTH;
    outH = Math.round(pixelCrop.height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Blob creation failed"))),
      "image/jpeg",
      0.92,
    );
  });
}

export default function ImageCropModal({
  open,
  imageSrc,
  aspect = 1,
  cropShape = "rect",
  onCrop,
  onClose,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  /** Exports the cropped region and calls onCrop. */
  async function handleSave() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      onCrop(blob);
    } catch (err) {
      console.error("[ImageCropModal] crop failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "no image returned; dialog stays open",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crop image"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Crop and save
          </Button>
        </>
      }
    >
      {/* Crop area: relative + overflow-hidden contain the absolute Cropper */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ height: 300 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect || 4 / 3}
          cropShape={cropShape}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { width: "100%", height: "100%" },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 pt-3">
        <label htmlFor="image-crop-zoom" className="text-xs text-muted-foreground">
          Zoom
        </label>
        <input
          id="image-crop-zoom"
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 h-1 accent-blue-500"
        />
      </div>
    </Modal>
  );
}
