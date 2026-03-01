"use client";

/**
 * Apple Weather-inspired detailed conditions modal.
 * Layout: City + temp hero → hourly scroll strip → 7-day forecast → stat grid.
 * Fetches hourly + daily data from Open-Meteo API.
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
import {
  X,
  MapPin,
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

interface HourlyPoint {
  time: string;
  temp: number;
  weatherCode: number;
  precipProb: number;
}

interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipProb: number;
}

interface DetailData {
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

interface WeatherDetailModalProps {
  open: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName: string;
  tempUnit: string;
}

/** Converts Celsius to Fahrenheit. */
function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError("");
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

        // Parse next 24 hours of hourly data starting from current hour
        const nowHour = new Date().getHours();
        const todayIdx = json.hourly.time.findIndex((t: string) => {
          const h = new Date(t).getHours();
          const d = new Date(t).toDateString();
          return d === new Date().toDateString() && h >= nowHour;
        });
        const startIdx = Math.max(todayIdx, 0);
        const hourly: HourlyPoint[] = json.hourly.time
          .slice(startIdx, startIdx + 25)
          .map((time: string, i: number) => ({
            time,
            temp: json.hourly.temperature_2m[startIdx + i],
            weatherCode: json.hourly.weather_code[startIdx + i],
            precipProb:
              json.hourly.precipitation_probability?.[startIdx + i] ?? 0,
          }));

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
          hourly,
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

  /** Formats ISO time to short hour label. */
  function fmtHour(iso: string, idx: number): string {
    if (idx === 0) return "Now";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric" });
  }

  /** Formats ISO time to short time. */
  function fmtTime(iso: string): string {
    if (!iso) return "--";
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={handleClose}
      />

      {/* Card — wider for Apple Weather feel */}
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
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {data && !loading && (
            <div className="p-4 space-y-4">
              {/* Hero — current conditions */}
              <div className="text-center py-2">
                <div className="flex justify-center mb-2 text-muted-foreground">
                  {getWeatherIcon(data.weatherCode, 40)}
                </div>
                <p className="text-6xl font-extralight tracking-tighter tabular-nums text-foreground">
                  {fmt(data.temp)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getWeatherLabel(data.weatherCode)}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  H:{fmt(data.forecast[0]?.tempMax ?? data.temp)} L:
                  {fmt(data.forecast[0]?.tempMin ?? data.temp)}
                </p>
              </div>

              {/* Hourly forecast — horizontal scroll strip */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-3 pt-2.5 pb-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Hourly Forecast
                  </p>
                </div>
                <div className="h-px bg-border mx-3" />
                <div className="flex overflow-x-auto gap-0 py-3 px-2 scrollbar-none">
                  {data.hourly.map((h, i) => (
                    <div
                      key={h.time}
                      className="flex flex-col items-center gap-1.5 min-w-[52px] px-1"
                    >
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {fmtHour(h.time, i)}
                      </span>
                      {h.precipProb > 20 && (
                        <span className="text-[9px] text-blue-400 tabular-nums -my-0.5">
                          {h.precipProb}%
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {getWeatherIcon(h.weatherCode, 18)}
                      </span>
                      <span className="text-sm tabular-nums text-foreground font-medium">
                        {fmt(h.temp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-day forecast */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-3 pt-2.5 pb-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    7-Day Forecast
                  </p>
                </div>
                <div className="h-px bg-border mx-3" />
                <div className="divide-y divide-border">
                  {data.forecast.map((day, i) => {
                    const dayLabel =
                      i === 0
                        ? "Today"
                        : new Date(
                            day.date + "T00:00:00"
                          ).toLocaleDateString([], { weekday: "short" });

                    const weekMin = Math.min(
                      ...data.forecast.map((d) => d.tempMin)
                    );
                    const weekMax = Math.max(
                      ...data.forecast.map((d) => d.tempMax)
                    );
                    const range = weekMax - weekMin || 1;
                    const barLeft = ((day.tempMin - weekMin) / range) * 100;
                    const barWidth =
                      ((day.tempMax - day.tempMin) / range) * 100;

                    return (
                      <div
                        key={day.date}
                        className="flex items-center gap-2 px-3 py-2.5"
                      >
                        <span
                          className={`w-10 text-xs ${
                            i === 0
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {dayLabel}
                        </span>
                        <span className="w-5 flex justify-center text-muted-foreground">
                          {getWeatherIcon(day.weatherCode, 16)}
                        </span>
                        <span className="w-7 text-right text-xs tabular-nums text-muted-foreground">
                          {fmt(day.tempMin)}
                        </span>
                        <div className="flex-1 h-[4px] rounded-full bg-muted relative mx-1">
                          <div
                            className="absolute h-full rounded-full bg-blue-400/60"
                            style={{
                              left: `${barLeft}%`,
                              width: `${Math.max(barWidth, 10)}%`,
                            }}
                          />
                        </div>
                        <span className="w-7 text-xs tabular-nums text-foreground">
                          {fmt(day.tempMax)}
                        </span>
                        {day.precipProb > 0 && (
                          <span className="text-[10px] text-blue-400 w-8 text-right tabular-nums">
                            {day.precipProb}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats grid — Apple Weather style cards */}
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
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Small stat card for the conditions grid.
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
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">
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

/**
 * Returns a human-readable UV index label.
 *
 * @param uv - UV index value
 * @returns "Low", "Moderate", "High", "Very High", or "Extreme"
 */
function uvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}
