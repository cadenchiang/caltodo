/**
 * Unit tests for weather detail utility functions.
 * Covers cToF, getHoursForDay, uvLabel, getWeatherLabel, getWeatherColorClass.
 */

import { describe, it, expect } from "vitest";
import { cToF, getHoursForDay } from "@/components/home/widgets/WeatherDetailModal";
import { uvLabel } from "@/components/home/widgets/WeatherDetailSections";
import {
  getWeatherLabel,
  getWeatherColorClass,
} from "@/components/home/widgets/weather-icons";

/* ── cToF ──────────────────────────────────────────────────────── */

describe("cToF", () => {
  it("converts 0°C to 32°F", () => {
    expect(cToF(0)).toBe(32);
  });

  it("converts 100°C to 212°F", () => {
    expect(cToF(100)).toBe(212);
  });

  it("converts -40°C to -40°F", () => {
    expect(cToF(-40)).toBe(-40);
  });

  it("rounds to nearest integer", () => {
    expect(cToF(22.5)).toBe(73);
  });
});

/* ── uvLabel ───────────────────────────────────────────────────── */

describe("uvLabel", () => {
  it("returns 'Low' for uv <= 2", () => {
    expect(uvLabel(0)).toBe("Low");
    expect(uvLabel(2)).toBe("Low");
  });

  it("returns 'Moderate' for uv 3-5", () => {
    expect(uvLabel(3)).toBe("Moderate");
    expect(uvLabel(5)).toBe("Moderate");
  });

  it("returns 'High' for uv 6-7", () => {
    expect(uvLabel(6)).toBe("High");
    expect(uvLabel(7)).toBe("High");
  });

  it("returns 'Very High' for uv 8-10", () => {
    expect(uvLabel(8)).toBe("Very High");
    expect(uvLabel(10)).toBe("Very High");
  });

  it("returns 'Extreme' for uv > 10", () => {
    expect(uvLabel(11)).toBe("Extreme");
  });
});

/* ── getWeatherLabel ───────────────────────────────────────────── */

describe("getWeatherLabel", () => {
  it("returns 'Clear' for code 0", () => {
    expect(getWeatherLabel(0)).toBe("Clear");
  });

  it("returns 'Rain' for code 63", () => {
    expect(getWeatherLabel(63)).toBe("Rain");
  });

  it("returns 'Unknown' for unrecognized code", () => {
    expect(getWeatherLabel(999)).toBe("Unknown");
  });
});

/* ── getWeatherColorClass ──────────────────────────────────────── */

describe("getWeatherColorClass", () => {
  it("returns amber for clear sky", () => {
    expect(getWeatherColorClass(0)).toBe("text-amber-400");
  });

  it("returns blue for rain", () => {
    expect(getWeatherColorClass(63)).toBe("text-blue-500");
  });

  it("returns purple for thunderstorm", () => {
    expect(getWeatherColorClass(95)).toBe("text-purple-400");
  });

  it("returns sky for snow", () => {
    expect(getWeatherColorClass(73)).toBe("text-sky-300");
  });

  it("returns gray for unknown code", () => {
    expect(getWeatherColorClass(999)).toBe("text-gray-400");
  });
});

/* ── getHoursForDay ────────────────────────────────────────────── */

describe("getHoursForDay", () => {
  // Build a 3-day mock hourly dataset (72 points)
  const mockHourly = Array.from({ length: 72 }, (_, i) => ({
    time: `2025-01-0${Math.floor(i / 24) + 1}T${String(i % 24).padStart(2, "0")}:00`,
    temp: 10 + i * 0.5,
    weatherCode: 0,
    precipProb: 0,
  }));

  it("returns 25 hours starting from currentHourStart for today (day 0)", () => {
    const result = getHoursForDay(mockHourly, 0, 10);
    expect(result.length).toBe(25);
    expect(result[0].time).toBe("2025-01-01T10:00");
  });

  it("returns 24 hours for a future day (day 1)", () => {
    const result = getHoursForDay(mockHourly, 1, 10);
    expect(result.length).toBe(24);
    expect(result[0].time).toBe("2025-01-02T00:00");
  });

  it("returns 24 hours for day 2", () => {
    const result = getHoursForDay(mockHourly, 2, 0);
    expect(result.length).toBe(24);
    expect(result[0].time).toBe("2025-01-03T00:00");
  });

  it("returns empty array when day index is out of range", () => {
    const result = getHoursForDay(mockHourly, 5, 0);
    expect(result.length).toBe(0);
  });
});
