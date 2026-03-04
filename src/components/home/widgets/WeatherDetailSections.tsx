/**
 * Extracted sub-components for the WeatherDetailModal.
 * Keeps each section focused and the modal file under 300 lines.
 *
 * @module WeatherDetailSections
 */

import React from "react";
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun as SunIcon,
  Sunrise,
  Sunset,
} from "lucide-react";
import { getWeatherIcon, getWeatherLabel } from "./weather-icons";

/* ── Shared types ──────────────────────────────────────────────── */

export interface HourlyPoint {
  time: string;
  temp: number;
  weatherCode: number;
  precipProb: number;
}

export interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipProb: number;
}

export interface DetailData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  hourly: HourlyPoint[];
  forecast: DayForecast[];
}

/* ── Utility ───────────────────────────────────────────────────── */

/**
 * Returns a human-readable UV index label.
 *
 * @param uv - UV index value
 * @returns "Low", "Moderate", "High", "Very High", or "Extreme"
 */
export function uvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

/* ── HeroSection ───────────────────────────────────────────────── */

interface HeroProps {
  data: DetailData;
  selectedDay: number;
  fmt: (c: number) => string;
}

/**
 * Big temperature display, icon, condition label, and H/L range.
 * Adapts for today (shows current temp) or future days (shows high).
 */
export function HeroSection({ data, selectedDay, fmt }: HeroProps) {
  const isToday = selectedDay === 0;
  const day = data.forecast[selectedDay];
  const displayTemp = isToday ? data.temp : day?.tempMax ?? data.temp;
  const displayCode = isToday ? data.weatherCode : day?.weatherCode ?? data.weatherCode;
  const high = day?.tempMax ?? data.temp;
  const low = day?.tempMin ?? data.temp;

  return (
    <div className="text-center py-2">
      <div className="flex justify-center mb-2">
        {getWeatherIcon(displayCode, 40)}
      </div>
      <p className="text-6xl font-extralight tracking-tighter tabular-nums text-foreground">
        {fmt(displayTemp)}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {getWeatherLabel(displayCode)}
      </p>
      <p className="text-xs text-muted-foreground/70 mt-0.5">
        H:{fmt(high)} L:{fmt(low)}
      </p>
    </div>
  );
}

/* ── HourlyStrip ───────────────────────────────────────────────── */

interface HourlyProps {
  hours: HourlyPoint[];
  fmt: (c: number) => string;
  fmtHour: (iso: string, idx: number) => string;
  isToday: boolean;
}

/**
 * Horizontally scrollable strip of hourly temperatures with colored icons.
 */
export function HourlyStrip({ hours, fmt, fmtHour, isToday }: HourlyProps) {
  return (
    <div>
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-xs font-medium text-foreground">Hourly Forecast</p>
      </div>
      <div className="h-px bg-border mx-3" />
      <div className="flex overflow-x-auto gap-0 py-3 px-2 scrollbar-none">
        {hours.map((h, i) => (
          <div
            key={h.time}
            className="flex flex-col items-center gap-1.5 min-w-[52px] px-1"
          >
            <span className="text-[11px] text-muted-foreground font-medium">
              {fmtHour(h.time, isToday ? i : -1)}
            </span>
            {h.precipProb > 20 && (
              <span className="text-[9px] text-blue-400 tabular-nums -my-0.5">
                {h.precipProb}%
              </span>
            )}
            {getWeatherIcon(h.weatherCode, 18)}
            <span className="text-sm tabular-nums text-foreground font-medium">
              {fmt(h.temp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DayForecastList ───────────────────────────────────────────── */

interface DayListProps {
  forecast: DayForecast[];
  selectedDay: number;
  onSelectDay: (idx: number) => void;
  fmt: (c: number) => string;
}

/**
 * Clickable 7-day forecast list. Each row shows day name, colored icon,
 * condition text, precipitation %, and high/low temperatures.
 */
export function DayForecastList({
  forecast,
  selectedDay,
  onSelectDay,
  fmt,
}: DayListProps) {
  return (
    <div>
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-xs font-medium text-foreground">7-Day Forecast</p>
      </div>
      <div className="h-px bg-border mx-3" />
      <div className="divide-y divide-border">
        {forecast.map((day, i) => {
          const dayLabel =
            i === 0
              ? "Today"
              : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                  weekday: "short",
                });
          const isSelected = i === selectedDay;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDay(i)}
              className={`flex items-center gap-2 px-3 py-2.5 w-full text-left transition-colors hover:bg-muted/50 ${
                isSelected ? "bg-muted" : ""
              }`}
            >
              <span
                className={`w-10 text-xs ${
                  isSelected
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {dayLabel}
              </span>
              <span className="w-5 flex justify-center">
                {getWeatherIcon(day.weatherCode, 16)}
              </span>
              <span className="flex-1 text-xs text-muted-foreground truncate">
                {getWeatherLabel(day.weatherCode)}
              </span>
              {day.precipProb > 0 && (
                <span className="text-[10px] text-blue-400 w-8 text-right tabular-nums">
                  {day.precipProb}%
                </span>
              )}
              <span className="w-16 text-right text-xs tabular-nums text-foreground">
                {fmt(day.tempMax)} / {fmt(day.tempMin)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── StatsGrid ─────────────────────────────────────────────────── */

interface StatsProps {
  data: DetailData;
  fmt: (c: number) => string;
  fmtTime: (iso: string) => string;
}

/**
 * 2-column grid of weather stat cards (feels like, humidity, wind, etc.).
 * Cards have no borders — just padding with content.
 */
export function StatsGrid({ data, fmt, fmtTime }: StatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <StatCard
        icon={<Thermometer size={14} />}
        label="Feels Like"
        value={fmt(data.feelsLike)}
      />
      <StatCard
        icon={<Droplets size={14} />}
        label="Humidity"
        value={`${data.humidity}%`}
      />
      <StatCard
        icon={<Wind size={14} />}
        label="Wind"
        value={`${Math.round(data.windSpeed)} km/h`}
      />
      <StatCard
        icon={<SunIcon size={14} />}
        label="UV Index"
        value={`${Math.round(data.uvIndex)}`}
        sublabel={uvLabel(data.uvIndex)}
      />
      <StatCard
        icon={<Eye size={14} />}
        label="Visibility"
        value={`${data.visibility} km`}
      />
      <StatCard
        icon={<Gauge size={14} />}
        label="Pressure"
        value={`${Math.round(data.pressure)} hPa`}
      />
      <StatCard
        icon={<Sunrise size={14} />}
        label="Sunrise"
        value={fmtTime(data.sunrise)}
      />
      <StatCard
        icon={<Sunset size={14} />}
        label="Sunset"
        value={fmtTime(data.sunset)}
      />
    </div>
  );
}

/* ── StatCard ──────────────────────────────────────────────────── */

/**
 * Small stat card for the conditions grid — no border, just padding.
 *
 * @param icon - Lucide icon element
 * @param label - Stat label
 * @param value - Stat value
 * @param sublabel - Optional secondary label
 */
function StatCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-[10px] font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-lg font-medium text-foreground leading-none">
        {value}
      </p>
      {sublabel && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}
