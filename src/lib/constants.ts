import { LayoutGrid, Inbox, CalendarDays } from "lucide-react";

/**
 * Navigation items for the sidebar.
 *
 * Chat (CalChat / discussions) was removed from the product — the
 * sidebar no longer surfaces it and the CalChat widget is hidden in
 * the gallery. The /app/discussions route still exists for legacy
 * links but isn't promoted anywhere.
 */
export const NAV_ITEMS = [
  { label: "Home", href: "/app/home", icon: LayoutGrid, beta: true },
  { label: "Inbox", href: "/app/inbox", icon: Inbox },
  { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
] as const;

/**
 * Available task colors for the color picker.
 */
export const TASK_COLORS = [
  "#9CA3AF", // gray (default)
  "#0e89d6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
] as const;

/**
 * Default task color.
 */
export const DEFAULT_TASK_COLOR = "#0e89d6";

/**
 * Miffy theme pink-shade mapping for task colors.
 * Each default color maps to a distinct pink/rose shade for visual differentiation.
 *
 * @param color - Original task hex color
 * @returns Pink-mapped hex color if Miffy mapping exists, otherwise a default blush pink
 */
const MIFFY_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#c8b0b8", // gray → warm taupe-pink
  "#0e89d6": "#e8729a", // blue → bold rose pink
  "#EF4444": "#a83860", // red → deep magenta
  "#10B981": "#f2c4d4", // green → soft rose
  "#F59E0B": "#f9dde5", // amber → very pale blush
  "#8B5CF6": "#8c3060", // violet → dark berry
  "#EC4899": "#f4a0bc", // pink → medium pink
  "#06B6D4": "#fce8ef", // cyan → near-white pink
  "#F97316": "#d4567e", // orange → warm rose
  "#D1D5DB": "#f0c0d0", // light gray fallback → soft pink
};

/**
 * @deprecated Use getThemeColor(color, colorTheme) instead.
 */
export function getMiffyColor(color: string | null | undefined): string {
  if (!color) return MIFFY_COLOR_MAP["#D1D5DB"];
  return MIFFY_COLOR_MAP[color.toUpperCase()] ?? MIFFY_COLOR_MAP[color] ?? "#e8729a";
}

/** Nord theme: muted arctic tones for task colors. */
const NORD_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#7b88a0", // gray → nord muted gray
  "#0e89d6": "#5e81ac", // blue → nord frost blue
  "#EF4444": "#bf616a", // red → nord aurora red
  "#10B981": "#a3be8c", // green → nord aurora green
  "#F59E0B": "#ebcb8b", // amber → nord aurora yellow
  "#8B5CF6": "#b48ead", // violet → nord aurora purple
  "#EC4899": "#d08770", // pink → nord aurora orange
  "#06B6D4": "#88c0d0", // cyan → nord frost teal
  "#F97316": "#d08770", // orange → nord aurora orange
  "#D1D5DB": "#8890a0", // light gray fallback
};

/** Rosewood theme: warm wine-burgundy tones for task colors. */
const ROSEWOOD_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#a08080", // gray → warm taupe
  "#0e89d6": "#a03040", // blue → bold burgundy
  "#EF4444": "#801828", // red → deep wine
  "#10B981": "#c89898", // green → soft rose
  "#F59E0B": "#d8b0a0", // amber → warm peach
  "#8B5CF6": "#702040", // violet → dark berry
  "#EC4899": "#c06070", // pink → medium rose
  "#06B6D4": "#e0c0c0", // cyan → pale blush
  "#F97316": "#b04838", // orange → warm brick
  "#D1D5DB": "#c0a0a0", // light gray fallback
};

/** Midnight theme: electric blue accent tones for task colors. */
const MIDNIGHT_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#607090", // gray → slate blue
  "#0e89d6": "#3a6cf0", // blue → electric blue
  "#EF4444": "#e05050", // red → bright red
  "#10B981": "#40a888", // green → teal green
  "#F59E0B": "#d8a040", // amber → warm gold
  "#8B5CF6": "#6850d0", // violet → deep indigo
  "#EC4899": "#c050a0", // pink → magenta
  "#06B6D4": "#40a0d0", // cyan → bright cyan
  "#F97316": "#d87030", // orange → bold orange
  "#D1D5DB": "#7080a0", // light gray fallback
};

/** Forest theme — earthy greens and muted woods. */
const FOREST_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#94a08c", // gray → moss gray
  "#0e89d6": "#388038", // blue → forest primary green
  "#EF4444": "#a64030", // red → autumn red
  "#10B981": "#6b9a4a", // green → leafy green
  "#F59E0B": "#c89a4a", // amber → bark gold
  "#8B5CF6": "#7a5e94", // violet → wildflower violet
  "#EC4899": "#c87090", // pink → wildflower pink
  "#06B6D4": "#5aa890", // cyan → spring green
  "#F97316": "#c4682a", // orange → autumn orange
  "#D1D5DB": "#b8c0a8", // light gray fallback
};

/** Sunset theme — warm oranges and coral. */
const SUNSET_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#b89888", // gray → warm taupe
  "#0e89d6": "#d85828", // blue → sunset primary orange
  "#EF4444": "#a83020", // red → ember red
  "#10B981": "#d8a45c", // green → muted gold
  "#F59E0B": "#e8a040", // amber → bright sunset
  "#8B5CF6": "#a84860", // violet → dusky rose
  "#EC4899": "#e07060", // pink → coral
  "#06B6D4": "#d8a888", // cyan → sandstone
  "#F97316": "#e87040", // orange → vivid sunset
  "#D1D5DB": "#d8b8a0", // light gray fallback
};

/** Lavender theme — soft purples and violets. */
const LAVENDER_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#a098b0", // gray → cool lilac gray
  "#0e89d6": "#7248a8", // blue → lavender primary
  "#EF4444": "#9a3868", // red → magenta plum
  "#10B981": "#8888c8", // green → soft periwinkle
  "#F59E0B": "#c8a8c8", // amber → pale orchid
  "#8B5CF6": "#8a60c0", // violet → vibrant lavender
  "#EC4899": "#b06090", // pink → muted orchid
  "#06B6D4": "#a8a0d8", // cyan → pale lilac
  "#F97316": "#c87890", // orange → dusty rose
  "#D1D5DB": "#c8c0d8", // light gray fallback
};

/** Matcha theme — soft sage greens. */
const MATCHA_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#a0a890", // gray → matcha gray
  "#0e89d6": "#6a8858", // blue → matcha primary
  "#EF4444": "#a86058", // red → muted clay red
  "#10B981": "#7ca068", // green → bright sage
  "#F59E0B": "#c8b078", // amber → light wheat
  "#8B5CF6": "#888090", // violet → muted plum
  "#EC4899": "#b88090", // pink → dusty rose
  "#06B6D4": "#88a890", // cyan → mint sage
  "#F97316": "#b08868", // orange → warm tan
  "#D1D5DB": "#bcc4a8", // light gray fallback
};

/** Dracula theme — bold gothic purples. */
const DRACULA_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#9098b8", // gray → cool gray
  "#0e89d6": "#9060e0", // blue → dracula primary purple
  "#EF4444": "#e04848", // red → bright vampire red
  "#10B981": "#48d090", // green → bright green
  "#F59E0B": "#f0d048", // amber → bright yellow
  "#8B5CF6": "#a060f0", // violet → vivid violet
  "#EC4899": "#e070b0", // pink → hot pink
  "#06B6D4": "#48c8e0", // cyan → cyber cyan
  "#F97316": "#f08840", // orange → bright orange
  "#D1D5DB": "#a0a0c0", // light gray fallback
};

/** Cyber theme — neon cyberpunk teal/magenta. */
const CYBER_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#608890", // gray → muted cyber gray
  "#0e89d6": "#08a0a8", // blue → cyber primary teal
  "#EF4444": "#e02060", // red → neon magenta
  "#10B981": "#10c8a0", // green → neon teal
  "#F59E0B": "#e0c020", // amber → electric yellow
  "#8B5CF6": "#a040e0", // violet → neon purple
  "#EC4899": "#e040a0", // pink → hot magenta
  "#06B6D4": "#10c0d8", // cyan → vivid cyan
  "#F97316": "#e07020", // orange → bright orange
  "#D1D5DB": "#80a0a8", // light gray fallback
};

/** Sandstone theme — warm earthy neutrals. */
const SANDSTONE_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#a89888", // gray → warm taupe
  "#0e89d6": "#a87c54", // blue → sandstone primary
  "#EF4444": "#a85848", // red → terracotta
  "#10B981": "#88a878", // green → desert sage
  "#F59E0B": "#c89858", // amber → warm honey
  "#8B5CF6": "#88688c", // violet → muted plum
  "#EC4899": "#c08888", // pink → adobe rose
  "#06B6D4": "#90b0a8", // cyan → desert teal
  "#F97316": "#c87038", // orange → burnt orange
  "#D1D5DB": "#c0b0a0", // light gray fallback
};

/** Tokyo Night theme — deep blues with electric pop. */
const TOKYO_NIGHT_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#7c84a0", // gray → blue-gray
  "#0e89d6": "#4870c8", // blue → tokyo primary blue
  "#EF4444": "#d04860", // red → electric crimson
  "#10B981": "#48b8a0", // green → cool teal
  "#F59E0B": "#d8c060", // amber → warm yellow
  "#8B5CF6": "#a070e0", // violet → vivid purple
  "#EC4899": "#d870a8", // pink → bright pink
  "#06B6D4": "#5cb8e0", // cyan → bright sky
  "#F97316": "#e08858", // orange → soft orange
  "#D1D5DB": "#a0a8c0", // light gray fallback
};

/** Map of color theme IDs to their task color remap tables. */
const THEME_COLOR_MAPS: Record<string, Record<string, string>> = {
  miffy: MIFFY_COLOR_MAP,
  nord: NORD_COLOR_MAP,
  rosewood: ROSEWOOD_COLOR_MAP,
  midnight: MIDNIGHT_COLOR_MAP,
  forest: FOREST_COLOR_MAP,
  sunset: SUNSET_COLOR_MAP,
  lavender: LAVENDER_COLOR_MAP,
  matcha: MATCHA_COLOR_MAP,
  dracula: DRACULA_COLOR_MAP,
  cyber: CYBER_COLOR_MAP,
  sandstone: SANDSTONE_COLOR_MAP,
  "tokyo-night": TOKYO_NIGHT_COLOR_MAP,
};

/**
 * Returns the display color for a task, remapped for the active color theme.
 * Aesthetic themes (miffy, nord, rosewood, midnight) remap task colors.
 * Accent themes (ocean, forest, sunset, lavender) return the original color.
 *
 * @param color - Original task hex color (e.g. "#0e89d6")
 * @param colorTheme - Active color theme ID, or null for default
 * @returns Remapped hex color string, or the original color if no remapping exists
 */
export function getThemeColor(color: string | null | undefined, colorTheme: string | null | undefined): string {
  const map = colorTheme ? THEME_COLOR_MAPS[colorTheme] : undefined;
  if (!map) return color || "#6b7280";
  if (!color) return map["#D1D5DB"] ?? "#6b7280";
  return map[color.toUpperCase()] ?? map[color] ?? color;
}
