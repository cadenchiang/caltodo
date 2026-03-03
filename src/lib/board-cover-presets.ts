/**
 * Preset data for the board cover (banner) picker.
 * Includes solid colors, gradients, and categorized photo covers.
 *
 * @see src/components/home/BoardCover.tsx
 */

/** Solid color presets. */
export const SOLID_COVERS: { id: string; label: string; color: string }[] = [
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
export const GRADIENT_COVERS: { id: string; label: string; style: string }[] = [
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

/** Single photo cover preset. */
export interface PhotoCover {
  id: string;
  label: string;
  url: string;
  bgColor?: string;
}

/** Categorized photo preset sections for the cover picker. */
export const PHOTO_COVER_CATEGORIES: { label: string; photos: PhotoCover[] }[] = [
  {
    label: "Cal Berkeley",
    photos: [
      { id: "cal", label: "Cal Berkeley", url: "/cal-logo.webp", bgColor: "#012677" },
      { id: "campanile", label: "Campanile Panorama", url: "/campanile-panorama.jpg" },
    ],
  },
  {
    label: "Mountains",
    photos: [
      { id: "p1", label: "Mountains at Sunset", url: "https://images.unsplash.com/photo-1486520299386-6d106b22014b?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p2", label: "Mountain Landscape", url: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p3", label: "Aerial Mountain Peaks", url: "https://images.unsplash.com/photo-1533555855029-9341affa632a?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p4", label: "Glacier Forest", url: "https://images.unsplash.com/photo-1502382015675-003f660a9731?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p5", label: "Panoramic Range", url: "https://images.unsplash.com/photo-1522144937397-b921f9d046d7?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p6", label: "Cloudy Mountains", url: "https://images.unsplash.com/photo-1739369120898-c654cb64b14d?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p7", label: "Misty Panorama", url: "https://images.unsplash.com/photo-1702144721728-13f38c5f7f26?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p8", label: "Rainbow Mountains", url: "https://images.unsplash.com/photo-1747985323857-5c1c16b2ac47?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p9", label: "Snow Peak Sunset", url: "https://images.unsplash.com/photo-1499336315816-097655dcfbda?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p10", label: "Mountain Vista", url: "https://images.unsplash.com/photo-1734883720875-fb7c08d9774d?w=1600&h=350&fit=crop&crop=center&q=80" },
    ],
  },
  {
    label: "Sunsets",
    photos: [
      { id: "p11", label: "Foggy Sunrise", url: "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p12", label: "Golden Hour Mountains", url: "https://images.unsplash.com/photo-1464061884326-64f6ebd57f83?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p13", label: "Aerial Golden Hour", url: "https://images.unsplash.com/photo-1568321432707-b7bc30ce8517?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p14", label: "Desert Sunset", url: "https://images.unsplash.com/photo-1759244717529-75baad137526?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p15", label: "Italian Mountains", url: "https://images.unsplash.com/photo-1523518165665-2186fc960d38?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p16", label: "Silhouette Hills", url: "https://images.unsplash.com/photo-1480004902249-cdb28d6a01a4?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p17", label: "Bridge Golden Hour", url: "https://images.unsplash.com/photo-1553425493-942e54572443?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p18", label: "Athens Cityscape", url: "https://images.unsplash.com/photo-1557686583-560ae7baba2a?w=1600&h=350&fit=crop&crop=center&q=80" },
    ],
  },
  {
    label: "Flowers & Fields",
    photos: [
      { id: "p19", label: "Lavender Field", url: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p20", label: "Tulip Field", url: "https://images.unsplash.com/photo-1685318182443-473579444645?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p21", label: "Lavender Rows", url: "https://images.unsplash.com/photo-1687878267753-cb6421710196?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p22", label: "Wildflower Meadow", url: "https://images.unsplash.com/photo-1716562765369-9a526b58fa80?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p23", label: "Pink Tulips", url: "https://images.unsplash.com/photo-1713791234524-101f51b9845d?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p24", label: "Red & Yellow Tulips", url: "https://images.unsplash.com/photo-1673707017129-cdedff0074e5?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p25", label: "Lavender Sunset", url: "https://images.unsplash.com/photo-1733690210785-8a48c7895083?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p26", label: "Purple Tulip Buds", url: "https://images.unsplash.com/photo-1759545160982-a28852c6c499?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p27", label: "Hyacinth Field", url: "https://images.unsplash.com/photo-1438927544140-ca5e72fcd6c2?w=1600&h=350&fit=crop&crop=center&q=80" },
    ],
  },
  {
    label: "Cities",
    photos: [
      { id: "p28", label: "Brooklyn Bridge", url: "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p29", label: "City Skyline Bridge", url: "https://images.unsplash.com/photo-1679441241134-e0edba861927?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p30", label: "NYC Skyline Dusk", url: "https://images.unsplash.com/photo-1764782979306-1e489462d895?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p31", label: "Pittsburgh Skyline", url: "https://images.unsplash.com/photo-1761405378313-622deb755731?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p32", label: "City Bridge View", url: "https://images.unsplash.com/photo-1653866114444-4c8f42f0b60d?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p33", label: "Brooklyn & Manhattan", url: "https://images.unsplash.com/photo-1759022404068-db0d4dde2723?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p34", label: "City Night Bridge", url: "https://images.unsplash.com/photo-1715645942867-4c8649966352?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p35", label: "Sunset Skyline", url: "https://images.unsplash.com/photo-1731331344306-ad4f902691a3?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p36", label: "City Panorama", url: "https://images.unsplash.com/photo-1722019778730-751fdbae1541?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p37", label: "Night Bridge Skyline", url: "https://images.unsplash.com/photo-1718351174721-1f02f18b8a40?w=1600&h=350&fit=crop&crop=center&q=80" },
    ],
  },
  {
    label: "Abstract & Space",
    photos: [
      { id: "p38", label: "Curved Gradient", url: "https://images.unsplash.com/photo-1741447096087-1171841c42dc?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p39", label: "Color Gradient", url: "https://images.unsplash.com/photo-1512567100135-223e140cd167?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p40", label: "Gradient Squares", url: "https://images.unsplash.com/photo-1766341055866-dc18c44eeb86?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p41", label: "Warm Gradient", url: "https://images.unsplash.com/photo-1762716514363-13d1fad2c854?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p42", label: "Blue Pink Waves", url: "https://images.unsplash.com/photo-1758843405103-41fcaaee080c?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p43", label: "Milky Way Mountains", url: "https://images.unsplash.com/photo-1765825365130-52e276bca060?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p44", label: "Milky Way Galaxy", url: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p45", label: "Starry Night Sky", url: "https://images.unsplash.com/photo-1742626157111-59f3f1019a8a?w=1600&h=350&fit=crop&crop=center&q=80" },
    ],
  },
  {
    label: "Travel & Roads",
    photos: [
      { id: "p46", label: "Iceland Road", url: "https://images.unsplash.com/photo-1731925116590-c27d25490ea0?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p47", label: "Desert Road", url: "https://images.unsplash.com/photo-1470192581780-bf0a1cb67135?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p48", label: "Forest Road", url: "https://images.unsplash.com/photo-1767450327267-8075d82d4924?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p49", label: "Mountain Road", url: "https://images.unsplash.com/photo-1609542468909-3cb0ca173d2e?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p50", label: "Peaks Above Clouds", url: "https://images.unsplash.com/photo-1760705186270-b533668b60c2?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p51", label: "Mountain Dirt Road", url: "https://images.unsplash.com/photo-1733222376764-9ed9b1f6dc06?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p52", label: "Misty Winding Road", url: "https://images.unsplash.com/photo-1758799009701-be038ef40ee2?w=1600&h=350&fit=crop&crop=center&q=80" },
    ],
  },
  {
    label: "Ocean & Beach",
    photos: [
      { id: "p53", label: "Aerial Coastline", url: "https://images.unsplash.com/photo-1451186859696-371d9477be93?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p54", label: "Coastal City", url: "https://images.unsplash.com/photo-1577625627933-913f95bdb320?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p55", label: "Aerial Waves", url: "https://images.unsplash.com/photo-1744648617182-519c4bf39e30?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p56", label: "Aerial Beach", url: "https://images.unsplash.com/photo-1739862836703-03eca4457f77?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p57", label: "Beach Shore Waves", url: "https://images.unsplash.com/photo-1710790095456-6b122a198033?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p58", label: "Ocean Waves", url: "https://images.unsplash.com/photo-1627302800387-8dbab13aefba?w=1600&h=350&fit=crop&crop=center&q=80" },
      { id: "p59", label: "Sandy Beach Aerial", url: "https://images.unsplash.com/photo-1736774635366-c2fa40e86409?w=1600&h=350&fit=crop&crop=center&q=80" },
    ],
  },
];

/** Flat list of all photo covers for lookup by ID. */
export const PHOTO_COVERS: PhotoCover[] = PHOTO_COVER_CATEGORIES.flatMap((cat) => cat.photos);

/**
 * Checks if the cover value is a preset reference (solid, gradient, or photo).
 *
 * @param url - The cover URL string
 * @returns True if url is a "preset:ID" reference
 */
export function isPreset(url: string): boolean {
  return url.startsWith("preset:");
}

/**
 * Returns the CSS background value or image URL for a preset.
 * Handles solid (s*), gradient (g*), and photo (p*) presets.
 *
 * @param url - The cover URL in "preset:ID" format
 * @returns Object with either `background` CSS string or `imageUrl`
 */
export function resolvePreset(url: string): { background?: string; imageUrl?: string } {
  const id = url.replace("preset:", "");
  const solid = SOLID_COVERS.find((p) => p.id === id);
  if (solid) return { background: solid.color };
  const gradient = GRADIENT_COVERS.find((p) => p.id === id);
  if (gradient) return { background: gradient.style };
  const photo = PHOTO_COVERS.find((p) => p.id === id);
  if (photo) return { imageUrl: photo.url };
  return { background: GRADIENT_COVERS[0].style };
}
