/**
 * Widget type registry for the Home dashboard.
 * Defines available widget types, their size constraints, and default layout.
 *
 * @module widget-types
 */

import type { ResponsiveLayouts } from "react-grid-layout";

/** All available widget type identifiers. */
export type WidgetType =
  | "tasks-today"
  | "clock"
  | "image"
  | "class-progress"
  | "google-calendar"
  | "notes"
  | "weather"
  | "cal-chat"
  | "pomodoro"
  | "countdown"
  | "quick-links"
  | "habit-tracker"
  | "quote"
  | "stats"
  | "weekly-heatmap"
  | "sticker"
  | "spotify"
  | "mini-calendar"
  | "daily-reminders"
  | "courses";

/** Category groupings for the widget gallery. */
export type WidgetCategory =
  | "popular"
  | "productivity"
  | "info"
  | "media"
  | "social";

/** Configuration for a widget type: size constraints, display metadata. */
export interface WidgetTypeConfig {
  type: WidgetType;
  label: string;
  description: string;
  /** lucide-react icon name (resolved at render time). */
  iconName: string;
  /** Gallery category for filtering. */
  category: WidgetCategory;
  /** If true, hidden from the widget gallery (archived). */
  hidden?: boolean;
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
  defaultW: number;
  defaultH: number;
}

/** A placed widget instance on the user's dashboard. */
export interface WidgetInstance {
  id: string;
  type: WidgetType;
  /** Per-widget config (e.g. courseId for recent-chat). */
  config: Record<string, string>;
}

/** Registry of all widget types with their constraints and display info. */
export const WIDGET_REGISTRY: Record<WidgetType, WidgetTypeConfig> = {
  "tasks-today": {
    type: "tasks-today",
    label: "Tasks",
    description: "Your tasks with completion count",
    iconName: "CheckSquare",
    category: "popular",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  clock: {
    type: "clock",
    label: "Clock",
    description: "Live time and date",
    iconName: "Clock",
    category: "popular",
    minW: 2, minH: 2, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 2,
  },
  image: {
    type: "image",
    label: "Image",
    description: "Drag-and-drop image display",
    iconName: "ImageIcon",
    category: "media",
    minW: 1, minH: 1, maxW: 6, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "class-progress": {
    type: "class-progress",
    label: "Class Progress",
    description: "Per-course completion bars",
    iconName: "GraduationCap",
    category: "info",
    minW: 2, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "google-calendar": {
    type: "google-calendar",
    label: "Google Calendar",
    description: "Upcoming events from Google Calendar",
    iconName: "Calendar",
    category: "popular",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  notes: {
    type: "notes",
    label: "Notes",
    description: "Quick inline notes",
    iconName: "FileText",
    category: "productivity",
    minW: 1, minH: 1, maxW: 6, maxH: 4,
    defaultW: 2, defaultH: 2,
    hidden: true,
  },
  weather: {
    type: "weather",
    label: "Weather",
    description: "Current weather and forecast",
    iconName: "CloudSun",
    category: "popular",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "cal-chat": {
    type: "cal-chat",
    label: "Cal Chat",
    description: "Recent messages from Cal Chat",
    iconName: "MessagesSquare",
    category: "social",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  pomodoro: {
    type: "pomodoro",
    label: "Pomodoro",
    description: "Focus timer with work and break intervals",
    iconName: "Timer",
    category: "popular",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  countdown: {
    type: "countdown",
    label: "Countdown",
    description: "Days until your next deadline or event",
    iconName: "Hourglass",
    category: "productivity",
    minW: 1, minH: 1, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 1,
  },
  "quick-links": {
    type: "quick-links",
    label: "Quick Links",
    description: "Pinned bookmarks with favicons",
    iconName: "Link",
    category: "productivity",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "habit-tracker": {
    type: "habit-tracker",
    label: "Habit Tracker",
    description: "GitHub-style heatmap with streaks",
    iconName: "Flame",
    category: "productivity",
    minW: 2, minH: 1, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 2,
  },
  quote: {
    type: "quote",
    label: "Quote",
    description: "Daily motivational quotes",
    iconName: "Quote",
    category: "media",
    minW: 1, minH: 1, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 1,
  },
  stats: {
    type: "stats",
    label: "Stats",
    description: "Task completion metrics and trends",
    iconName: "BarChart3",
    category: "info",
    minW: 1, minH: 1, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 1,
  },
  "weekly-heatmap": {
    type: "weekly-heatmap",
    label: "Activity",
    description: "Weekly productivity heatmap",
    iconName: "Grid3X3",
    category: "info",
    minW: 2, minH: 1, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 2,
  },
  sticker: {
    type: "sticker",
    label: "Sticker",
    description: "Decorative emoji or text",
    iconName: "Smile",
    category: "media",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 1, defaultH: 1,
  },
  spotify: {
    type: "spotify",
    label: "Spotify",
    description: "Embed a track, album, or playlist",
    iconName: "Music",
    category: "media",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "mini-calendar": {
    type: "mini-calendar",
    label: "Mini Calendar",
    description: "Current month grid with today highlighted",
    iconName: "CalendarDays",
    category: "info",
    minW: 1, minH: 1, maxW: 2, maxH: 2,
    defaultW: 1, defaultH: 1,
  },
  "daily-reminders": {
    type: "daily-reminders",
    label: "Daily Reminders",
    description: "Checkbox list that resets each day",
    iconName: "ListChecks",
    category: "productivity",
    minW: 1, minH: 1, maxW: 3, maxH: 3,
    defaultW: 1, defaultH: 2,
  },
  courses: {
    type: "courses",
    label: "Courses",
    description: "Course folders with task counts",
    iconName: "GraduationCap",
    category: "info",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
};

/**
 * Generates a unique widget instance ID.
 *
 * @returns A unique string ID prefixed with "w-"
 */
export function generateWidgetId(): string {
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Returns the default starter layout for first-time users.
 * Starts with a clean slate — no widgets, no banner.
 * Users add widgets via the edit mode gallery.
 *
 * @returns Object with empty widgets array and empty layouts
 */
export function getDefaultLayout(): {
  widgets: WidgetInstance[];
  layouts: ResponsiveLayouts<string>;
} {
  return { widgets: [], layouts: { lg: [], md: [], sm: [] } };
}
