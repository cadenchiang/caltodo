"use client";

/**
 * Weather widget using Open-Meteo API (free, no key required).
 * Auto-detects location via browser geolocation.
 * Supports today view or 7-day forecast (configurable via settings).
 *
 * @param config - Widget configuration (viewMode: "today" | "week")
 */

import { useState, useEffect } from "react";
import { CloudSun, Droplets, Wind, Thermometer, MapPin } from "lucide-react";

/** Weather code to emoji/description mapping. */
const WMO_CODES: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "Clear" },
  1: { icon: "🌤️", label: "Mostly Clear" },
  2: { icon: "⛅", label: "Partly Cloudy" },
  3: { icon: "☁️", label: "Overcast" },
  45: { icon: "🌫️", label: "Foggy" },
  48: { icon: "🌫️", label: "Icy Fog" },
  51: { icon: "🌦️", label: "Light Drizzle" },
  53: { icon: "🌦️", label: "Drizzle" },
  55: { icon: "🌧️", label: "Heavy Drizzle" },
  61: { icon: "🌧️", label: "Light Rain" },
  63: { icon: "🌧️", label: "Rain" },
  65: { icon: "🌧️", label: "Heavy Rain" },
  71: { icon: "🌨️", label: "Light Snow" },
  73: { icon: "🌨️", label: "Snow" },
  75: { icon: "❄️", label: "Heavy Snow" },
  80: { icon: "🌦️", label: "Showers" },
  81: { icon: "🌧️", label: "Moderate Showers" },
  82: { icon: "⛈️", label: "Heavy Showers" },
  95: { icon: "⛈️", label: "Thunderstorm" },
  96: { icon: "⛈️", label: "Thunderstorm + Hail" },
  99: { icon: "⛈️", label: "Heavy Thunderstorm" },
};

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
}

/**
 * Converts Celsius to Fahrenheit.
 *
 * @param c - Temperature in Celsius
 * @returns Temperature in Fahrenheit, rounded to nearest integer
 */
function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

/**
 * Gets the weather description for a WMO code.
 *
 * @param code - WMO weather code
 * @returns Object with icon emoji and label string
 */
function getWeatherInfo(code: number): { icon: string; label: string } {
  return WMO_CODES[code] || { icon: "🌡️", label: "Unknown" };
}

export default function WeatherWidget({ config }: WeatherWidgetProps) {
  const viewMode = config?.weatherView || "today";
  const units = config?.tempUnit || "F";
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setLoading(true);
      setError("");

      try {
        // Get user location
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 300000,
          });
        });

        const { latitude, longitude } = pos.coords;
        if (cancelled) return;

        // Reverse geocode for city name
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1`
          );
          // Fallback: use Open-Meteo reverse lookup isn't straightforward, use coordinates
          setLocationName(`${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`);
        } catch {
          setLocationName(`${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`);
        }

        // Fetch weather from Open-Meteo
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather API error");

        const data = await res.json();
        if (cancelled) return;

        setCurrent({
          temp: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          feelsLike: data.current.apparent_temperature,
        });

        const days: DayForecast[] = data.daily.time.map((date: string, i: number) => ({
          date,
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          weatherCode: data.daily.weather_code[i],
        }));
        setForecast(days);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof GeolocationPositionError
            ? "Enable location access for weather"
            : "Could not load weather");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  /** Formats temperature based on unit preference. */
  function formatTemp(celsius: number): string {
    return units === "C" ? `${Math.round(celsius)}°C` : `${cToF(celsius)}°F`;
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
        <CloudSun size={24} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!current) return null;

  const weatherInfo = getWeatherInfo(current.weatherCode);

  // Today view
  if (viewMode === "today") {
    return (
      <div className="h-full w-full flex flex-col p-4 overflow-hidden">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate">{locationName}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-3xl mb-1">{weatherInfo.icon}</span>
          <span className="text-3xl font-light text-foreground tabular-nums">
            {formatTemp(current.temp)}
          </span>
          <span className="text-xs text-muted-foreground mt-1">{weatherInfo.label}</span>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Thermometer size={12} /> {formatTemp(current.feelsLike)}
          </span>
          <span className="flex items-center gap-1">
            <Droplets size={12} /> {current.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind size={12} /> {Math.round(current.windSpeed)} km/h
          </span>
        </div>
      </div>
    );
  }

  // Week view — 7-day forecast
  return (
    <div className="h-full w-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin size={12} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground truncate">{locationName}</span>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto">
        {forecast.map((day) => {
          const info = getWeatherInfo(day.weatherCode);
          const dayName = new Date(day.date + "T00:00:00").toLocaleDateString([], { weekday: "short" });
          return (
            <li key={day.date} className="flex items-center gap-2 py-1">
              <span className="w-8 text-xs text-muted-foreground">{dayName}</span>
              <span className="text-sm">{info.icon}</span>
              <span className="flex-1 text-xs text-muted-foreground truncate">{info.label}</span>
              <span className="text-xs text-foreground tabular-nums">
                {formatTemp(day.tempMax)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatTemp(day.tempMin)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
