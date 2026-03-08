"use client";

import { useState, useRef } from "react";
import { Upload, Check, ImageIcon, Plus } from "lucide-react";
import { SOLID_COVERS, GRADIENT_COVERS, PHOTO_COVER_CATEGORIES } from "@/lib/board-cover-presets";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";
import SidePanel from "@/components/ui/SidePanel";
import ImageCropModal from "@/components/notes/ImageCropModal";
import type { CustomImage } from "@/hooks/useFolderSettings";

/** Stored appearance: solid color, gradient CSS, or image URL. */
export interface FolderAppearance {
  type: "color" | "gradient" | "image";
  value: string;
}

interface Props {
  open: boolean;
  currentAppearance: FolderAppearance;
  onApply: (appearance: FolderAppearance) => void;
  onClose: () => void;
  /** Fixed position style from computeSidePanelPosition. */
  position?: { top: number; left: number; width: number };
  /** Which side the panel slides in from. */
  side?: "right" | "left";
  /** User's saved custom colors. */
  customColors?: string[];
  /** Callback to persist a new custom color. */
  onAddCustomColor?: (hex: string) => void;
  /** User's saved custom uploaded images. */
  customImages?: CustomImage[];
  /** Callback to persist a new custom image. */
  onAddCustomImage?: (url: string) => void;
}

type Tab = "colors" | "gradients" | "photos";

/**
 * Side panel for customizing a folder's header appearance.
 * Options: solid colors, gradients, preset photos, or custom image upload.
 * Supports user-saved custom colors (color picker) and custom uploaded images.
 * Wraps SidePanel for consistent positioning and animation.
 *
 * @param open - Whether the panel is visible
 * @param currentAppearance - Current folder appearance
 * @param onApply - Callback with the selected appearance
 * @param onClose - Callback to dismiss
 * @param position - Fixed { top, left, width } from computeSidePanelPosition
 * @param side - "right" or "left" for slide animation direction
 * @param customColors - User's saved custom color hex strings
 * @param onAddCustomColor - Callback to save a new custom color
 * @param customImages - User's saved custom uploaded images
 * @param onAddCustomImage - Callback to save a new custom image URL
 */
export default function FolderAppearanceModal({
  open,
  currentAppearance,
  onApply,
  onClose,
  position,
  side = "right",
  customColors = [],
  onAddCustomColor,
  customImages = [],
  onAddCustomImage,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("colors");
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { showToast } = useToast();

  if (!open) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "colors", label: "Colors" },
    { id: "gradients", label: "Gradients" },
    { id: "photos", label: "Photos" },
  ];

  /**
   * Handles file selection — creates an object URL and opens the crop modal.
   * Does not upload immediately; the upload happens after cropping.
   */
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /**
   * Uploads the cropped blob to Supabase and applies the public URL.
   * Also saves the image to the user's custom images for reuse.
   *
   * @param blob - Cropped JPEG blob from the crop modal.
   */
  async function handleCropConfirm(blob: Blob) {
    setUploading(true);
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const path = `${user.id}/folder-${Date.now()}.jpg`;
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });

      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: true });

      if (error) {
        console.error("Upload failed:", error.message);
        showToast("Image upload failed");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      onApply({ type: "image", value: publicUrl });
      onAddCustomImage?.(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  /** Dismisses the crop modal without uploading. */
  function handleCropCancel() {
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  }

  /**
   * Handles custom color picker change — applies the color and saves it.
   */
  function handleCustomColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const hex = e.target.value;
    onApply({ type: "color", value: hex });
    onAddCustomColor?.(hex);
  }

  /**
   * Checks if a given appearance matches the currently selected one.
   */
  function isSelected(type: FolderAppearance["type"], value: string): boolean {
    return currentAppearance.type === type && currentAppearance.value === value;
  }

  return (
    <SidePanel
      title="Appearance"
      icon={ImageIcon}
      side={side}
      position={position}
      onClose={onClose}
    >
      {/* Tab slider */}
      <div className="px-4 py-3">
        <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Colors tab */}
        {activeTab === "colors" && (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {SOLID_COVERS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onApply({ type: "color", value: s.color })}
                  title={s.label}
                  className="relative aspect-square rounded-lg border border-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: s.color }}
                >
                  {isSelected("color", s.color) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={16} className={s.color === "#ffffff" || s.color === "#e7e5e4" ? "text-foreground" : "text-white"} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom colors section */}
            {customColors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Custom Colors</p>
                <div className="grid grid-cols-5 gap-2">
                  {customColors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => onApply({ type: "color", value: hex })}
                      title={hex}
                      className="relative aspect-square rounded-lg border border-border hover:scale-105 transition-transform"
                      style={{ backgroundColor: hex }}
                    >
                      {isSelected("color", hex) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={16} className="text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color picker button */}
            <label
              className="relative flex items-center justify-center aspect-square w-[20%] rounded-lg border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
              title="Pick a custom color"
            >
              <Plus size={16} />
              <input
                ref={colorInputRef}
                type="color"
                onChange={handleCustomColorChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Gradients tab */}
        {activeTab === "gradients" && (
          <div className="grid grid-cols-3 gap-2">
            {GRADIENT_COVERS.map((g) => (
              <button
                key={g.id}
                onClick={() => onApply({ type: "gradient", value: g.style })}
                title={g.label}
                className="relative aspect-[3/2] rounded-lg border border-border hover:scale-105 transition-transform overflow-hidden"
                style={{ background: g.style }}
              >
                {isSelected("gradient", g.style) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={16} className="text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Photos tab */}
        {activeTab === "photos" && (
          <div className="space-y-4">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
            >
              <Upload size={16} />
              {uploading ? "Uploading\u2026" : "Upload custom image"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* User's previously uploaded images */}
            {customImages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Your Images
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {customImages.map((img) => (
                    <button
                      key={img.url}
                      onClick={() => onApply({ type: "image", value: img.url })}
                      title="Custom upload"
                      className="relative aspect-[3/2] rounded-lg border border-border hover:scale-105 transition-transform overflow-hidden"
                    >
                      <img
                        src={img.url}
                        alt="Custom upload"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected("image", img.url) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photo categories */}
            {PHOTO_COVER_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {cat.label}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {cat.photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => onApply({ type: "image", value: photo.url })}
                      title={photo.label}
                      className="relative aspect-[3/2] rounded-lg border border-border hover:scale-105 transition-transform overflow-hidden"
                    >
                      <img
                        src={photo.url.replace("w=3200&h=700", "w=400&h=200")}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected("image", photo.url) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc}
        aspect={2}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </SidePanel>
  );
}
