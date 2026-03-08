/**
 * Shared props interface for all Google Calendar display components.
 * Each display receives events, colors, and display preferences.
 */

import type { GCalEvent } from "@/lib/types";

export interface GCalDisplayProps {
  /** Array of calendar events to render. */
  events: GCalEvent[];
  /** Map of calendarId → hex color for event fallback coloring. */
  calendarColors: Record<string, string>;
  /** Default accent color when no calendar/event color is available. */
  fallbackColor: string;
  /** Whether widget is in compact mode (small size). */
  compact: boolean;
}
