import { Inbox, CalendarDays } from "lucide-react";

/**
 * Navigation items for the sidebar.
 * Settings is accessed via the profile popup only.
 */
export const NAV_ITEMS = [
  { label: "Inbox", href: "/app/inbox", icon: Inbox },
  { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
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
  "#10B981": "#ffffff", // green → white
  "#F59E0B": "#f9dde5", // amber → very pale blush
  "#8B5CF6": "#8c3060", // violet → dark berry
  "#EC4899": "#f4a0bc", // pink → medium pink
  "#06B6D4": "#fce8ef", // cyan → near-white pink
  "#F97316": "#d4567e", // orange → warm rose
  "#D1D5DB": "#f0c0d0", // light gray fallback → soft pink
};

export function getMiffyColor(color: string | null | undefined): string {
  if (!color) return MIFFY_COLOR_MAP["#D1D5DB"];
  return MIFFY_COLOR_MAP[color.toUpperCase()] ?? MIFFY_COLOR_MAP[color] ?? "#e8729a";
}
