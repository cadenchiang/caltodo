/**
 * Barrel exports for clock face components.
 * Provides CLOCK_FACE_MAP for dynamic face lookup by ID.
 */

import type { ComponentType } from "react";
import type { ClockFaceProps } from "./types";
import DigitalFace from "./DigitalFace";
import AnalogFace from "./AnalogFace";
import MinimalFace from "./MinimalFace";
import FlipFace from "./FlipFace";
import StackedFace from "./StackedFace";
import SplitFace from "./SplitFace";

export { default as DigitalFace } from "./DigitalFace";
export { default as AnalogFace } from "./AnalogFace";
export { default as MinimalFace } from "./MinimalFace";
export { default as FlipFace } from "./FlipFace";
export { default as StackedFace } from "./StackedFace";
export { default as SplitFace } from "./SplitFace";
export type { ClockFaceProps } from "./types";

/** Maps clock face IDs to their React components. */
export const CLOCK_FACE_MAP: Record<string, ComponentType<ClockFaceProps>> = {
  digital: DigitalFace,
  analog: AnalogFace,
  minimal: MinimalFace,
  flip: FlipFace,
  stacked: StackedFace,
  split: SplitFace,
};
