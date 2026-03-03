"use client";

/**
 * Gradient weather display — dynamic gradient background based on weather condition.
 * Today: gradient bg with white text overlay showing temp and icon.
 * Week: gradient header with forecast list below.
 *
 * Gradient mapping:
 * - Clear/Sunny (0-1): warm orange-yellow
 * - Partly cloudy (2-3): blue-gray
 * - Fog (45,48): gray-slate
 * - Drizzle/Rain (51-82): cool blue
 * - Snow (71-75): white-blue
 * - Thunderstorm (95-99): dark purple
 */

import { getWeatherIcon, getWeatherLabel } from "../weather-icons";
import type { WeatherDisplayProps } from "./types";

/**
 * Returns a CSS gradient string based on WMO weather code.
 *
 * @param code - WMO weather code
 * @returns CSS linear-gradient string
 */
function getWeatherGradient(code: number): string {
  if (code <= 1) return "linear-gradient(135deg, #f97316, #facc15)";
  if (code <= 3) return "linear-gradient(135deg, #60a5fa, #94a3b8)";
  if (code <= 48) return "linear-gradient(135deg, #94a3b8, #64748b)";
  if (code <= 55) return "linear-gradient(135deg, #60a5fa, #3b82f6)";
  if (code <= 65) return "linear-gradient(135deg, #3b82f6, #2563eb)";
  if (code <= 75) return "linear-gradient(135deg, #bfdbfe, #93c5fd)";
  if (code <= 82) return "linear-gradient(135deg, #3b82f6, #1d4ed8)";
  return "linear-gradient(135deg, #7c3aed, #4c1d95)";
}

export default function GradientDisplay({
  current,
  forecast,
  locationName,
  formatTemp,
  viewMode,
  editMode,
  onDetailOpen,
}: WeatherDisplayProps) {
  const handleClick = () => {
    if (!editMode) onDetailOpen();
  };

  const gradient = getWeatherGradient(current.weatherCode);

  if (viewMode === "today") {
    return (
      <div
        className="h-full w-full flex flex-col justify-between p-4 overflow-hidden cursor-pointer rounded-[inherit]"
        style={{ background: gradient }}
        onClick={handleClick}
      >
        {/* Location */}
        <span className="text-[11px] text-white/70 truncate">
          {locationName}
        </span>

        {/* Temperature + icon */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-5xl font-extralight tracking-tighter tabular-nums text-white leading-none">
              {formatTemp(current.temp)}
            </span>
            <p className="text-xs text-white/70 mt-0.5">
              {getWeatherLabel(current.weatherCode)}
            </p>
          </div>
          <span className="text-white/80">
            {getWeatherIcon(current.weatherCode, 36)}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-white/60">
          <span>{`Feels ${formatTemp(current.feelsLike)}`}</span>
          <span className="text-white/30">|</span>
          <span>{current.humidity}%</span>
          <span className="text-white/30">|</span>
          <span>{Math.round(current.windSpeed)} km/h</span>
        </div>
      </div>
    );
  }

  // Week view — gradient header + forecast list
  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden cursor-pointer rounded-[inherit]"
      onClick={handleClick}
    >
      {/* Gradient header */}
      <div
        className="p-3 flex items-center justify-between shrink-0"
        style={{ background: gradient }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-white/80">
            {getWeatherIcon(current.weatherCode, 16)}
          </span>
          <span className="text-lg font-extralight tabular-nums text-white leading-none">
            {formatTemp(current.temp)}
          </span>
        </div>
        <span className="text-[11px] text-white/70 truncate ml-2">
          {locationName}
        </span>
      </div>

      {/* Forecast list */}
      <ul className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {forecast.map((day, i) => {
          const dayLabel =
            i === 0
              ? "Today"
              : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                  weekday: "short",
                });

          return (
            <li key={day.date} className="flex items-center gap-2 py-0.5">
              <span
                className={`w-9 text-[11px] ${
                  i === 0
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {dayLabel}
              </span>
              <span className="text-muted-foreground">
                {getWeatherIcon(day.weatherCode, 14)}
              </span>
              <span className="flex-1" />
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {formatTemp(day.tempMin)}
              </span>
              <span className="text-[11px] tabular-nums text-foreground">
                {formatTemp(day.tempMax)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
