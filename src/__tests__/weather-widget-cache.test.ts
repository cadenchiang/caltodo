/**
 * Tests for WeatherWidget localStorage caching helpers.
 * Validates read/write round-trip, corrupt data handling, and missing keys.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage for Node environment
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (index: number) => Object.keys(store)[index] ?? null,
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Mirror the exact cache key and logic from WeatherWidget.tsx.
const WEATHER_CACHE_KEY = "weather-widget-cache";

interface CachedWeather {
  coords: { lat: number; lon: number };
  data: {
    current: { temp: number; weatherCode: number; humidity: number; windSpeed: number; feelsLike: number };
    forecast: { date: string; tempMax: number; tempMin: number; weatherCode: number }[];
    locationName: string;
  };
}

function readWeatherCache(): CachedWeather | null {
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

function writeWeatherCache(
  coords: { lat: number; lon: number },
  data: CachedWeather["data"]
): void {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ coords, data }));
  } catch {
    // silently ignore
  }
}

describe("Weather widget cache", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("returns null when no cache exists", () => {
    expect(readWeatherCache()).toBeNull();
  });

  it("round-trips coords and weather data", () => {
    const coords = { lat: 37.87, lon: -122.27 };
    const data: CachedWeather["data"] = {
      current: { temp: 18, weatherCode: 0, humidity: 55, windSpeed: 12, feelsLike: 17 },
      forecast: [{ date: "2026-03-09", tempMax: 20, tempMin: 10, weatherCode: 0 }],
      locationName: "Berkeley, CA",
    };

    writeWeatherCache(coords, data);
    const cached = readWeatherCache();

    expect(cached).not.toBeNull();
    expect(cached!.coords).toEqual(coords);
    expect(cached!.data.current.temp).toBe(18);
    expect(cached!.data.locationName).toBe("Berkeley, CA");
    expect(cached!.data.forecast).toHaveLength(1);
  });

  it("returns null for corrupt JSON in localStorage", () => {
    localStorage.setItem(WEATHER_CACHE_KEY, "not-json{{{");
    expect(readWeatherCache()).toBeNull();
  });

  it("returns null when cached object is missing required fields", () => {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ coords: { lat: 1 }, data: {} }));
    expect(readWeatherCache()).toBeNull();
  });

  it("returns null when coords.lon is missing", () => {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ coords: { lat: 37 }, data: { current: { temp: 10 } } })
    );
    expect(readWeatherCache()).toBeNull();
  });

  it("handles localStorage.setItem throwing (quota exceeded)", () => {
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = () => { throw new Error("QuotaExceededError"); };

    // Should not throw
    expect(() =>
      writeWeatherCache({ lat: 1, lon: 2 }, {
        current: { temp: 10, weatherCode: 0, humidity: 50, windSpeed: 5, feelsLike: 9 },
        forecast: [],
        locationName: "Test",
      })
    ).not.toThrow();

    localStorageMock.setItem = originalSetItem;
  });
});
