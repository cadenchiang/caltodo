"use client";

/**
 * Card weather display — icon-focused layout.
 * Today: large centered icon, temp below, description text.
 * Week: icon-focused grid/list.
 */

import { getWeatherIcon, getWeatherLabel } from "../weather-icons";
import type { WeatherDisplayProps } from "./types";

export default function CardDisplay({
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
        className="h-full w-full flex flex-col items-center justify-center p-3 cursor-pointer"
        onClick={handleClick}
      >
        <span className="text-foreground mb-2">
          {getWeatherIcon(current.weatherCode, 48)}
        </span>
        <span className="text-4xl font-extralight tracking-tighter tabular-nums text-foreground leading-none">
          {formatTemp(current.temp)}
        </span>
        <p className="text-xs text-foreground mt-1">
          {getWeatherLabel(current.weatherCode)}
        </p>
      </div>
    );
  }

  // Week view — icon-focused list
  return (
    <div
      className="h-full w-full flex flex-col p-3 overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Current header */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-foreground">
          {getWeatherIcon(current.weatherCode, 20)}
        </span>
        <span className="text-lg font-extralight tabular-nums text-foreground leading-none">
          {formatTemp(current.temp)}
        </span>
      </div>
      <div className="h-px bg-border mb-2" />

      <ul className="flex-1 overflow-y-auto space-y-1">
        {forecast.map((day, i) => {
          const dayLabel =
            i === 0
              ? "Today"
              : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                  weekday: "short",
                });

          return (
            <li
              key={day.date}
              className="flex items-center gap-2 py-0.5"
            >
              <span
                className={`w-9 text-[11px] ${
                  i === 0
                    ? "font-semibold text-foreground"
                    : "text-foreground"
                }`}
              >
                {dayLabel}
              </span>
              <span className="text-foreground">
                {getWeatherIcon(day.weatherCode, 16)}
              </span>
              <span className="text-[11px] text-foreground flex-1 truncate">
                {getWeatherLabel(day.weatherCode)}
              </span>
              <span className="text-[11px] tabular-nums text-foreground">
                {formatTemp(day.tempMax)}
              </span>
              <span className="text-[11px] tabular-nums text-foreground">
                {formatTemp(day.tempMin)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
