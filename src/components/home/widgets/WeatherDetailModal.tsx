"use client";

/**
 * Apple Weather-inspired detailed conditions modal.
 * Layout: City + temp hero -> hourly scroll strip -> 7-day forecast -> stat grid.
 * Fetches full 7-day hourly + daily data from Open-Meteo API.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param locationName - Display name for location
 * @param tempUnit - Temperature unit preference ("F" or "C")
 */

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, MapPin } from "lucide-react";
import {
  HeroSection,
  HourlyStrip,
  DayForecastList,
  StatsGrid,
} from "./WeatherDetailSections";
import type { DetailData, HourlyPoint } from "./WeatherDetailSections";

interface WeatherDetailModalProps {
  open: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName: string;
  tempUnit: string;
}

/** Converts Celsius to Fahrenheit. */
export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/**
 * Returns hourly data points for a specific day index.
 *
 * @param allHourly - Full 7-day hourly array
 * @param dayIndex - 0 = today, 1 = tomorrow, etc.
 * @param currentHourStart - Index of the current hour in the full array (for today filtering)
 * @returns Filtered hourly points for the requested day
 */
export function getHoursForDay(
  allHourly: HourlyPoint[],
  dayIndex: number,
  currentHourStart: number,
): HourlyPoint[] {
  if (dayIndex === 0) {
    return allHourly.slice(currentHourStart, currentHourStart + 25);
  }
  const dayStart = dayIndex * 24;
  return allHourly.slice(dayStart, dayStart + 24);
}

export default function WeatherDetailModal({
  open,
  onClose,
  latitude,
  longitude,
  locationName,
  tempUnit,
}: WeatherDetailModalProps) {
  const [data, setData] = useState<DetailData | null>(null);
  const [allHourly, setAllHourly] = useState<HourlyPoint[]>([]);
  const [currentHourIdx, setCurrentHourIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError("");
      setSelectedDay(0);
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility` +
          `&hourly=temperature_2m,weather_code,precipitation_probability` +
          `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,uv_index_max,sunrise,sunset` +
          `&forecast_days=7&timezone=auto`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather API error");

        const json = await res.json();
        if (cancelled) return;

        // Build full 7-day hourly dataset (no slicing)
        const fullHourly: HourlyPoint[] = json.hourly.time.map(
          (time: string, i: number) => ({
            time,
            temp: json.hourly.temperature_2m[i],
            weatherCode: json.hourly.weather_code[i],
            precipProb: json.hourly.precipitation_probability?.[i] ?? 0,
          }),
        );

        // Find current hour index for today filtering
        const nowHour = new Date().getHours();
        const todayIdx = json.hourly.time.findIndex((t: string) => {
          const d = new Date(t);
          return (
            d.toDateString() === new Date().toDateString() &&
            d.getHours() >= nowHour
          );
        });
        const startIdx = Math.max(todayIdx, 0);

        setAllHourly(fullHourly);
        setCurrentHourIdx(startIdx);
        setData({
          temp: json.current.temperature_2m,
          feelsLike: json.current.apparent_temperature,
          humidity: json.current.relative_humidity_2m,
          windSpeed: json.current.wind_speed_10m,
          weatherCode: json.current.weather_code,
          pressure: json.current.surface_pressure,
          visibility: Math.round((json.current.visibility || 0) / 1000),
          uvIndex: json.daily.uv_index_max?.[0] ?? 0,
          sunrise: json.daily.sunrise?.[0] ?? "",
          sunset: json.daily.sunset?.[0] ?? "",
          hourly: fullHourly.slice(startIdx, startIdx + 25),
          forecast: json.daily.time.map((date: string, i: number) => ({
            date,
            tempMax: json.daily.temperature_2m_max[i],
            tempMin: json.daily.temperature_2m_min[i],
            weatherCode: json.daily.weather_code[i],
            precipProb: json.daily.precipitation_probability_max?.[i] ?? 0,
          })),
        });
      } catch (err) {
        if (!cancelled) {
          setError("Could not load weather details");
          console.error("[WeatherDetailModal] fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [open, latitude, longitude]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  /** Formats temperature based on unit preference. */
  function fmt(celsius: number): string {
    return tempUnit === "C"
      ? `${Math.round(celsius)}°`
      : `${cToF(celsius)}°`;
  }

  /** Formats ISO time to short hour label. "Now" for first item when on today. */
  function fmtHour(iso: string, idx: number): string {
    if (idx === 0) return "Now";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric" });
  }

  /** Formats ISO time to short time string. */
  function fmtTime(iso: string): string {
    if (!iso) return "--";
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (!open || typeof document === "undefined") return null;

  const displayHours = getHoursForDay(allHourly, selectedDay, currentHourIdx);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={handleClose}
      />

      {/* Card */}
      <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-lg mx-4 animate-announce-card-in overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground truncate">
              {locationName}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {data && !loading && (
            <div className="p-4 space-y-0">
              <HeroSection data={data} selectedDay={selectedDay} fmt={fmt} />

              <div className="h-px bg-border" />
              <HourlyStrip
                hours={displayHours}
                fmt={fmt}
                fmtHour={fmtHour}
                isToday={selectedDay === 0}
              />

              <div className="h-px bg-border" />
              <DayForecastList
                forecast={data.forecast}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                fmt={fmt}
              />

              <div className="h-px bg-border my-2" />
              <StatsGrid data={data} fmt={fmt} fmtTime={fmtTime} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
