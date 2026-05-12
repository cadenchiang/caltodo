"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { cropImage } from "@/lib/crop-image";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Object URL of the image to crop. */
  imageSrc: string | null;
  /** Fixed aspect ratio for the crop area (width / height). Default: 2. */
  aspect?: number;
  /** Called with the cropped JPEG blob when the user confirms. */
  onConfirm: (blob: Blob) => void;
  /** Called when the user cancels cropping. */
  onCancel: () => void;
}

/**
 * Portal-based modal for cropping an image before upload.
 * Uses react-easy-crop with a fixed aspect ratio — user can zoom and
 * pan but cannot change the crop shape.
 *
 * @param open - Controls visibility
 * @param imageSrc - Source image URL (object URL from file input)
 * @param aspect - Fixed crop aspect ratio (default 2:1)
 * @param onConfirm - Fires with cropped Blob when "Apply" is clicked
 * @param onCancel - Fires when "Cancel" is clicked or backdrop is clicked
 */
export default function ImageCropModal({
  open,
  imageSrc,
  aspect = 2,
  onConfirm,
  onCancel,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  /**
   * Crops the image and passes the resulting blob to the parent.
   */
  async function handleApply() {
    if (!imageSrc || !croppedPixels) return;
    setApplying(true);
    try {
      const blob = await cropImage(imageSrc, croppedPixels);
      onConfirm(blob);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setApplying(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    if (!open || !imageSrc) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, imageSrc, onCancel]);

  if (!open || !imageSrc || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={onCancel}
      />

      {/* Modal card */}
      <div className="relative bg-popover rounded-2xl border border-border shadow-2xl max-w-md w-full mx-4 animate-announce-card-in overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Crop Image
          </h2>
        </div>

        {/* Cropper area */}
        <div className="relative w-full" style={{ height: 260 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-4 py-3 flex items-center gap-3">
          <span className="text-xs text-muted-foreground select-none">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer
              bg-gray-300 dark:bg-gray-600
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-blue-500
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            {applying ? "Applying\u2026" : "Apply"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
