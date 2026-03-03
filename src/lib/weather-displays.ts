/**
 * Weather display registry.
 * Defines available weather display IDs, labels, and descriptions
 * used by the WeatherDisplayPicker and WeatherWidget dispatcher.
 */

/** Union of all supported weather display identifiers. */
export type WeatherDisplayId =
  | "standard"
  | "minimal"
  | "card"
  | "gradient"
  | "detailed";

/** Metadata entry for a single weather display style. */
export interface WeatherDisplayMeta {
  id: WeatherDisplayId;
  label: string;
  description: string;
}

/** All available weather display options. */
export const WEATHER_DISPLAYS: WeatherDisplayMeta[] = [
  { id: "standard", label: "Standard", description: "Location, temp, description, stats" },
  { id: "minimal", label: "Minimal", description: "Just temp and icon" },
  { id: "card", label: "Card", description: "Large icon with temp below" },
  { id: "gradient", label: "Gradient", description: "Dynamic gradient background" },
  { id: "detailed", label: "Detailed", description: "Extra stats in a grid" },
];

/** Default weather display for new or migrated widgets. */
export const DEFAULT_WEATHER_DISPLAY: WeatherDisplayId = "standard";
