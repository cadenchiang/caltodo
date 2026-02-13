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
