"use client";

/**
 * Reusable image crop modal using react-easy-crop.
 * Displays a selected image with an interactive crop area.
 * Returns the cropped image as a Blob via onCrop callback.
 *
 * @param open - Whether the modal is visible
 * @param imageSrc - Object URL or data URL of the image to crop
 * @param aspect - Aspect ratio for crop area (e.g. 1 = square, 16/9). Default 1.
 * @param cropShape - "rect" or "round". Default "rect".
 * @param onCrop - Callback with the cropped Blob
 * @param onClose - Callback to close without cropping
 */

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { X } from "lucide-react";

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
      console.error("Crop failed:", err);
    } finally {
      setSaving(false);
    }
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 animate-announce-backdrop-in" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-card rounded-2xl shadow-xl w-full w-[calc(100%-2rem)] max-w-sm animate-announce-card-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Crop Image</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Crop area — relative + overflow-hidden contain the absolute Cropper */}
        <div className="relative w-full overflow-hidden bg-black" style={{ height: 300 }}>
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
        <div className="flex items-center gap-3 px-6 py-3">
          <span className="text-xs text-muted-foreground">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 accent-blue-500"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Crop & Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
