/**
 * Preset images for the Image Widget.
 * Uses Unsplash source URLs with 4:3 aspect ratio crops to match widget display.
 * IDs use "iw" prefix to avoid collision with BoardCover's "p" IDs.
 *
 * @see src/components/home/widgets/ImageWidget.tsx
 */

/** A single image widget preset entry. */
export interface ImageWidgetPreset {
  id: string;
  label: string;
  url: string;
}

/** Curated Unsplash photos for the image widget (4:3 aspect). */
export const IMAGE_WIDGET_PRESETS: ImageWidgetPreset[] = [
  // Nature & Landscapes
  { id: "iw1", label: "Mountain Lake", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80" },
  { id: "iw2", label: "Ocean Horizon", url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80" },
  { id: "iw3", label: "Forest Canopy", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop&q=80" },
  { id: "iw4", label: "Desert Dunes", url: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&h=600&fit=crop&q=80" },
  { id: "iw5", label: "Cherry Blossoms", url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=600&fit=crop&q=80" },
  { id: "iw6", label: "Northern Lights", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop&q=80" },
  { id: "iw7", label: "Autumn Road", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80" },
  { id: "iw8", label: "Tropical Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80" },
  // Skies & Sunsets
  { id: "iw9", label: "Pink Clouds", url: "https://images.unsplash.com/photo-1525920980995-f8a382bf42c5?w=800&h=600&fit=crop&q=80" },
  { id: "iw10", label: "Sunset Beach", url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&h=600&fit=crop&q=80" },
  { id: "iw11", label: "Golden Hour", url: "https://images.unsplash.com/photo-1502481851512-e9e2529b8c7a?w=800&h=600&fit=crop&q=80" },
  { id: "iw12", label: "Sunset Hills", url: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=600&fit=crop&q=80" },
  // Mountains & Valleys
  { id: "iw13", label: "Misty Mountains", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&q=80" },
  { id: "iw14", label: "Snow Peaks", url: "https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800&h=600&fit=crop&q=80" },
  { id: "iw15", label: "Green Valley", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop&q=80" },
  { id: "iw16", label: "Patagonia", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&q=80" },
  // Water & Oceans
  { id: "iw17", label: "Ocean Wave", url: "https://images.unsplash.com/photo-1488330890490-c291ecf62571?w=800&h=600&fit=crop&q=80" },
  { id: "iw18", label: "Waterfall", url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop&q=80" },
  { id: "iw19", label: "Coral Reef", url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=600&fit=crop&q=80" },
  // Flora & Gardens
  { id: "iw20", label: "Wildflowers", url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop&q=80" },
  { id: "iw21", label: "Tulip Field", url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&h=600&fit=crop&q=80" },
  { id: "iw22", label: "Bamboo Forest", url: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&h=600&fit=crop&q=80" },
  { id: "iw23", label: "Rainforest", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop&q=80" },
  // City & Architecture
  { id: "iw24", label: "City Night", url: "https://images.unsplash.com/photo-1520962922320-2038eebab146?w=800&h=600&fit=crop&q=80" },
  { id: "iw25", label: "Manhattan", url: "https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=800&h=600&fit=crop&q=80" },
  { id: "iw26", label: "Golden Gate", url: "https://images.unsplash.com/photo-1484291150161-e0c7087e8d30?w=800&h=600&fit=crop&q=80" },
  { id: "iw27", label: "Japanese Garden", url: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800&h=600&fit=crop&q=80" },
  // Space & Night
  { id: "iw28", label: "Milky Way", url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=600&fit=crop&q=80" },
  { id: "iw29", label: "Starry Sky", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&q=80" },
  // Abstract
  { id: "iw30", label: "Neon Lights", url: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&h=600&fit=crop&q=80" },
];

/** Map from preset ID to preset object for O(1) lookups. */
const PRESET_MAP = new Map(IMAGE_WIDGET_PRESETS.map((p) => [p.id, p]));

/**
 * Checks whether a URL string is an image widget preset reference.
 *
 * @param url - URL string to check (e.g. "preset:iw5" or "https://...")
 * @returns true if the URL uses the "preset:" scheme
 */
export function isImageWidgetPreset(url: string): boolean {
  return url.startsWith("preset:");
}

/**
 * Resolves a preset reference to its full Unsplash URL.
 * If the ID is invalid, falls back to the first preset.
 *
 * @param url - Preset reference string (e.g. "preset:iw5")
 * @returns The resolved Unsplash image URL
 */
export function resolveImagePreset(url: string): string {
  const id = url.replace("preset:", "");
  const preset = PRESET_MAP.get(id);
  return preset?.url ?? IMAGE_WIDGET_PRESETS[0].url;
}
