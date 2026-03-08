/**
 * Google Calendar display registry.
 * Defines available display style IDs, labels, and descriptions
 * used by the GCalDisplayPicker and GoogleCalendarWidget dispatcher.
 */

/** Union of all supported Google Calendar display identifiers. */
export type GCalDisplayId = "list" | "compact" | "cards" | "timeline" | "agenda";

/** Metadata entry for a single calendar display style. */
export interface GCalDisplayMeta {
  id: GCalDisplayId;
  label: string;
  description: string;
}

/** All available Google Calendar display options. */
export const GCAL_DISPLAYS: GCalDisplayMeta[] = [
  { id: "list", label: "List", description: "Events grouped by day" },
  { id: "compact", label: "Compact", description: "Minimal dense rows" },
  { id: "cards", label: "Cards", description: "Color-accented event cards" },
  { id: "timeline", label: "Timeline", description: "Vertical timeline dots" },
  { id: "agenda", label: "Agenda", description: "Bold times, clean layout" },
];

/** Default display for new or migrated widgets. */
export const DEFAULT_GCAL_DISPLAY: GCalDisplayId = "list";
