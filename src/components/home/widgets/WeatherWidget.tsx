"use client";

/**
 * Weather widget using Open-Meteo API (free, no key required).
 * Auto-detects location via browser geolocation + reverse geocoding.
 * Dispatches rendering to a selected weather display component.
 * Clicking opens a detailed Apple Weather-style modal.
 *
 * @param config - Widget configuration (weatherView, tempUnit, weatherDisplay)
 */

import { useState, useEffect } from "react";
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
async function reverseGeocode(lat: number, lon: number): Promise<string> {
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

export default function WeatherWidget({ config, editMode }: WeatherWidgetProps) {
  const viewMode = (config?.weatherView || "today") as "today" | "week";
  const units = config?.tempUnit || "F";
  const displayId = config?.weatherDisplay || DEFAULT_WEATHER_DISPLAY;
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [permDenied, setPermDenied] = useState(false);
  const { containerRef, compact } = useCompactMode(160);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setLoading(true);
      setError("");
      setPermDenied(false);

      try {
        // Check if geolocation permission is permanently denied
        if (navigator.permissions) {
          try {
            const status = await navigator.permissions.query({
              name: "geolocation",
            });
            if (status.state === "denied") {
              setPermDenied(true);
              throw new Error("PERMISSION_DENIED");
            }
          } catch (permErr) {
            // Re-throw our own PERMISSION_DENIED error
            if (
              permErr instanceof Error &&
              permErr.message === "PERMISSION_DENIED"
            ) {
              throw permErr;
            }
            // Otherwise permissions API unavailable, continue
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

        const { latitude, longitude } = pos.coords;
        if (cancelled) return;

        setCoords({ lat: latitude, lon: longitude });

        // Reverse geocode in parallel with weather fetch
        const [cityName, weatherRes] = await Promise.all([
          reverseGeocode(latitude, longitude),
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto`
          ),
        ]);

        if (cancelled) return;
        setLocationName(cityName);

        if (!weatherRes.ok) throw new Error("Weather API error");
        const data = await weatherRes.json();
        if (cancelled) return;

        setCurrent({
          temp: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          feelsLike: data.current.apparent_temperature,
        });

        setForecast(
          data.daily.time.map((date: string, i: number) => ({
            date,
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            weatherCode: data.daily.weather_code[i],
          }))
        );
      } catch (err) {
        if (!cancelled) {
          const geoErr = err as { code?: number };
          if (geoErr?.code === 1) {
            // PERMISSION_DENIED from geolocation API
            setPermDenied(true);
            setError("Location blocked — enable in site settings");
          } else if (geoErr?.code === 2 || geoErr?.code === 3) {
            // POSITION_UNAVAILABLE or TIMEOUT
            setError("Enable location access");
          } else if (
            err instanceof Error &&
            err.message === "PERMISSION_DENIED"
          ) {
            setError("Location blocked — enable in site settings");
          } else {
            setError("Could not load weather");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  /** Formats temperature based on unit preference. */
  function formatTemp(celsius: number): string {
    return units === "C" ? `${Math.round(celsius)}°` : `${cToF(celsius)}°`;
  }

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col justify-between p-4">
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

  if (error) {
    return (
      <div
        className={`h-full w-full flex flex-col items-center justify-center p-4 text-center ${!permDenied ? "cursor-pointer" : ""}`}
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
              Location blocked — click the lock icon in your address bar
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((c) => c + 1)}
              className="text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </>
        ) : (
          <p className="text-sm text-blue-500">
            {error}
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
      <div ref={containerRef} className="h-full w-full">
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
