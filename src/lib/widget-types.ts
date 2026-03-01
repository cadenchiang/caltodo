/**
 * Widget type registry for the Home dashboard.
 * Defines available widget types, their size constraints, and default layout.
 *
 * @module widget-types
 */

import type { LayoutItem, ResponsiveLayouts } from "react-grid-layout";

/** All available widget type identifiers. */
export type WidgetType =
  | "recent-chat"
  | "tasks-today"
  | "clock"
  | "image"
  | "class-progress"
  | "google-calendar"
  | "notes"
  | "weather"
  | "cal-chat"
  | "pomodoro";

/** Configuration for a widget type: size constraints, display metadata. */
export interface WidgetTypeConfig {
  type: WidgetType;
  label: string;
  description: string;
  /** lucide-react icon name (resolved at render time). */
  iconName: string;
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
    label: "Tasks Today",
    description: "Today's tasks with completion count",
    iconName: "CheckSquare",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  clock: {
    type: "clock",
    label: "Clock",
    description: "Live time and date",
    iconName: "Clock",
    minW: 1, minH: 1, maxW: 3, maxH: 2,
    defaultW: 1, defaultH: 1,
  },
  image: {
    type: "image",
    label: "Image",
    description: "Drag-and-drop image display",
    iconName: "ImageIcon",
    minW: 1, minH: 1, maxW: 6, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "class-progress": {
    type: "class-progress",
    label: "Class Progress",
    description: "Per-course completion bars",
    iconName: "GraduationCap",
    minW: 2, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "recent-chat": {
    type: "recent-chat",
    label: "Recent Chat",
    description: "Latest messages from a course",
    iconName: "MessageSquare",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "google-calendar": {
    type: "google-calendar",
    label: "Google Calendar",
    description: "Upcoming events from Google Calendar",
    iconName: "Calendar",
    minW: 2, minH: 2, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  notes: {
    type: "notes",
    label: "Notes",
    description: "Quick inline notes",
    iconName: "FileText",
    minW: 1, minH: 1, maxW: 6, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  weather: {
    type: "weather",
    label: "Weather",
    description: "Current weather and forecast",
    iconName: "CloudSun",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  "cal-chat": {
    type: "cal-chat",
    label: "Cal Chat",
    description: "Recent messages from Cal Chat",
    iconName: "MessagesSquare",
    minW: 1, minH: 1, maxW: 4, maxH: 4,
    defaultW: 2, defaultH: 2,
  },
  pomodoro: {
    type: "pomodoro",
    label: "Pomodoro",
    description: "Focus timer with work and break intervals",
    iconName: "Timer",
    minW: 2, minH: 2, maxW: 3, maxH: 3,
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
 * Includes Tasks Today, Calendar, Clock, and Quick Stats.
 *
 * @returns Object with widgets array and corresponding layouts
 */
export function getDefaultLayout(): {
  widgets: WidgetInstance[];
  layouts: ResponsiveLayouts<string>;
} {
  const widgets: WidgetInstance[] = [
    { id: "default-tasks", type: "tasks-today", config: {} },
    { id: "default-notes", type: "notes", config: {} },
    { id: "default-clock", type: "clock", config: {} },
    { id: "default-weather", type: "weather", config: {} },
    { id: "default-progress", type: "class-progress", config: {} },
  ];

  /** lg: 8 columns — 2 filled rows. */
  const lg: LayoutItem[] = [
    { i: "default-tasks", x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
    { i: "default-notes", x: 2, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
    { i: "default-clock", x: 4, y: 0, w: 2, h: 1, minW: 1, minH: 1 },
    { i: "default-weather", x: 6, y: 0, w: 2, h: 1, minW: 1, minH: 1 },
    { i: "default-progress", x: 4, y: 1, w: 4, h: 1, minW: 2, minH: 1 },
  ];

  /** md: 4 columns — 3 filled rows. */
  const md: LayoutItem[] = [
    { i: "default-tasks", x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
    { i: "default-weather", x: 2, y: 0, w: 2, h: 1, minW: 1, minH: 1 },
    { i: "default-clock", x: 2, y: 1, w: 2, h: 1, minW: 1, minH: 1 },
    { i: "default-notes", x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 1 },
    { i: "default-progress", x: 2, y: 2, w: 2, h: 1, minW: 1, minH: 1 },
  ];

  /** sm: 2 columns — single-column stack. */
  const sm: LayoutItem[] = [
    { i: "default-tasks", x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
    { i: "default-weather", x: 0, y: 2, w: 2, h: 1, minW: 1, minH: 1 },
    { i: "default-clock", x: 0, y: 3, w: 2, h: 1, minW: 1, minH: 1 },
    { i: "default-notes", x: 0, y: 4, w: 2, h: 2, minW: 1, minH: 1 },
    { i: "default-progress", x: 0, y: 6, w: 2, h: 1, minW: 1, minH: 1 },
  ];

  return { widgets, layouts: { lg, md, sm } };
}
