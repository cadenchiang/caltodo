"use client";

/**
 * Minimal weather display — ultra-clean presentation.
 * Today: centered temp number + small icon only, no stats.
 * Week: condensed single-line forecast rows.
 */

import { getWeatherIcon } from "../weather-icons";
import type { WeatherDisplayProps } from "./types";

export default function MinimalDisplay({
  current,
  forecast,
  formatTemp,
  viewMode,
  editMode,
  onDetailOpen,
}: WeatherDisplayProps) {
  const handleClick = () => {
    if (!editMode) onDetailOpen();
  };

  if (viewMode === "today") {
    return (
      <div
        className="h-full w-full flex items-center justify-center gap-3 p-4 cursor-pointer"
        onClick={handleClick}
      >
        <span className="text-5xl font-extralight tracking-tighter tabular-nums text-foreground leading-none">
          {formatTemp(current.temp)}
        </span>
        <span className="text-muted-foreground">
          {getWeatherIcon(current.weatherCode, 28)}
        </span>
      </div>
    );
  }

  // Week view — condensed rows
  return (
    <div
      className="h-full w-full flex flex-col justify-center p-4 overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <ul className="space-y-1">
        {forecast.map((day, i) => {
          const dayLabel =
            i === 0
              ? "Today"
              : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                  weekday: "short",
                });

          return (
            <li key={day.date} className="flex items-center justify-between">
              <span
                className={`text-[11px] w-9 ${
                  i === 0
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {dayLabel}
              </span>
              <span className="text-muted-foreground">
                {getWeatherIcon(day.weatherCode, 12)}
              </span>
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
