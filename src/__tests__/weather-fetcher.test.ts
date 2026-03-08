/**
 * Tests for weatherFetcher key parsing and data shaping.
 * Mocks fetch to validate the fetcher returns correct structure.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { weatherFetcher } from "@/components/home/widgets/WeatherWidget";

describe("weatherFetcher", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects invalid key format", async () => {
    await expect(weatherFetcher("invalid-key")).rejects.toThrow(
      "Invalid weather key"
    );
  });

  it("rejects key missing coordinates", async () => {
    await expect(weatherFetcher("weather:")).rejects.toThrow(
      "Invalid weather key"
    );
  });

  it("parses key and returns correct data shape", async () => {
    const mockGeoResponse = {
      ok: true,
      json: async () => ({
        address: {
          city: "Berkeley",
          state: "California",
          "ISO3166-2-lvl4": "US-CA",
        },
      }),
    };

    const mockWeatherResponse = {
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 18.5,
          weather_code: 1,
          relative_humidity_2m: 65,
          wind_speed_10m: 12.3,
          apparent_temperature: 17.0,
        },
        daily: {
          time: ["2026-03-06", "2026-03-07"],
          temperature_2m_max: [20, 22],
          temperature_2m_min: [12, 14],
          weather_code: [1, 2],
        },
      }),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(mockGeoResponse)
        .mockResolvedValueOnce(mockWeatherResponse)
    );

    const result = await weatherFetcher("weather:37.87,-122.27");

    expect(result.locationName).toBe("Berkeley, CA");
    expect(result.current).toEqual({
      temp: 18.5,
      weatherCode: 1,
      humidity: 65,
      windSpeed: 12.3,
      feelsLike: 17.0,
    });
    expect(result.forecast).toHaveLength(2);
    expect(result.forecast[0]).toEqual({
      date: "2026-03-06",
      tempMax: 20,
      tempMin: 12,
      weatherCode: 1,
    });
  });

  it("throws on weather API error", async () => {
    const mockGeoResponse = {
      ok: true,
      json: async () => ({ address: { city: "Test" } }),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(mockGeoResponse)
        .mockResolvedValueOnce({ ok: false, status: 500 })
    );

    await expect(weatherFetcher("weather:37.87,-122.27")).rejects.toThrow(
      "Weather API error"
    );
  });

  it("parses negative coordinates", async () => {
    const mockGeoResponse = {
      ok: true,
      json: async () => ({
        address: { city: "Sydney", "ISO3166-2-lvl4": "AU-NSW" },
      }),
    };

    const mockWeatherResponse = {
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 25,
          weather_code: 0,
          relative_humidity_2m: 50,
          wind_speed_10m: 8,
          apparent_temperature: 24,
        },
        daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], weather_code: [] },
      }),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(mockGeoResponse)
        .mockResolvedValueOnce(mockWeatherResponse)
    );

    const result = await weatherFetcher("weather:-33.87,151.21");
    expect(result.locationName).toBe("Sydney, NSW");
    expect(result.current.temp).toBe(25);
  });
});
