import { LayoutGrid, Inbox, CalendarDays, NotebookPen, Users } from "lucide-react";

/**
 * Navigation items for the sidebar.
 * Settings is accessed via the profile popup only.
 */
export const NAV_ITEMS = [
  { label: "Board", href: "/app/home", icon: LayoutGrid },
  { label: "Inbox", href: "/app/inbox", icon: Inbox },
  { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
  { label: "Notes", href: "/app/notes", icon: NotebookPen },
  { label: "Chat", href: "/app/discussions", icon: Users },
] as const;

/**
 * Available task colors for the color picker.
 */
export const TASK_COLORS = [
  "#9CA3AF", // gray (default)
  "#3B82F6", // blue
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
export const DEFAULT_TASK_COLOR = "#3B82F6";

/**
 * Miffy theme pink-shade mapping for task colors.
 * Each default color maps to a distinct pink/rose shade for visual differentiation.
 *
 * @param color - Original task hex color
 * @returns Pink-mapped hex color if Miffy mapping exists, otherwise a default blush pink
 */
const MIFFY_COLOR_MAP: Record<string, string> = {
  "#9CA3AF": "#c8b0b8", // gray → warm taupe-pink
  "#3B82F6": "#e8729a", // blue → bold rose pink
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
  "#3B82F6": "#5e81ac", // blue → nord frost blue
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
  "#3B82F6": "#a03040", // blue → bold burgundy
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
  "#3B82F6": "#3a6cf0", // blue → electric blue
  "#EF4444": "#e05050", // red → bright red
  "#10B981": "#40a888", // green → teal green
  "#F59E0B": "#d8a040", // amber → warm gold
  "#8B5CF6": "#6850d0", // violet → deep indigo
  "#EC4899": "#c050a0", // pink → magenta
  "#06B6D4": "#40a0d0", // cyan → bright cyan
  "#F97316": "#d87030", // orange → bold orange
  "#D1D5DB": "#7080a0", // light gray fallback
};

/** Map of color theme IDs to their task color remap tables. */
const THEME_COLOR_MAPS: Record<string, Record<string, string>> = {
  miffy: MIFFY_COLOR_MAP,
  nord: NORD_COLOR_MAP,
  rosewood: ROSEWOOD_COLOR_MAP,
  midnight: MIDNIGHT_COLOR_MAP,
};

/**
 * Returns the display color for a task, remapped for the active color theme.
 * Aesthetic themes (miffy, nord, rosewood, midnight) remap task colors.
 * Accent themes (ocean, forest, sunset, lavender) return the original color.
 *
 * @param color - Original task hex color (e.g. "#3B82F6")
 * @param colorTheme - Active color theme ID, or null for default
 * @returns Remapped hex color string, or the original color if no remapping exists
 */
export function getThemeColor(color: string | null | undefined, colorTheme: string | null | undefined): string {
  const map = colorTheme ? THEME_COLOR_MAPS[colorTheme] : undefined;
  if (!map) return color || "#6b7280";
  if (!color) return map["#D1D5DB"] ?? "#6b7280";
  return map[color.toUpperCase()] ?? map[color] ?? color;
}
