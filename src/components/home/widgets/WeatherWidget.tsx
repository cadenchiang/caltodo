"use client";

/**
 * Weather widget using Open-Meteo API (free, no key required).
 * Auto-detects location via browser geolocation + reverse geocoding.
 * Uses Lucide icons for weather conditions.
 * Responsive: adapts UI to widget size.
 * Clicking opens a detailed Apple Weather-style modal.
 *
 * @param config - Widget configuration (weatherView, tempUnit)
 */

import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { getWeatherIcon, getWeatherLabel } from "./weather-icons";
import WeatherDetailModal from "./WeatherDetailModal";

interface CurrentWeather {
  temp: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

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
  const viewMode = config?.weatherView || "today";
  const units = config?.tempUnit || "F";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  /** Observe container size to adapt layout. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCompact(entry.contentRect.height < 160);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setLoading(true);
      setError("");

      try {
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
          setError(
            err instanceof GeolocationPositionError
              ? "Enable location access"
              : "Could not load weather"
          );
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
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
        <div className="text-muted-foreground mb-2">
          {getWeatherIcon(3, 24)}
        </div>
        <button
          type="button"
          onClick={() => setRetryCount((c) => c + 1)}
          className="text-sm text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          {error}
        </button>
      </div>
    );
  }

  if (!current) return null;

  // Today view — responsive: compact hides stats row
  if (viewMode === "today") {
    return (
      <>
        <div
          ref={containerRef}
          className="h-full w-full flex flex-col justify-between p-4 overflow-hidden cursor-pointer"
          onClick={() => { if (!editMode) setDetailOpen(true); }}
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
              <span>Feels {formatTemp(current.feelsLike)}</span>
              <span className="text-border">|</span>
              <span>{current.humidity}%</span>
              <span className="text-border">|</span>
              <span>{Math.round(current.windSpeed)} km/h</span>
            </div>
          )}
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

  // Week view — 7-day forecast (responsive)
  return (
    <>
      <div
        ref={containerRef}
        className="h-full w-full flex flex-col p-4 overflow-hidden cursor-pointer"
        onClick={() => { if (!editMode) setDetailOpen(true); }}
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
                    className="absolute h-full rounded-full bg-blue-400/50"
                    style={{
                      left: `${barLeft}%`,
                      width: `${Math.max(barWidth, 10)}%`,
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
