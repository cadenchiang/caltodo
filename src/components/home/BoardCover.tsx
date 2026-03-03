"use client";

/**
 * Full-width cover image banner for the board (Notion-style).
 * Supports custom image upload and preset gradient/photo banners.
 * Edit controls open in a popup modal, not inline on the banner.
 *
 * @param coverImageUrl - Current cover URL (empty = default gradient, "preset:N" = preset)
 * @param editMode - Whether editing is active
 * @param onChangeCover - Callback with new cover value after selection
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Camera, X, Image as ImageIcon, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { extractPalette } from "@/lib/extract-palette";
import ImageCropModal from "@/components/ui/ImageCropModal";
import {
  SOLID_COVERS,
  GRADIENT_COVERS,
  PHOTO_COVER_CATEGORIES,
  PHOTO_COVERS,
  isPreset,
  resolvePreset,
} from "@/lib/board-cover-presets";

interface BoardCoverProps {
  coverImageUrl: string;
  editMode: boolean;
  onChangeCover: (url: string) => void;
  coverHeight: number;
  coverPositionY: number;
  onChangeCoverConfig: (height: number, positionY: number) => void;
  /** Called with extracted dominant colors after a photo cover is set. */
  onPaletteExtracted?: (colors: string[]) => void;
}

export default function BoardCover({
  coverImageUrl,
  editMode,
  onChangeCover,
  coverHeight,
  coverPositionY,
  onChangeCoverConfig,
  onPaletteExtracted,
}: BoardCoverProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  /** Toggles a category between collapsed (horizontal scroll) and expanded (full grid). */
  function toggleCategory(key: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // Reset error state when cover URL changes (e.g. new upload)
  useEffect(() => { setImgError(false); }, [coverImageUrl]);

  const hasCustomImage = coverImageUrl && !isPreset(coverImageUrl) && !imgError;
  const hasPresetCover = isPreset(coverImageUrl);
  const hasCover = !!coverImageUrl;

  /** Whether the current cover is a photo (custom upload or photo preset) — needs position control. */
  const isImageCover = hasCustomImage || (hasPresetCover && coverImageUrl.startsWith("preset:p"));

  /** Opens file picker, then shows crop modal with selected image. */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setCropSrc(url);
    e.target.value = "";
  }

  /**
   * Uploads a cropped Blob to Supabase Storage and updates cover.
   *
   * @param blob - Cropped image blob from ImageCropModal
   */
  const handleCroppedUpload = useCallback(
    async (blob: Blob) => {
      setCropSrc(null);
      setUploading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const ext = blob.type.split("/")[1] === "jpeg" ? "jpg" : blob.type.split("/")[1];
        const path = `${user.id}/board-cover-${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { cacheControl: "3600", upsert: true, contentType: blob.type });

        if (error) {
          console.error("Cover upload failed:", error.message);
          return;
        }

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
        onChangeCover(publicUrl);
        setModalOpen(false);

        // Extract palette from uploaded image
        if (onPaletteExtracted) {
          extractPalette(publicUrl).then((colors) => {
            if (colors.length > 0) onPaletteExtracted(colors);
          });
        }
      } catch (err) {
        console.error("Cover upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [onChangeCover, onPaletteExtracted],
  );

  /** Default gradient shown when no cover or image fails to load. */
  const defaultGradient = (
    <div className="w-full h-full bg-gradient-to-r from-blue-100/50 to-indigo-100/50 dark:from-blue-800/30 dark:to-indigo-800/30" />
  );

  /** Renders the cover visual (uploaded image, preset, or default gradient). */
  function renderCoverContent() {
    const imgPositionStyle = { objectPosition: `center ${coverPositionY}%` };
    if (hasCustomImage) {
      return (
        <img
          src={coverImageUrl}
          alt="Board cover"
          draggable={false}
          className="w-full h-full object-cover"
          style={imgPositionStyle}
          onError={() => setImgError(true)}
        />
      );
    }
    if (hasPresetCover) {
      const preset = resolvePreset(coverImageUrl);
      if (preset.imageUrl) {
        const presetId = coverImageUrl.replace("preset:", "");
        const photoCover = PHOTO_COVERS.find((p) => p.id === presetId);
        if (photoCover?.bgColor) {
          return (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: photoCover.bgColor,
                backgroundImage: `url(${preset.imageUrl})`,
                backgroundSize: "auto 80%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          );
        }
        return <img src={preset.imageUrl} alt="Board cover" draggable={false} className="w-full h-full object-cover" style={imgPositionStyle} />;
      }
      return <div className="w-full h-full" style={{ background: preset.background }} />;
    }
    return defaultGradient;
  }

  return (
    <>
      {/* Banner — consistent height */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: coverHeight }}
      >
        {renderCoverContent()}

        {/* Edit button — always rendered, visibility toggled via CSS for instant response */}
        <button
          onClick={() => setModalOpen(true)}
          className={`absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all duration-200 ${
            editMode ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Edit Cover"
        >
          <Pencil size={14} className="text-white" />
        </button>
      </div>

      {/* Cover editing modal — portaled to body */}
      {modalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in" onClick={() => setModalOpen(false)} />
          <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-md mx-4 animate-announce-card-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Edit Cover</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current preview — height scales with banner height slider */}
            <div
              className="w-full overflow-hidden transition-[height] duration-150"
              style={{ height: Math.round(60 + ((coverHeight - 80) / (350 - 80)) * 60) }}
            >
              {renderCoverContent()}
            </div>

            {/* Height & Position sliders */}
            <div className="px-4 pt-4 pb-1 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-foreground">Banner Height</label>
                  <span className="text-[10px] tabular-nums text-muted-foreground">{coverHeight}px</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={350}
                  step={10}
                  value={coverHeight}
                  onChange={(e) => onChangeCoverConfig(Number(e.target.value), coverPositionY)}
                  className="w-full slider-blue"
                  style={{ background: `linear-gradient(to right, #3b82f6 ${((coverHeight - 80) / (350 - 80)) * 100}%, var(--border) ${((coverHeight - 80) / (350 - 80)) * 100}%)` }}
                />
              </div>
              {isImageCover && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-foreground">Image Position</label>
                    <span className="text-[10px] tabular-nums text-muted-foreground">{coverPositionY}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={coverPositionY}
                    onChange={(e) => onChangeCoverConfig(coverHeight, Number(e.target.value))}
                    className="w-full slider-blue"
                    style={{ background: `linear-gradient(to right, #3b82f6 ${coverPositionY}%, var(--border) ${coverPositionY}%)` }}
                  />
                </div>
              )}
            </div>

            {/* Preset sections — scrollable */}
            <div className="p-4 space-y-8 max-h-[50vh] overflow-y-auto">
              {/* Photos — grouped by category, horizontal scroll or expanded grid */}
              {PHOTO_COVER_CATEGORIES.map((cat) => {
                const catKey = `photo-${cat.label}`;
                const isExpanded = expandedCategories.has(catKey);
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-foreground">{cat.label}</p>
                      {cat.photos.length > 3 && (
                        <button
                          onClick={() => toggleCategory(catKey)}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? "Show Less" : `Show All (${cat.photos.length})`}
                        </button>
                      )}
                    </div>
                    {isExpanded ? (
                      <div className="grid grid-cols-3 gap-2">
                        {cat.photos.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              onChangeCover(`preset:${p.id}`);
                              setModalOpen(false);
                              if (onPaletteExtracted) {
                                extractPalette(p.url).then((colors) => {
                                  if (colors.length > 0) onPaletteExtracted(colors);
                                });
                              }
                            }}
                            className="w-full aspect-[3/1] rounded-lg overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                            title={p.label}
                          >
                            <img src={p.url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex overflow-x-auto gap-2 scrollbar-none">
                        {cat.photos.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              onChangeCover(`preset:${p.id}`);
                              setModalOpen(false);
                              if (onPaletteExtracted) {
                                extractPalette(p.url).then((colors) => {
                                  if (colors.length > 0) onPaletteExtracted(colors);
                                });
                              }
                            }}
                            className="shrink-0 w-[120px] rounded-lg overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                            title={p.label}
                          >
                            <div className="aspect-[3/1]">
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Gradients — horizontal scroll or expanded grid */}
              {(() => {
                const isExpanded = expandedCategories.has("gradients");
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-foreground">Gradients</p>
                      <button
                        onClick={() => toggleCategory("gradients")}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? "Show Less" : `Show All (${GRADIENT_COVERS.length})`}
                      </button>
                    </div>
                    {isExpanded ? (
                      <div className="grid grid-cols-5 gap-2">
                        {GRADIENT_COVERS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { onChangeCover(`preset:${p.id}`); setModalOpen(false); }}
                            className="w-full aspect-[2/1] rounded-lg overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                            title={p.label}
                          >
                            <div className="w-full h-full" style={{ background: p.style }} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex overflow-x-auto gap-2 scrollbar-none">
                        {GRADIENT_COVERS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { onChangeCover(`preset:${p.id}`); setModalOpen(false); }}
                            className="shrink-0 w-[72px] rounded-lg overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                            title={p.label}
                          >
                            <div className="aspect-[2/1]" style={{ background: p.style }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Solid Colors — horizontal scroll or expanded grid */}
              {(() => {
                const isExpanded = expandedCategories.has("solids");
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-foreground">Solid Colors</p>
                      <button
                        onClick={() => toggleCategory("solids")}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? "Show Less" : `Show All (${SOLID_COVERS.length})`}
                      </button>
                    </div>
                    {isExpanded ? (
                      <div className="grid grid-cols-5 gap-2">
                        {SOLID_COVERS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { onChangeCover(`preset:${p.id}`); setModalOpen(false); }}
                            className="w-full aspect-[2/1] rounded-lg overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                            title={p.label}
                          >
                            <div className="w-full h-full" style={{ backgroundColor: p.color }} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex overflow-x-auto gap-2 scrollbar-none">
                        {SOLID_COVERS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { onChangeCover(`preset:${p.id}`); setModalOpen(false); }}
                            className="shrink-0 w-[72px] rounded-lg overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                            title={p.label}
                          >
                            <div className="aspect-[2/1]" style={{ backgroundColor: p.color }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4 border-t border-border">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
                Upload Image
              </button>
              {hasCover && (
                <button
                  onClick={() => {
                    onChangeCover("");
                    setModalOpen(false);
                  }}
                  className="px-3 py-2 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Remove
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Crop modal for uploaded banner images */}
      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc || ""}
        aspect={16 / 4}
        onCrop={handleCroppedUpload}
        onClose={() => {
          if (cropSrc) URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        }}
      />
    </>
  );
}
