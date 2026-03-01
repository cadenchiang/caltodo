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

/** Solid color presets. */
const SOLID_COVERS: { id: string; label: string; color: string }[] = [
  { id: "s1", label: "White", color: "#ffffff" },
  { id: "s2", label: "Warm Gray", color: "#d6d3d1" },
  { id: "s3", label: "Cool Gray", color: "#9ca3af" },
  { id: "s4", label: "Slate", color: "#475569" },
  { id: "s5", label: "Charcoal", color: "#1e293b" },
  { id: "s6", label: "Sky", color: "#7dd3fc" },
  { id: "s7", label: "Blue", color: "#3b82f6" },
  { id: "s8", label: "Indigo", color: "#6366f1" },
  { id: "s9", label: "Violet", color: "#8b5cf6" },
  { id: "s10", label: "Rose", color: "#fb7185" },
  { id: "s11", label: "Amber", color: "#fbbf24" },
  { id: "s12", label: "Emerald", color: "#34d399" },
  { id: "s13", label: "Teal", color: "#2dd4bf" },
  { id: "s14", label: "Sand", color: "#e7e5e4" },
  { id: "s15", label: "Peach", color: "#fdba74" },
];

/** Gradient presets. */
const GRADIENT_COVERS: { id: string; label: string; style: string }[] = [
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
  { id: "g12", label: "Lavender", style: "linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)" },
  { id: "g13", label: "Volcano", style: "linear-gradient(135deg, #ff5858 0%, #f09819 100%)" },
  { id: "g14", label: "Mint", style: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" },
  { id: "g15", label: "Flamingo", style: "linear-gradient(135deg, #feb47b 0%, #ff7e5f 100%)" },
];

/**
 * Photo presets — high-quality Unsplash images (free to use).
 * Using Unsplash source URLs with size parameters for fast loading.
 */
/**
 * Photo presets — wide landscape Unsplash images (free to use).
 * Using wider aspect ratio crops with gravity=center for panoramic banner feel.
 */
const PHOTO_COVERS: { id: string; label: string; url: string; bgColor?: string }[] = [
  // Branded
  { id: "cal", label: "Cal Berkeley", url: "/cal-logo.webp", bgColor: "#012677" },
  // Nature & Landscapes
  { id: "p1", label: "Mountain Lake", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=350&fit=crop&crop=bottom&q=80" },
  { id: "p2", label: "Ocean Horizon", url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p3", label: "Forest Canopy", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p4", label: "Desert Dunes", url: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p5", label: "Cherry Blossoms", url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p6", label: "Northern Lights", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&h=350&fit=crop&crop=top&q=80" },
  { id: "p7", label: "Autumn Road", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p8", label: "Tropical Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p9", label: "Alpine Peaks", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p10", label: "Lavender Field", url: "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p11", label: "Misty Valley", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p12", label: "Lake Reflection", url: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p13", label: "Starry Sky", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p14", label: "Coastline", url: "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p15", label: "Meadow Sunrise", url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&h=350&fit=crop&crop=center&q=80" },
  // Skies & Sunsets
  { id: "p16", label: "Pink Clouds", url: "https://images.unsplash.com/photo-1525920980995-f8a382bf42c5?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p17", label: "Sunset Beach", url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p18", label: "Golden Hour", url: "https://images.unsplash.com/photo-1502481851512-e9e2529b8c7a?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p19", label: "Sunset Lake", url: "https://images.unsplash.com/photo-1540206395-68808572332f?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p20", label: "Sunset Hills", url: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&h=350&fit=crop&crop=center&q=80" },
  // Mountains & Valleys
  { id: "p21", label: "Mountain Road", url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p22", label: "Misty Mountains", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p23", label: "Snow Peaks", url: "https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p24", label: "Green Valley", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p25", label: "Patagonia", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=350&fit=crop&crop=center&q=80" },
  // Water & Oceans
  { id: "p26", label: "Ocean Wave", url: "https://images.unsplash.com/photo-1488330890490-c291ecf62571?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p27", label: "Waterfall", url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p28", label: "Coral Reef", url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p29", label: "Starry Lake", url: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1600&h=350&fit=crop&crop=center&q=80" },
  // Flora & Gardens
  { id: "p30", label: "Wildflowers", url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p31", label: "Tulip Field", url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p32", label: "Bamboo Forest", url: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p33", label: "Fall Leaves", url: "https://images.unsplash.com/photo-1536514498073-50e69d39c6cf?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p34", label: "Rainforest", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p35", label: "Green Hills", url: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1600&h=350&fit=crop&crop=center&q=80" },
  // City & Architecture
  { id: "p36", label: "City Night", url: "https://images.unsplash.com/photo-1520962922320-2038eebab146?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p37", label: "Manhattan", url: "https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p38", label: "Golden Gate", url: "https://images.unsplash.com/photo-1484291150161-e0c7087e8d30?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p39", label: "Japanese Garden", url: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=1600&h=350&fit=crop&crop=center&q=80" },
  // Space & Night
  { id: "p40", label: "Milky Way", url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600&h=350&fit=crop&crop=center&q=80" },
  // Travel & Adventure
  { id: "p41", label: "Hot Air Balloons", url: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p42", label: "Road Journey", url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p43", label: "Palm Trees", url: "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1600&h=350&fit=crop&crop=center&q=80" },
  // Abstract & Texture
  { id: "p44", label: "Abstract Blue", url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1600&h=350&fit=crop&crop=center&q=80" },
  { id: "p45", label: "Neon Lights", url: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1600&h=350&fit=crop&crop=center&q=80" },
];

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

/**
 * Checks if the cover value is a preset reference (solid, gradient, or photo).
 *
 * @param url - The cover URL string
 * @returns True if url is a "preset:ID" reference
 */
function isPreset(url: string): boolean {
  return url.startsWith("preset:");
}

/**
 * Returns the CSS background value or image URL for a preset.
 * Handles solid (s*), gradient (g*), and photo (p*) presets.
 *
 * @param url - The cover URL in "preset:ID" format
 * @returns Object with either `background` CSS string or `imageUrl`
 */
function resolvePreset(url: string): { background?: string; imageUrl?: string } {
  const id = url.replace("preset:", "");
  const solid = SOLID_COVERS.find((p) => p.id === id);
  if (solid) return { background: solid.color };
  const gradient = GRADIENT_COVERS.find((p) => p.id === id);
  if (gradient) return { background: gradient.style };
  const photo = PHOTO_COVERS.find((p) => p.id === id);
  if (photo) return { imageUrl: photo.url };
  return { background: GRADIENT_COVERS[0].style };
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

            {/* Current preview */}
            <div className="w-full h-28 overflow-hidden">
              {renderCoverContent()}
            </div>

            {/* Height & Position sliders */}
            <div className="px-4 pt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Banner Height</label>
                  <span className="text-[10px] tabular-nums text-muted-foreground">{coverHeight}px</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={350}
                  step={10}
                  value={coverHeight}
                  onChange={(e) => onChangeCoverConfig(Number(e.target.value), coverPositionY)}
                  className="w-full h-1.5 rounded-full appearance-none bg-muted accent-blue-500 cursor-pointer"
                />
              </div>
              {isImageCover && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Image Position</label>
                    <span className="text-[10px] tabular-nums text-muted-foreground">{coverPositionY}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={coverPositionY}
                    onChange={(e) => onChangeCoverConfig(coverHeight, Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-muted accent-blue-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Preset sections — scrollable */}
            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {/* Photos */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {PHOTO_COVERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onChangeCover(`preset:${p.id}`);
                        setModalOpen(false);
                        // Extract palette from photo preset
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
              </div>

              {/* Gradients */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Gradients</p>
                <div className="grid grid-cols-5 gap-2">
                  {GRADIENT_COVERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onChangeCover(`preset:${p.id}`);
                        setModalOpen(false);
                      }}
                      className="w-full aspect-[2/1] rounded-lg overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                      title={p.label}
                    >
                      <div className="w-full h-full" style={{ background: p.style }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Solid Colors */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Solid Colors</p>
                <div className="grid grid-cols-5 gap-2">
                  {SOLID_COVERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onChangeCover(`preset:${p.id}`);
                        setModalOpen(false);
                      }}
                      className="w-full aspect-[2/1] rounded-lg overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-blue-500 transition-all"
                      title={p.label}
                    >
                      <div className="w-full h-full" style={{ backgroundColor: p.color }} />
                    </button>
                  ))}
                </div>
              </div>
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
