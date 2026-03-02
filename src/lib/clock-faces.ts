/**
 * Clock face registry.
 * Defines available clock face IDs, labels, and descriptions
 * used by the ClockFacePicker and ClockWidget dispatcher.
 */

/** Union of all supported clock face identifiers. */
export type ClockFaceId = "digital" | "analog" | "minimal" | "flip" | "stacked";

/** Metadata entry for a single clock face style. */
export interface ClockFaceMeta {
  id: ClockFaceId;
  label: string;
  description: string;
}

/** All available clock face options. */
export const CLOCK_FACES: ClockFaceMeta[] = [
  { id: "digital", label: "Digital", description: "Time with date below" },
  { id: "analog", label: "Analog", description: "Classic round clock" },
  { id: "minimal", label: "Minimal", description: "Time only, oversized" },
  { id: "flip", label: "Flip", description: "Retro flip-card digits" },
  { id: "stacked", label: "Stacked", description: "Hours large, minutes below" },
];

/** Default clock face for new or migrated widgets. */
export const DEFAULT_CLOCK_FACE: ClockFaceId = "digital";
