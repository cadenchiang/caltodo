/**
 * Built-in board templates for the Home dashboard.
 * Each template defines a complete PersistedLayout that can be applied
 * to replace the user's current board.
 *
 * @module board-templates
 */

import type { PersistedLayout } from "@/lib/board-layout-types";
import { SCHEMA_VERSION, DEFAULT_COVER_HEIGHT, DEFAULT_COVER_POSITION_Y } from "@/lib/board-layout-types";

/** Template category for organizing in the picker. */
export type TemplateCategory = "popular" | "productivity" | "lifestyle" | "starter";

/** Template metadata for display in the picker. */
export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  /** Widget type strings for preview pills. */
  previewWidgets: string[];
  layout: PersistedLayout;
}

/** Category labels and order for the picker sidebar. */
export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "productivity", label: "Productivity" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "starter", label: "Starter" },
];

/**
 * Creates a base PersistedLayout with sensible defaults.
 *
 * @param overrides - Partial layout to merge
 * @returns Complete PersistedLayout
 */
function base(overrides: Partial<PersistedLayout>): PersistedLayout {
  return {
    version: SCHEMA_VERSION,
    widgets: [],
    layouts: { lg: [], md: [], sm: [] },
    boardTitle: "My Board",
    boardDescription: "",
    coverImageUrl: "",
    boardEmoji: "\u{1F4D6}",
    iconSize: "md",
    titleFontFamily: "",
    titleTextColor: "",
    titleFontSize: "lg",
    coverHeight: DEFAULT_COVER_HEIGHT,
    coverPositionY: DEFAULT_COVER_POSITION_Y,
    updatedAt: Date.now(),
    ...overrides,
  };
}

/** Built-in board templates. */
export const BOARD_TEMPLATES: BoardTemplate[] = [
  // ── Popular ──
  {
    id: "productivity",
    name: "Productivity Hub",
    description: "Tasks, calendar, clock, weather, and focus timer — everything you need.",
    category: "popular",
    previewWidgets: ["tasks-today", "google-calendar", "clock", "weather", "pomodoro", "image"],
    layout: base({
      boardTitle: "My Board",
      boardEmoji: "(..\u02C6\u02F0\u02C6..)",
      boardDescription: "Life is better when you smile.",
      coverImageUrl: "preset:p8",
      coverHeight: 200,
      coverPositionY: 30,
      widgets: [
        { id: "t-tasks", type: "tasks-today", config: {} },
        { id: "t-gcal", type: "google-calendar", config: {} },
        { id: "t-image", type: "image", config: {} },
        { id: "t-clock", type: "clock", config: {} },
        { id: "t-pomodoro", type: "pomodoro", config: {} },
        { id: "t-weather", type: "weather", config: {} },
      ],
      layouts: {
        lg: [
          { i: "t-tasks", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-gcal", x: 2, y: 0, w: 2, h: 3 },
          { i: "t-image", x: 4, y: 0, w: 1, h: 3 },
          { i: "t-clock", x: 5, y: 0, w: 2, h: 2 },
          { i: "t-pomodoro", x: 5, y: 2, w: 2, h: 2 },
          { i: "t-weather", x: 0, y: 2, w: 2, h: 2 },
        ],
        md: [
          { i: "t-tasks", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-gcal", x: 2, y: 0, w: 2, h: 3 },
          { i: "t-image", x: 4, y: 0, w: 1, h: 3 },
          { i: "t-clock", x: 5, y: 0, w: 2, h: 2 },
          { i: "t-pomodoro", x: 5, y: 2, w: 2, h: 2 },
          { i: "t-weather", x: 0, y: 2, w: 2, h: 2 },
        ],
        sm: [
          { i: "t-tasks", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-gcal", x: 0, y: 2, w: 2, h: 3 },
          { i: "t-clock", x: 0, y: 5, w: 2, h: 2 },
          { i: "t-weather", x: 0, y: 7, w: 2, h: 2 },
          { i: "t-pomodoro", x: 0, y: 9, w: 2, h: 2 },
          { i: "t-image", x: 0, y: 11, w: 2, h: 2 },
        ],
      },
    }),
  },
  {
    id: "social",
    name: "Social Dashboard",
    description: "Cal Chat, quick links, and your schedule — stay connected.",
    category: "popular",
    previewWidgets: ["cal-chat", "google-calendar", "quick-links", "weather", "clock"],
    layout: base({
      boardTitle: "My Dashboard",
      boardEmoji: "\u{1F680}",
      boardDescription: "",
      coverImageUrl: "preset:g1",
      coverHeight: 200,
      coverPositionY: 50,
      widgets: [
        { id: "t-chat", type: "cal-chat", config: {} },
        { id: "t-gcal", type: "google-calendar", config: {} },
        { id: "t-links", type: "quick-links", config: {} },
        { id: "t-weather", type: "weather", config: {} },
        { id: "t-clock", type: "clock", config: {} },
      ],
      layouts: {
        lg: [
          { i: "t-chat", x: 0, y: 0, w: 3, h: 3 },
          { i: "t-gcal", x: 3, y: 0, w: 3, h: 3 },
          { i: "t-links", x: 6, y: 0, w: 2, h: 2 },
          { i: "t-weather", x: 6, y: 2, w: 2, h: 2 },
          { i: "t-clock", x: 0, y: 3, w: 2, h: 2 },
        ],
        md: [
          { i: "t-chat", x: 0, y: 0, w: 3, h: 3 },
          { i: "t-gcal", x: 3, y: 0, w: 3, h: 3 },
          { i: "t-links", x: 0, y: 3, w: 2, h: 2 },
          { i: "t-weather", x: 2, y: 3, w: 2, h: 2 },
          { i: "t-clock", x: 4, y: 3, w: 2, h: 2 },
        ],
        sm: [
          { i: "t-chat", x: 0, y: 0, w: 2, h: 3 },
          { i: "t-gcal", x: 0, y: 3, w: 2, h: 3 },
          { i: "t-links", x: 0, y: 6, w: 2, h: 2 },
          { i: "t-weather", x: 0, y: 8, w: 2, h: 2 },
          { i: "t-clock", x: 0, y: 10, w: 2, h: 2 },
        ],
      },
    }),
  },

  // ── Productivity ──
  {
    id: "study",
    name: "Study Mode",
    description: "Focus timer, class progress, tasks, and notes — built for studying.",
    category: "productivity",
    previewWidgets: ["pomodoro", "class-progress", "tasks-today", "notes", "countdown"],
    layout: base({
      boardTitle: "Study Zone",
      boardEmoji: "\u{1F4DA}",
      boardDescription: "Stay focused, stay sharp.",
      coverImageUrl: "preset:g4",
      coverHeight: 180,
      coverPositionY: 50,
      widgets: [
        { id: "t-pomodoro", type: "pomodoro", config: {} },
        { id: "t-progress", type: "class-progress", config: {} },
        { id: "t-tasks", type: "tasks-today", config: {} },
        { id: "t-notes", type: "notes", config: {} },
        { id: "t-countdown", type: "countdown", config: {} },
      ],
      layouts: {
        lg: [
          { i: "t-pomodoro", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-progress", x: 2, y: 0, w: 2, h: 2 },
          { i: "t-tasks", x: 4, y: 0, w: 2, h: 3 },
          { i: "t-notes", x: 6, y: 0, w: 2, h: 3 },
          { i: "t-countdown", x: 0, y: 2, w: 2, h: 1 },
        ],
        md: [
          { i: "t-pomodoro", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-progress", x: 2, y: 0, w: 2, h: 2 },
          { i: "t-tasks", x: 4, y: 0, w: 2, h: 3 },
          { i: "t-notes", x: 0, y: 3, w: 3, h: 2 },
          { i: "t-countdown", x: 0, y: 2, w: 2, h: 1 },
        ],
        sm: [
          { i: "t-pomodoro", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-tasks", x: 0, y: 2, w: 2, h: 2 },
          { i: "t-progress", x: 0, y: 4, w: 2, h: 2 },
          { i: "t-notes", x: 0, y: 6, w: 2, h: 2 },
          { i: "t-countdown", x: 0, y: 8, w: 2, h: 1 },
        ],
      },
    }),
  },
  {
    id: "planner",
    name: "Daily Planner",
    description: "Tasks, calendar, countdown, and habits — plan your day.",
    category: "productivity",
    previewWidgets: ["tasks-today", "google-calendar", "countdown", "habit-tracker", "notes"],
    layout: base({
      boardTitle: "Daily Planner",
      boardEmoji: "\u{1F5D3}\u{FE0F}",
      boardDescription: "Plan your day, own your time.",
      coverImageUrl: "preset:p14",
      coverHeight: 180,
      coverPositionY: 60,
      widgets: [
        { id: "t-tasks", type: "tasks-today", config: {} },
        { id: "t-gcal", type: "google-calendar", config: {} },
        { id: "t-countdown", type: "countdown", config: {} },
        { id: "t-habits", type: "habit-tracker", config: {} },
        { id: "t-notes", type: "notes", config: {} },
      ],
      layouts: {
        lg: [
          { i: "t-tasks", x: 0, y: 0, w: 3, h: 3 },
          { i: "t-gcal", x: 3, y: 0, w: 3, h: 3 },
          { i: "t-countdown", x: 6, y: 0, w: 2, h: 1 },
          { i: "t-habits", x: 6, y: 1, w: 2, h: 2 },
          { i: "t-notes", x: 0, y: 3, w: 3, h: 2 },
        ],
        md: [
          { i: "t-tasks", x: 0, y: 0, w: 3, h: 3 },
          { i: "t-gcal", x: 3, y: 0, w: 3, h: 3 },
          { i: "t-countdown", x: 0, y: 3, w: 2, h: 1 },
          { i: "t-habits", x: 2, y: 3, w: 2, h: 2 },
          { i: "t-notes", x: 4, y: 3, w: 2, h: 2 },
        ],
        sm: [
          { i: "t-tasks", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-gcal", x: 0, y: 2, w: 2, h: 3 },
          { i: "t-countdown", x: 0, y: 5, w: 2, h: 1 },
          { i: "t-habits", x: 0, y: 6, w: 2, h: 2 },
          { i: "t-notes", x: 0, y: 8, w: 2, h: 2 },
        ],
      },
    }),
  },

  // ── Lifestyle ──
  {
    id: "vibes",
    name: "Aesthetic Vibes",
    description: "Clock, weather, image, quote, and spotify — set the mood.",
    category: "lifestyle",
    previewWidgets: ["clock", "weather", "image", "quote", "spotify"],
    layout: base({
      boardTitle: "My Space",
      boardEmoji: "\u{1F338}",
      boardDescription: "",
      coverImageUrl: "preset:p19",
      coverHeight: 240,
      coverPositionY: 40,
      widgets: [
        { id: "t-clock", type: "clock", config: {} },
        { id: "t-weather", type: "weather", config: {} },
        { id: "t-image", type: "image", config: {} },
        { id: "t-quote", type: "quote", config: {} },
        { id: "t-spotify", type: "spotify", config: {} },
      ],
      layouts: {
        lg: [
          { i: "t-clock", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-image", x: 2, y: 0, w: 2, h: 3 },
          { i: "t-quote", x: 4, y: 0, w: 2, h: 2 },
          { i: "t-weather", x: 0, y: 2, w: 2, h: 2 },
          { i: "t-spotify", x: 6, y: 0, w: 2, h: 2 },
        ],
        md: [
          { i: "t-clock", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-image", x: 2, y: 0, w: 2, h: 3 },
          { i: "t-quote", x: 4, y: 0, w: 2, h: 2 },
          { i: "t-weather", x: 0, y: 2, w: 2, h: 2 },
          { i: "t-spotify", x: 4, y: 2, w: 2, h: 2 },
        ],
        sm: [
          { i: "t-clock", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-image", x: 0, y: 2, w: 2, h: 2 },
          { i: "t-weather", x: 0, y: 4, w: 2, h: 2 },
          { i: "t-quote", x: 0, y: 6, w: 2, h: 2 },
          { i: "t-spotify", x: 0, y: 8, w: 2, h: 2 },
        ],
      },
    }),
  },
  {
    id: "wellness",
    name: "Wellness Tracker",
    description: "Habits, weather, notes, and a quote — track your daily wellness.",
    category: "lifestyle",
    previewWidgets: ["habit-tracker", "weather", "notes", "quote", "clock"],
    layout: base({
      boardTitle: "Wellness",
      boardEmoji: "\u{1F33F}",
      boardDescription: "Take care of yourself.",
      coverImageUrl: "preset:g12",
      coverHeight: 160,
      coverPositionY: 50,
      widgets: [
        { id: "t-habits", type: "habit-tracker", config: {} },
        { id: "t-weather", type: "weather", config: {} },
        { id: "t-notes", type: "notes", config: {} },
        { id: "t-quote", type: "quote", config: {} },
        { id: "t-clock", type: "clock", config: {} },
      ],
      layouts: {
        lg: [
          { i: "t-habits", x: 0, y: 0, w: 3, h: 3 },
          { i: "t-weather", x: 3, y: 0, w: 2, h: 2 },
          { i: "t-clock", x: 5, y: 0, w: 2, h: 2 },
          { i: "t-notes", x: 3, y: 2, w: 2, h: 2 },
          { i: "t-quote", x: 5, y: 2, w: 2, h: 2 },
        ],
        md: [
          { i: "t-habits", x: 0, y: 0, w: 3, h: 3 },
          { i: "t-weather", x: 3, y: 0, w: 2, h: 2 },
          { i: "t-clock", x: 5, y: 0, w: 2, h: 2 },
          { i: "t-notes", x: 0, y: 3, w: 3, h: 2 },
          { i: "t-quote", x: 3, y: 3, w: 3, h: 2 },
        ],
        sm: [
          { i: "t-habits", x: 0, y: 0, w: 2, h: 3 },
          { i: "t-weather", x: 0, y: 3, w: 2, h: 2 },
          { i: "t-clock", x: 0, y: 5, w: 2, h: 2 },
          { i: "t-notes", x: 0, y: 7, w: 2, h: 2 },
          { i: "t-quote", x: 0, y: 9, w: 2, h: 2 },
        ],
      },
    }),
  },

  // ── Starter ──
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple — just tasks and calendar.",
    category: "starter",
    previewWidgets: ["tasks-today", "google-calendar", "weather"],
    layout: base({
      boardTitle: "My Board",
      boardEmoji: "\u{1F4CB}",
      boardDescription: "",
      coverImageUrl: "preset:s1",
      coverHeight: 120,
      coverPositionY: 50,
      widgets: [
        { id: "t-tasks", type: "tasks-today", config: {} },
        { id: "t-gcal", type: "google-calendar", config: {} },
        { id: "t-weather", type: "weather", config: {} },
      ],
      layouts: {
        lg: [
          { i: "t-tasks", x: 0, y: 0, w: 3, h: 3 },
          { i: "t-gcal", x: 3, y: 0, w: 3, h: 3 },
          { i: "t-weather", x: 6, y: 0, w: 2, h: 2 },
        ],
        md: [
          { i: "t-tasks", x: 0, y: 0, w: 3, h: 3 },
          { i: "t-gcal", x: 3, y: 0, w: 3, h: 3 },
          { i: "t-weather", x: 0, y: 3, w: 2, h: 2 },
        ],
        sm: [
          { i: "t-tasks", x: 0, y: 0, w: 2, h: 2 },
          { i: "t-gcal", x: 0, y: 2, w: 2, h: 3 },
          { i: "t-weather", x: 0, y: 5, w: 2, h: 2 },
        ],
      },
    }),
  },
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start fresh with an empty board.",
    category: "starter",
    previewWidgets: [],
    layout: base({
      boardTitle: "My Board",
      boardEmoji: "\u{2728}",
      boardDescription: "Tap edit to start building your board.",
      coverImageUrl: "",
      coverHeight: DEFAULT_COVER_HEIGHT,
    }),
  },
];
