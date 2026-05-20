/**
 * Widget type registry for the Home dashboard.
 * Defines available widget types, their size constraints, and default layout.
 *
 * @module widget-types
 */

import type { LayoutItem, ResponsiveLayouts } from "react-grid-layout";

/** All available widget type identifiers. */
export type WidgetType =
  | "profile"
  | "intro"
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
  profile: {
    type: "profile",
    label: "Profile",
    description: "Avatar, name, and operator status card",
    iconName: "User",
    category: "popular",
    minW: 2, minH: 2, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 2,
  },
  intro: {
    type: "intro",
    label: "Greeting",
    description: "Good afternoon banner with date + local clock",
    iconName: "Sunrise",
    category: "popular",
    minW: 3, minH: 1, maxW: 8, maxH: 2,
    defaultW: 4, defaultH: 1,
  },
  "tasks-today": {
    type: "tasks-today",
    label: "Tasks",
    description: "Your tasks with completion count",
    iconName: "CheckSquare",
    category: "popular",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
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
    hidden: true,
  },
  image: {
    type: "image",
    label: "Image",
    description: "Drag-and-drop image display",
    iconName: "ImageIcon",
    category: "media",
    minW: 2, minH: 2, maxW: 6, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "class-progress": {
    type: "class-progress",
    label: "Class Progress",
    description: "Per-course completion bars",
    iconName: "GraduationCap",
    category: "info",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "google-calendar": {
    type: "google-calendar",
    label: "Google Calendar",
    description: "Upcoming events from Google Calendar",
    iconName: "Calendar",
    category: "popular",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  notes: {
    type: "notes",
    label: "Notes",
    description: "Quick inline notes",
    iconName: "FileText",
    category: "productivity",
    minW: 2, minH: 2, maxW: 6, maxH: 4,
    defaultW: 2, defaultH: 2,
    hidden: true,
  },
  weather: {
    type: "weather",
    label: "Weather",
    description: "Current weather and forecast",
    iconName: "CloudSun",
    category: "popular",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "cal-chat": {
    type: "cal-chat",
    label: "Cal Chat",
    description: "Recent messages from Cal Chat",
    iconName: "MessagesSquare",
    category: "social",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
    // CalChat was removed from the product — keep the type registered
    // so any historical widget instances in the DB still resolve, but
    // hide from the gallery so nobody can add new ones.
    hidden: true,
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
    minW: 2, minH: 2, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 1,
    hidden: true,
  },
  "quick-links": {
    type: "quick-links",
    label: "Quick Links",
    description: "Pinned bookmarks with favicons",
    iconName: "Link",
    category: "productivity",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
    hidden: true,
  },
  "habit-tracker": {
    type: "habit-tracker",
    label: "Habit Tracker",
    description: "GitHub-style heatmap with streaks",
    iconName: "Flame",
    category: "productivity",
    minW: 2, minH: 2, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 2,
    hidden: true,
  },
  quote: {
    type: "quote",
    label: "Quote",
    description: "Daily motivational quotes",
    iconName: "Quote",
    category: "media",
    minW: 2, minH: 2, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 1,
    hidden: true,
  },
  stats: {
    type: "stats",
    label: "Stats",
    description: "Task completion metrics and trends",
    iconName: "BarChart3",
    category: "info",
    minW: 2, minH: 2, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 1,
    hidden: true,
  },
  "weekly-heatmap": {
    type: "weekly-heatmap",
    label: "Activity",
    description: "Weekly productivity heatmap",
    iconName: "Grid3X3",
    category: "info",
    minW: 2, minH: 2, maxW: 4, maxH: 3,
    defaultW: 2, defaultH: 2,
  },
  sticker: {
    type: "sticker",
    label: "Sticker",
    description: "Decorative emoji or text",
    iconName: "Smile",
    category: "media",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
    hidden: true,
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
    minW: 2, minH: 2, maxW: 2, maxH: 2,
    defaultW: 2, defaultH: 2,
    hidden: true,
  },
  "daily-reminders": {
    type: "daily-reminders",
    label: "Daily Reminders",
    description: "Checkbox list that resets each day",
    iconName: "ListChecks",
    category: "productivity",
    minW: 2, minH: 2, maxW: 3, maxH: 3,
    defaultW: 2, defaultH: 2,
    hidden: true,
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
 *
 * Mirrors the Jerrod-style dashboard reference: profile + greeting
 * banner on the top row, a tall image / calendar / tasks middle band,
 * Spotify "Now Playing" + countdown on the bottom row. Activity heatmap
 * stands in for the "steps" panel on the right. Lays out into the lg
 * (8-col) grid with vertical stacks for md (4-col) and sm (2-col) so
 * the same widget set degrades gracefully on smaller breakpoints.
 *
 * @returns Object with starter widgets array and a 4-row layout per
 *   breakpoint
 */
export function getDefaultLayout(): {
  widgets: WidgetInstance[];
  layouts: ResponsiveLayouts<string>;
} {
  const widgets: WidgetInstance[] = [
    { id: "default-profile", type: "profile", config: {} },
    { id: "default-intro", type: "intro", config: {} },
    { id: "default-heatmap", type: "weekly-heatmap", config: {} },
    { id: "default-gcal", type: "google-calendar", config: {} },
    { id: "default-tasks", type: "tasks-today", config: {} },
    { id: "default-image", type: "image", config: {} },
    { id: "default-spotify", type: "spotify", config: {} },
  ];

  // lg: 8 columns × 8 rows. Matches the reference screenshot:
  //   col  0   1   2   3   4   5   6   7
  // r 0–1  [profile 2x2 ][intro     4x2     ][heat   2x2]
  // r 2–5  [gcal       4x4         ][tasks 2x4][image  2x6]
  // r 6–7  [spotify    6x2         ]         [image continues]
  const lg: LayoutItem[] = [
    { i: "default-profile",   x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "default-intro",     x: 2, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: "default-heatmap",   x: 6, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "default-gcal",      x: 0, y: 2, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "default-tasks",     x: 4, y: 2, w: 2, h: 4, minW: 2, minH: 2 },
    { i: "default-image",     x: 6, y: 2, w: 2, h: 6, minW: 2, minH: 2 },
    { i: "default-spotify",   x: 0, y: 6, w: 6, h: 2, minW: 2, minH: 2 },
  ];

  // md / sm: stack vertically — every widget keeps its 2-row floor.
  const md: LayoutItem[] = [
    { i: "default-profile", x: 0, y: 0,  w: 4, h: 2, minW: 2, minH: 2 },
    { i: "default-intro",   x: 0, y: 2,  w: 4, h: 2, minW: 3, minH: 2 },
    { i: "default-gcal",    x: 0, y: 4,  w: 4, h: 3, minW: 2, minH: 2 },
    { i: "default-tasks",   x: 0, y: 7,  w: 4, h: 3, minW: 2, minH: 2 },
    { i: "default-heatmap", x: 0, y: 10, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "default-spotify", x: 0, y: 12, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "default-image",   x: 0, y: 14, w: 4, h: 3, minW: 2, minH: 2 },
  ];

  const sm: LayoutItem[] = md.map((item) => ({ ...item, w: 2 }));

  return { widgets, layouts: { lg, md, sm } };
}
