/**
 * Barrel exports for weather display components.
 * Provides WEATHER_DISPLAY_MAP for dynamic display lookup by ID.
 */

import type { ComponentType } from "react";
import type { WeatherDisplayProps } from "./types";
import StandardDisplay from "./StandardDisplay";
import MinimalDisplay from "./MinimalDisplay";
import CardDisplay from "./CardDisplay";
import GradientDisplay from "./GradientDisplay";
import DetailedDisplay from "./DetailedDisplay";

export { default as StandardDisplay } from "./StandardDisplay";
export { default as MinimalDisplay } from "./MinimalDisplay";
export { default as CardDisplay } from "./CardDisplay";
export { default as GradientDisplay } from "./GradientDisplay";
export { default as DetailedDisplay } from "./DetailedDisplay";
export type { WeatherDisplayProps } from "./types";

/** Maps weather display IDs to their React components. */
export const WEATHER_DISPLAY_MAP: Record<string, ComponentType<WeatherDisplayProps>> = {
  standard: StandardDisplay,
  minimal: MinimalDisplay,
  card: CardDisplay,
  gradient: GradientDisplay,
  detailed: DetailedDisplay,
};
