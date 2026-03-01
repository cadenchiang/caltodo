"use client";

/**
 * Full-width cover image banner for the board (Notion-style).
 * Supports custom image upload and preset gradient/photo banners.
 * Compact height: text sits right below the banner.
 *
 * @param coverImageUrl - Current cover URL (empty = default gradient, "preset:N" = preset)
 * @param editMode - Whether editing is active
 * @param onChangeCover - Callback with new cover value after selection
 */

import { useRef, useState } from "react";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";

/** Preset cover banners — CSS gradients, no external dependencies. */
const PRESET_COVERS: { id: string; label: string; style: string }[] = [
  { id: "g1", label: "Ocean", style: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "g2", label: "Sunset", style: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { id: "g3", label: "Forest", style: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { id: "g4", label: "Dusk", style: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
  { id: "g5", label: "Midnight", style: "linear-gradient(135deg, #0c3547 0%, #1a1a2e 100%)" },
  { id: "g6", label: "Peach", style: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { id: "g7", label: "Aurora", style: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" },
  { id: "g8", label: "Berry", style: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)" },
  { id: "g9", label: "Emerald", style: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { id: "g10", label: "Slate", style: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)" },
  { id: "g11", label: "Coral", style: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  { id: "g12", label: "Dawn", style: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)" },
  { id: "g13", label: "Lavender", style: "linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)" },
  { id: "g14", label: "Volcano", style: "linear-gradient(135deg, #ff5858 0%, #f09819 100%)" },
  { id: "g15", label: "Deep Sea", style: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)" },
  { id: "g16", label: "Cotton Candy", style: "linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)" },
  { id: "g17", label: "Mint", style: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" },
  { id: "g18", label: "Storm", style: "linear-gradient(135deg, #616161 0%, #9bc5c3 100%)" },
  { id: "g19", label: "Flamingo", style: "linear-gradient(135deg, #feb47b 0%, #ff7e5f 100%)" },
  { id: "g20", label: "Arctic", style: "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)" },
];

interface BoardCoverProps {
  coverImageUrl: string;
  editMode: boolean;
  onChangeCover: (url: string) => void;
}

/**
 * Checks if the cover is a preset gradient reference.
 *
 * @param url - The cover URL string
 * @returns True if url is a "preset:ID" reference
 */
function isPreset(url: string): boolean {
  return url.startsWith("preset:");
}

/**
 * Finds the CSS gradient for a preset cover ID.
 *
 * @param url - The cover URL in "preset:ID" format
 * @returns CSS gradient string, or a default gradient if not found
 */
function getPresetGradient(url: string): string {
  const id = url.replace("preset:", "");
  const preset = PRESET_COVERS.find((p) => p.id === id);
  return preset?.style || PRESET_COVERS[0].style;
}

export default function BoardCover({
  coverImageUrl,
  editMode,
  onChangeCover,
}: BoardCoverProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const hasCustomImage = coverImageUrl && !isPreset(coverImageUrl);
  const hasPresetCover = isPreset(coverImageUrl);
  const hasCover = !!coverImageUrl;

  /** Handles file selection, compresses, uploads to Supabase Storage. */
  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 1920, quality: 0.8 });
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = compressed.type.split("/")[1] === "jpeg" ? "jpg" : compressed.type.split("/")[1];
      const path = `${user.id}/board-cover-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { cacheControl: "3600", upsert: true, contentType: compressed.type });

      if (error) {
        console.error("Cover upload failed:", error.message);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      onChangeCover(`${urlData.publicUrl}?t=${Date.now()}`);
      setShowPresets(false);
    } catch (err) {
      console.error("Cover upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  /** Renders the cover visual (image, preset gradient, or default gradient). */
  function renderCoverContent() {
    if (hasCustomImage) {
      return <img src={coverImageUrl} alt="Board cover" draggable={false} className="w-full h-full object-cover" />;
    }
    if (hasPresetCover) {
      return <div className="w-full h-full" style={{ background: getPresetGradient(coverImageUrl) }} />;
    }
    return (
      <div className="w-full h-full bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20" />
    );
  }

  return (
    <div className="relative w-full overflow-hidden transition-[height] duration-300 ease-in-out"
      style={{ height: hasCover ? "260px" : "120px" }}
    >
      {renderCoverContent()}

      {/* Edit mode overlay */}
      {editMode && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <button
                onClick={() => setShowPresets((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white/90 text-gray-900 hover:bg-white transition-colors"
              >
                <ImageIcon size={14} />
                Presets
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white/90 text-gray-900 hover:bg-white transition-colors"
              >
                <Camera size={14} />
                Upload
              </button>
              {hasCover && (
                <button
                  onClick={() => {
                    onChangeCover("");
                    setShowPresets(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white/90 text-gray-900 hover:bg-white transition-colors"
                >
                  <X size={14} />
                  Remove
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Preset gallery dropdown */}
      {editMode && showPresets && (
        <div className="absolute bottom-0 left-0 right-0 bg-popover/95 backdrop-blur-sm border-t border-border p-3 animate-announce-card-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-foreground">Choose a cover</p>
            <button
              onClick={() => setShowPresets(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-10 gap-1.5 max-h-[80px] overflow-y-auto">
            {PRESET_COVERS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onChangeCover(`preset:${p.id}`);
                  setShowPresets(false);
                }}
                className="w-full aspect-[2/1] rounded-md overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                title={p.label}
              >
                <div className="w-full h-full" style={{ background: p.style }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
