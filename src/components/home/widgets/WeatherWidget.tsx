"use client";

/**
 * Weather widget using Open-Meteo API (free, no key required).
 * Auto-detects location via browser geolocation + reverse geocoding.
 * Dispatches rendering to a selected weather display component.
 * Clicking opens a detailed Apple Weather-style modal.
 *
 * Uses SWR for caching weather data across page navigations.
 *
 * @param config - Widget configuration (weatherView, tempUnit, weatherDisplay)
 */

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { getWeatherIcon } from "./weather-icons";
import { useCompactMode } from "@/hooks/useCompactMode";
import WeatherDetailModal from "./WeatherDetailModal";
import { WEATHER_DISPLAY_MAP } from "./weather-displays";
import { DEFAULT_WEATHER_DISPLAY } from "@/lib/weather-displays";
import type { CurrentWeather, DayForecast } from "./weather-displays/types";

interface WeatherWidgetProps {
  config?: Record<string, string>;
  editMode?: boolean;
}

/**
 * Converts Celsius to Fahrenheit.
 *
 * @param c - Temperature in Celsius
 * @returns Temperature in Fahrenheit, rounded to nearest integer
 */
function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/**
 * Reverse geocodes coordinates to a city name using Nominatim.
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns City name like "Berkeley, CA" or fallback coords string
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { "User-Agent": "CalTodo/1.0" } }
    );
    if (!res.ok) return `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
    const data = await res.json();
    const addr = data.address;
    const city =
      addr?.city || addr?.town || addr?.village || addr?.suburb || "";
    const state = addr?.state || "";
    // Use state abbreviation if US
    const stateCode =
      addr?.["ISO3166-2-lvl4"]?.split("-")[1] || state.slice(0, 2);
    if (city && stateCode) return `${city}, ${stateCode}`;
    if (city) return city;
    return `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
  } catch {
    return `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
  }
}

/**
 * SWR fetcher for weather data. Parses the key to extract coords,
 * then fetches reverse geocode and Open-Meteo in parallel.
 *
 * @param key - SWR key in format "weather:{lat},{lon}"
 * @returns Object with current weather, forecast, and location name
 */
export async function weatherFetcher(
  key: string
): Promise<{ current: CurrentWeather; forecast: DayForecast[]; locationName: string }> {
  const match = key.match(/^weather:([-\d.]+),([-\d.]+)$/);
  if (!match) throw new Error(`Invalid weather key: ${key}`);
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);

  const [cityName, weatherRes] = await Promise.all([
    reverseGeocode(lat, lon),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto`
    ),
  ]);

  if (!weatherRes.ok) throw new Error("Weather API error");
  const data = await weatherRes.json();

  return {
    current: {
      temp: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      feelsLike: data.current.apparent_temperature,
    },
    forecast: data.daily.time.map((date: string, i: number) => ({
      date,
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      weatherCode: data.daily.weather_code[i],
    })),
    locationName: cityName,
  };
}

const WEATHER_CACHE_KEY = "weather-widget-cache";

/**
 * Reads cached weather data from localStorage.
 *
 * @returns Cached object with coords, weather data, and locationName, or null if not found/invalid
 */
function readWeatherCache(): {
  coords: { lat: number; lon: number };
  data: { current: CurrentWeather; forecast: DayForecast[]; locationName: string };
} | null {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.coords?.lat != null && parsed?.coords?.lon != null && parsed?.data?.current) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Writes weather data + coords to localStorage for instant rendering on next mount.
 *
 * @param coords - Latitude/longitude used for the fetch
 * @param data - Weather response data to cache
 */
function writeWeatherCache(
  coords: { lat: number; lon: number },
  data: { current: CurrentWeather; forecast: DayForecast[]; locationName: string }
): void {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ coords, data }));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export default function WeatherWidget({ config, editMode }: WeatherWidgetProps) {
  const viewMode = (config?.weatherView || "today") as "today" | "week";
  const units = config?.tempUnit || "F";
  const displayId = config?.weatherDisplay || DEFAULT_WEATHER_DISPLAY;

  // Restore cached coords + data from localStorage for instant render
  const cached = useMemo(() => readWeatherCache(), []);

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(cached?.coords ?? null);
  const [geoError, setGeoError] = useState("");
  const [permDenied, setPermDenied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const { containerRef, compact } = useCompactMode(160);

  // Part A: Geolocation (stays as useEffect)
  useEffect(() => {
    let cancelled = false;

    async function getLocation() {
      setGeoError("");
      setPermDenied(false);

      try {
        // Re-check permission state on every run (including retries). The
        // Permissions API reflects live state, so if the user has unblocked
        // via the lock icon, this will return "granted" or "prompt".
        if (navigator.permissions) {
          try {
            const status = await navigator.permissions.query({
              name: "geolocation",
            });
            if (status.state === "denied") {
              if (cancelled) return;
              setPermDenied(true);
              setGeoError(
                retryCount > 0
                  ? "Still blocked — unblock location in your browser, then retry"
                  : "Location blocked — click the lock icon in your address bar"
              );
              return;
            }
          } catch {
            // Permissions API unavailable — fall through to getCurrentPosition
          }
        }

        const pos = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              maximumAge: 300000,
            });
          }
        );

        if (cancelled) return;
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      } catch (err) {
        if (cancelled) return;
        const geoErr = err as { code?: number };
        if (geoErr?.code === 1) {
          setPermDenied(true);
          setGeoError(
            retryCount > 0
              ? "Still blocked — unblock location in your browser, then retry"
              : "Location blocked — click the lock icon in your address bar"
          );
        } else if (geoErr?.code === 2 || geoErr?.code === 3) {
          setGeoError("Enable location access");
        } else {
          setGeoError("Could not load weather");
        }
      }
    }

    getLocation();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  // Part B: Weather data (useSWR — null key skips fetch until coords ready)
  const swrKey = coords ? `weather:${coords.lat},${coords.lon}` : null;
  const { data, isLoading: weatherLoading } = useSWR(swrKey, weatherFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
    refreshInterval: 900000,
    fallbackData: cached?.data ?? undefined,
    onSuccess: (freshData) => {
      if (coords) writeWeatherCache(coords, freshData);
    },
  });

  const current = data?.current ?? null;
  const forecast = data?.forecast ?? [];
  const locationName = data?.locationName ?? "";

  // Loading: waiting for geolocation OR weather fetch (with no cached data)
  const loading = !coords ? !geoError : weatherLoading;

  /** Formats temperature based on unit preference. */
  function formatTemp(celsius: number): string {
    return units === "C" ? `${Math.round(celsius)}°` : `${cToF(celsius)}°`;
  }

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col justify-between p-3">
        <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-20 rounded bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          </div>
          <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-12 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-8 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-14 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (geoError) {
    return (
      <div
        className={`h-full w-full flex flex-col items-center justify-center p-3 text-center ${!permDenied ? "cursor-pointer" : ""}`}
        onClick={!permDenied ? () => setRetryCount((c) => c + 1) : undefined}
        role={!permDenied ? "button" : undefined}
        tabIndex={!permDenied ? 0 : undefined}
        onKeyDown={!permDenied ? (e) => { if (e.key === "Enter" || e.key === " ") setRetryCount((c) => c + 1); } : undefined}
      >
        <div className="text-muted-foreground mb-2">
          {getWeatherIcon(3, 24)}
        </div>
        {permDenied ? (
          <>
            <p className="text-xs text-muted-foreground mb-1">
              {geoError}
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((c) => c + 1)}
              className="text-xs text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
            >
              Retry
            </button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            {geoError}
          </p>
        )}
      </div>
    );
  }

  if (!current) return null;

  // Resolve the display component from the map, fallback to standard
  const Display = WEATHER_DISPLAY_MAP[displayId] || WEATHER_DISPLAY_MAP.standard;

  return (
    <>
      <div ref={containerRef} className="h-full w-full rounded-xl transition-[filter] duration-200 hover:brightness-[0.92] dark:hover:brightness-[0.85]">
        <Display
          current={current}
          forecast={forecast}
          locationName={locationName}
          formatTemp={formatTemp}
          compact={compact}
          viewMode={viewMode}
          config={config}
          editMode={editMode}
          onDetailOpen={() => setDetailOpen(true)}
        />
      </div>

      {coords && (
        <WeatherDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          latitude={coords.lat}
          longitude={coords.lon}
          locationName={locationName}
          tempUnit={units}
        />
      )}
    </>
  );
}
