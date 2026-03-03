"use client";

/**
 * Detailed weather display — extra stats in a grid layout.
 * Today: temp + icon, then 2x2 stat grid (feels like, humidity, wind, description).
 * Week: reuses standard week view (already detailed).
 */

import { MapPin, Thermometer, Droplets, Wind, Cloud } from "lucide-react";
import { getWeatherIcon, getWeatherLabel } from "../weather-icons";
import type { WeatherDisplayProps } from "./types";

export default function DetailedDisplay({
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
          <span
            className={`font-extralight tracking-tighter tabular-nums text-foreground leading-none ${
              compact ? "text-3xl" : "text-4xl"
            }`}
          >
            {formatTemp(current.temp)}
          </span>
          <span className="text-muted-foreground">
            {getWeatherIcon(current.weatherCode, compact ? 24 : 32)}
          </span>
        </div>

        {/* 2x2 stat grid */}
        {!compact && (
          <div className="grid grid-cols-2 gap-1.5">
            <StatCell
              icon={<Thermometer size={10} />}
              label="Feels like"
              value={formatTemp(current.feelsLike)}
            />
            <StatCell
              icon={<Droplets size={10} />}
              label="Humidity"
              value={`${current.humidity}%`}
            />
            <StatCell
              icon={<Wind size={10} />}
              label="Wind"
              value={`${Math.round(current.windSpeed)} km/h`}
            />
            <StatCell
              icon={<Cloud size={10} />}
              label="Condition"
              value={getWeatherLabel(current.weatherCode)}
            />
          </div>
        )}
      </div>
    );
  }

  // Week view — same as standard (already detailed)
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

      <div className="h-px bg-border mb-2" />

      {/* Forecast list with bar graphs */}
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

/**
 * Small stat cell for the 2x2 grid.
 *
 * @param icon - Lucide icon element
 * @param label - Stat label text
 * @param value - Stat value text
 */
function StatCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-1.5">
      <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-[9px] uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-[11px] text-foreground font-medium truncate block">
        {value}
      </span>
    </div>
  );
}
