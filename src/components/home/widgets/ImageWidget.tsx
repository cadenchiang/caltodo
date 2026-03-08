"use client";

/**
 * Widget that displays a user-uploaded image.
 * Supports click-to-browse and drag-and-drop file selection, then crop + upload.
 *
 * @param config - Widget config containing optional imageUrl
 * @param widgetId - Unique widget instance ID for storage path
 * @param onUpdateConfig - Callback to persist image URL to widget config
 */

import { useRef, useState, useCallback } from "react";
import { Camera, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ImageCropModal from "@/components/ui/ImageCropModal";
import {
  IMAGE_WIDGET_PRESETS,
  isImageWidgetPreset,
  resolveImagePreset,
} from "@/lib/image-widget-presets";

interface ImageWidgetProps {
  config: Record<string, string>;
  widgetId: string;
  onUpdateConfig?: (config: Record<string, string>) => void;
  onOpenSettings?: () => void;
}

export default function ImageWidget({
  config,
  widgetId,
  onUpdateConfig,
  onOpenSettings,
}: ImageWidgetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  /**
   * Uploads a cropped Blob to Supabase and updates widget config.
   *
   * @param blob - Cropped image blob from ImageCropModal
   */
  const handleCroppedUpload = useCallback(
    async (blob: Blob) => {
      setCropSrc(null);
      if (!onUpdateConfig) return;
      setUploading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const ext = blob.type.split("/")[1] === "jpeg" ? "jpg" : blob.type.split("/")[1];
        const path = `${user.id}/board-img-${widgetId}-${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { cacheControl: "3600", upsert: true, contentType: blob.type });

        if (error) {
          console.error("Image widget upload failed:", error.message);
          return;
        }

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        onUpdateConfig({ imageUrl: `${urlData.publicUrl}?t=${Date.now()}` });
      } catch (err) {
        console.error("Image widget upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [onUpdateConfig, widgetId],
  );

  /** Opens file picker, then shows crop modal with selected image. */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setCropSrc(url);
    e.target.value = "";
  }

  /**
   * Handles file drop on the widget. Accepts first image file and opens crop modal.
   *
   * @param e - React drag event containing dropped files
   */
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!onUpdateConfig) return;
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith("image/")
    );
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
  }

  /** Prevents default browser handling and sets drag-over visual state. */
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  /** Clears drag-over visual state when cursor leaves the drop zone. */
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={handleFileSelect}
    />
  );

  // Resolve preset URLs for display
  const resolvedUrl = config.imageUrl && isImageWidgetPreset(config.imageUrl)
    ? resolveImagePreset(config.imageUrl)
    : config.imageUrl;

  // Image is set — display it, with change button in edit mode
  if (config.imageUrl) {
    return (
      <div className="h-full w-full overflow-hidden relative group">
        <img
          src={resolvedUrl}
          alt="Widget image"
          className="h-full w-full object-cover"
          draggable={false}
        />
        {onUpdateConfig && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
              className="no-drag flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white/90 text-gray-900 hover:bg-white transition-colors"
            >
              <Camera size={14} />
              Change
            </button>
          </div>
        )}
        {fileInput}
        <ImageCropModal
          open={!!cropSrc}
          imageSrc={cropSrc || ""}
          aspect={4 / 3}
          onCrop={handleCroppedUpload}
          onClose={() => {
            if (cropSrc) URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
        />
      </div>
    );
  }

  // No image — show drop zone + upload prompt
  return (
    <div
      className={`h-full w-full flex flex-col items-center justify-center p-3 transition-colors ${
        dragOver ? "border-2 border-dashed border-muted-foreground/40 bg-muted/50" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {uploading ? (
        <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <ImageIcon size={24} className="text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground mb-1">
            {dragOver ? "Drop image here" : "No image"}
          </p>
          {!dragOver && onUpdateConfig && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings?.();
                }}
                className="no-drag flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-muted transition-colors mt-1"
              >
                <Camera size={14} />
                Select Image
              </button>
          )}
        </>
      )}
      {fileInput}
      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc || ""}
        aspect={4 / 3}
        onCrop={handleCroppedUpload}
        onClose={() => {
          if (cropSrc) URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        }}
      />
    </div>
  );
}
