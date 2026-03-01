/**
 * Weather icon mapping from WMO codes to Lucide React components.
 * Replaces emoji-based weather icons with proper SVG icons.
 *
 * @module weather-icons
 */

import React from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Thermometer,
} from "lucide-react";

/** WMO weather code to Lucide icon component + label. */
const WMO_MAP: Record<
  number,
  { icon: React.ComponentType<{ size?: number; className?: string }>; label: string }
> = {
  0: { icon: Sun, label: "Clear" },
  1: { icon: CloudSun, label: "Mostly Clear" },
  2: { icon: CloudSun, label: "Partly Cloudy" },
  3: { icon: Cloud, label: "Overcast" },
  45: { icon: CloudFog, label: "Foggy" },
  48: { icon: CloudFog, label: "Icy Fog" },
  51: { icon: CloudDrizzle, label: "Light Drizzle" },
  53: { icon: CloudDrizzle, label: "Drizzle" },
  55: { icon: CloudRain, label: "Heavy Drizzle" },
  61: { icon: CloudRain, label: "Light Rain" },
  63: { icon: CloudRain, label: "Rain" },
  65: { icon: CloudRain, label: "Heavy Rain" },
  71: { icon: CloudSnow, label: "Light Snow" },
  73: { icon: CloudSnow, label: "Snow" },
  75: { icon: Snowflake, label: "Heavy Snow" },
  80: { icon: CloudDrizzle, label: "Showers" },
  81: { icon: CloudRain, label: "Moderate Showers" },
  82: { icon: CloudRain, label: "Heavy Showers" },
  95: { icon: CloudLightning, label: "Thunderstorm" },
  96: { icon: CloudLightning, label: "Thunderstorm + Hail" },
  99: { icon: CloudLightning, label: "Heavy Thunderstorm" },
};

/**
 * Returns a Lucide icon element for the given WMO weather code.
 *
 * @param code - WMO weather code
 * @param size - Icon size in pixels (default: 20)
 * @returns JSX element rendering the appropriate weather icon
 */
export function getWeatherIcon(code: number, size: number = 20): React.ReactElement {
  const entry = WMO_MAP[code] || { icon: Thermometer, label: "Unknown" };
  const Icon = entry.icon;
  return <Icon size={size} />;
}

/**
 * Returns the weather condition label for a WMO code.
 *
 * @param code - WMO weather code
 * @returns Human-readable weather condition string
 */
export function getWeatherLabel(code: number): string {
  return (WMO_MAP[code] || { label: "Unknown" }).label;
}
