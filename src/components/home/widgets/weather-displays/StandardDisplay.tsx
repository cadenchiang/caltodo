"use client";

/**
 * Standard weather display — the original WeatherWidget layout.
 * Today: location, big temp, description, stats row.
 * Week: header with current temp, divider, 7-day forecast list with bar graphs.
 */

import { MapPin } from "lucide-react";
import { getWeatherIcon, getWeatherLabel } from "../weather-icons";
import type { WeatherDisplayProps } from "./types";

export default function StandardDisplay({
  current,
  forecast,
  locationName,
  formatTemp,
  compact,
  viewMode,
  config,
  editMode,
  onDetailOpen,
}: WeatherDisplayProps) {
  const handleClick = () => {
    if (!editMode) onDetailOpen();
  };

  if (viewMode === "today") {
    return (
      <div
        className="h-full w-full flex flex-col justify-between p-4 overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        {/* Location */}
        <div className="flex items-center gap-1">
          <MapPin size={10} className="text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground truncate">
            {locationName}
          </span>
        </div>

        {/* Temperature + icon */}
        <div className="flex items-center justify-between">
          <div>
            <span
              className={`font-extralight tracking-tighter tabular-nums text-foreground leading-none ${
                compact ? "text-3xl" : "text-5xl"
              }`}
            >
              {formatTemp(current.temp)}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getWeatherLabel(current.weatherCode)}
            </p>
          </div>
          <span className="text-muted-foreground">
            {getWeatherIcon(current.weatherCode, compact ? 24 : 36)}
          </span>
        </div>

        {/* Stats — hidden in compact mode */}
        {!compact && (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{`Feels ${formatTemp(current.feelsLike)}`}</span>
            <span className="text-border">|</span>
            <span>{current.humidity}%</span>
            <span className="text-border">|</span>
            <span>{Math.round(current.windSpeed)} km/h</span>
          </div>
        )}
      </div>
    );
  }

  // Week view
  return (
    <div
      className="h-full w-full flex flex-col p-4 overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <MapPin size={10} className="text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground truncate">
            {locationName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-extralight tabular-nums text-foreground leading-none">
            {formatTemp(current.temp)}
          </span>
          <span className="text-muted-foreground">
            {getWeatherIcon(current.weatherCode, 16)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-2" />

      {/* Forecast list */}
      <ul className="flex-1 overflow-y-auto space-y-0.5">
        {forecast.map((day, i) => {
          const dayLabel =
            i === 0
              ? "Today"
              : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                  weekday: "short",
                });

          const weekMin = Math.min(...forecast.map((d) => d.tempMin));
          const weekMax = Math.max(...forecast.map((d) => d.tempMax));
          const range = weekMax - weekMin || 1;
          const barLeft = ((day.tempMin - weekMin) / range) * 100;
          const barWidth = ((day.tempMax - day.tempMin) / range) * 100;

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
              <span className="w-5 text-center text-muted-foreground">
                {getWeatherIcon(day.weatherCode, 14)}
              </span>
              <span className="w-6 text-right text-[11px] tabular-nums text-muted-foreground">
                {formatTemp(day.tempMin)}
              </span>
              <div className="flex-1 h-[3px] rounded-full bg-muted relative mx-1">
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${barLeft}%`,
                    width: `${Math.max(barWidth, 10)}%`,
                    backgroundColor: config?.accentColor
                      ? `${config.accentColor}80`
                      : "rgb(96 165 250 / 0.5)",
                  }}
                />
              </div>
              <span className="w-6 text-[11px] tabular-nums text-foreground">
                {formatTemp(day.tempMax)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
