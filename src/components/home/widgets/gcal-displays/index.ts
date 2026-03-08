/**
 * Google Calendar display component map.
 * Maps display IDs to their React components.
 * Used by GoogleCalendarWidget to render the selected display style.
 */

import type { ComponentType } from "react";
import type { GCalDisplayProps } from "./types";
import ListDisplay from "./ListDisplay";
import CompactDisplay from "./CompactDisplay";
import CardsDisplay from "./CardsDisplay";
import TimelineDisplay from "./TimelineDisplay";
import AgendaDisplay from "./AgendaDisplay";

/** Map of display ID to component. */
export const GCAL_DISPLAY_MAP: Record<string, ComponentType<GCalDisplayProps>> = {
  list: ListDisplay,
  compact: CompactDisplay,
  cards: CardsDisplay,
  timeline: TimelineDisplay,
  agenda: AgendaDisplay,
};

export type { GCalDisplayProps } from "./types";
