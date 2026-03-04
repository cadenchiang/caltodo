/**
 * Weather icon mapping from WMO codes to Lucide React components.
 * Replaces emoji-based weather icons with proper SVG icons.
 * Each entry includes a default color class for themed icon rendering.
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

/** WMO weather code to Lucide icon component, label, and default color. */
const WMO_MAP: Record<
  number,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    colorClass: string;
  }
> = {
  0: { icon: Sun, label: "Clear", colorClass: "text-amber-400" },
  1: { icon: CloudSun, label: "Mostly Clear", colorClass: "text-amber-300" },
  2: { icon: CloudSun, label: "Partly Cloudy", colorClass: "text-amber-300" },
  3: { icon: Cloud, label: "Overcast", colorClass: "text-gray-400" },
  45: { icon: CloudFog, label: "Foggy", colorClass: "text-gray-400" },
  48: { icon: CloudFog, label: "Icy Fog", colorClass: "text-gray-400" },
  51: { icon: CloudDrizzle, label: "Light Drizzle", colorClass: "text-blue-400" },
  53: { icon: CloudDrizzle, label: "Drizzle", colorClass: "text-blue-400" },
  55: { icon: CloudRain, label: "Heavy Drizzle", colorClass: "text-blue-400" },
  61: { icon: CloudRain, label: "Light Rain", colorClass: "text-blue-500" },
  63: { icon: CloudRain, label: "Rain", colorClass: "text-blue-500" },
  65: { icon: CloudRain, label: "Heavy Rain", colorClass: "text-blue-500" },
  71: { icon: CloudSnow, label: "Light Snow", colorClass: "text-sky-300" },
  73: { icon: CloudSnow, label: "Snow", colorClass: "text-sky-300" },
  75: { icon: Snowflake, label: "Heavy Snow", colorClass: "text-sky-300" },
  80: { icon: CloudDrizzle, label: "Showers", colorClass: "text-blue-400" },
  81: { icon: CloudRain, label: "Moderate Showers", colorClass: "text-blue-500" },
  82: { icon: CloudRain, label: "Heavy Showers", colorClass: "text-blue-500" },
  95: { icon: CloudLightning, label: "Thunderstorm", colorClass: "text-purple-400" },
  96: { icon: CloudLightning, label: "Thunderstorm + Hail", colorClass: "text-purple-400" },
  99: { icon: CloudLightning, label: "Heavy Thunderstorm", colorClass: "text-purple-400" },
};

const FALLBACK_ENTRY = {
  icon: Thermometer,
  label: "Unknown",
  colorClass: "text-gray-400",
};

/**
 * Returns a Lucide icon element for the given WMO weather code.
 *
 * @param code - WMO weather code
 * @param size - Icon size in pixels (default: 20)
 * @param className - Optional CSS class override; uses default color if omitted
 * @returns JSX element rendering the appropriate weather icon
 */
export function getWeatherIcon(
  code: number,
  size: number = 20,
  className?: string,
): React.ReactElement {
  const entry = WMO_MAP[code] || FALLBACK_ENTRY;
  const Icon = entry.icon;
  return <Icon size={size} className={className ?? entry.colorClass} />;
}

/**
 * Returns the weather condition label for a WMO code.
 *
 * @param code - WMO weather code
 * @returns Human-readable weather condition string
 */
export function getWeatherLabel(code: number): string {
  return (WMO_MAP[code] || FALLBACK_ENTRY).label;
}

/**
 * Returns the default color class for a WMO code.
 *
 * @param code - WMO weather code
 * @returns Tailwind color class string
 */
export function getWeatherColorClass(code: number): string {
  return (WMO_MAP[code] || FALLBACK_ENTRY).colorClass;
}
