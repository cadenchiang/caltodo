/**
 * Tests for solar-based theme resolution.
 * Verifies sunrise/sunset calculation, isDarkBySun, geolocation caching,
 * and resolveTheme integration with solar logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSunTimes, isDarkBySun } from "@/lib/solar";
import { getCachedCoords } from "@/lib/geolocation";
import { resolveTheme } from "@/contexts/ThemeContext";
import type { ThemePreference, ResolvedTheme } from "@/contexts/ThemeContext";

// Berkeley, CA coordinates
const BERKELEY = { lat: 37.87, lng: -122.27 };

describe("getSunTimes", () => {
  it("should return sunrise before sunset for a normal day", () => {
    const date = new Date(2026, 5, 21, 12, 0, 0); // June 21 noon
    const { sunrise, sunset } = getSunTimes(BERKELEY.lat, BERKELEY.lng, date);
    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
  });

  it("should return reasonable sunrise hour (5-7 AM) for summer solstice in Berkeley", () => {
    const date = new Date(2026, 5, 21, 12, 0, 0);
    const { sunrise } = getSunTimes(BERKELEY.lat, BERKELEY.lng, date);
    const hour = sunrise.getHours() + sunrise.getMinutes() / 60;
    expect(hour).toBeGreaterThan(4.5);
    expect(hour).toBeLessThan(7.5);
  });

  it("should return reasonable sunset hour (7-9 PM) for summer solstice in Berkeley", () => {
    const date = new Date(2026, 5, 21, 12, 0, 0);
    const { sunset } = getSunTimes(BERKELEY.lat, BERKELEY.lng, date);
    const hour = sunset.getHours() + sunset.getMinutes() / 60;
    expect(hour).toBeGreaterThan(19);
    expect(hour).toBeLessThan(21.5);
  });

  it("should return shorter day in winter than summer", () => {
    const summer = new Date(2026, 5, 21, 12, 0, 0);
    const winter = new Date(2026, 11, 21, 12, 0, 0);
    const summerTimes = getSunTimes(BERKELEY.lat, BERKELEY.lng, summer);
    const winterTimes = getSunTimes(BERKELEY.lat, BERKELEY.lng, winter);
    const summerDayLen = summerTimes.sunset.getTime() - summerTimes.sunrise.getTime();
    const winterDayLen = winterTimes.sunset.getTime() - winterTimes.sunrise.getTime();
    expect(summerDayLen).toBeGreaterThan(winterDayLen);
  });

  it("should handle polar edge case (sunrise === sunset)", () => {
    // Very high latitude in winter — polar night
    const date = new Date(2026, 11, 21, 12, 0, 0);
    const { sunrise, sunset } = getSunTimes(80, 0, date);
    expect(sunrise.getTime()).toBe(sunset.getTime());
  });
});

describe("isDarkBySun", () => {
  it("should return false (light) at noon in Berkeley", () => {
    const noon = new Date(2026, 5, 21, 12, 0, 0);
    expect(isDarkBySun(BERKELEY.lat, BERKELEY.lng, noon)).toBe(false);
  });

  it("should return true (dark) at midnight in Berkeley", () => {
    const midnight = new Date(2026, 5, 21, 0, 0, 0);
    expect(isDarkBySun(BERKELEY.lat, BERKELEY.lng, midnight)).toBe(true);
  });

  it("should return true (dark) at 9 PM in Berkeley winter", () => {
    const evening = new Date(2026, 11, 21, 21, 0, 0);
    expect(isDarkBySun(BERKELEY.lat, BERKELEY.lng, evening)).toBe(true);
  });

  it("should return false (light) at 10 AM in Berkeley winter", () => {
    const morning = new Date(2026, 11, 21, 10, 0, 0);
    expect(isDarkBySun(BERKELEY.lat, BERKELEY.lng, morning)).toBe(false);
  });

  it("should return true (dark) just before sunrise", () => {
    const date = new Date(2026, 5, 21, 12, 0, 0);
    const { sunrise } = getSunTimes(BERKELEY.lat, BERKELEY.lng, date);
    const beforeSunrise = new Date(sunrise.getTime() - 60_000); // 1 min before
    expect(isDarkBySun(BERKELEY.lat, BERKELEY.lng, beforeSunrise)).toBe(true);
  });

  it("should return true (dark) just after sunset", () => {
    const date = new Date(2026, 5, 21, 12, 0, 0);
    const { sunset } = getSunTimes(BERKELEY.lat, BERKELEY.lng, date);
    const afterSunset = new Date(sunset.getTime() + 60_000); // 1 min after
    expect(isDarkBySun(BERKELEY.lat, BERKELEY.lng, afterSunset)).toBe(true);
  });
});

describe("getCachedCoords", () => {
  let storageData: Record<string, string>;

  beforeEach(() => {
    storageData = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => storageData[key] ?? null),
      setItem: vi.fn((key: string, val: string) => { storageData[key] = val; }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return default coords when nothing is cached", () => {
    const coords = getCachedCoords();
    expect(coords).toEqual({ lat: 37.87, lng: -122.27 });
  });

  it("should return cached coords from localStorage", () => {
    storageData["caltodo_coords"] = JSON.stringify({ lat: 40.7, lng: -74.0 });
    const coords = getCachedCoords();
    expect(coords.lat).toBe(40.7);
    expect(coords.lng).toBe(-74.0);
  });

  it("should return default coords for invalid cached data", () => {
    storageData["caltodo_coords"] = "not json";
    const coords = getCachedCoords();
    expect(coords).toEqual({ lat: 37.87, lng: -122.27 });
  });
});

describe("resolveTheme", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return "light" for preference "light"', () => {
    const result: ResolvedTheme = resolveTheme("light");
    expect(result).toBe("light");
  });

  it('should return "dark" for preference "dark"', () => {
    const result: ResolvedTheme = resolveTheme("dark");
    expect(result).toBe("dark");
  });

  it('should return "light" for "auto" at noon (using default Berkeley coords)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 21, 12, 0, 0));
    const result: ResolvedTheme = resolveTheme("auto");
    expect(result).toBe("light");
    vi.useRealTimers();
  });

  it('should return "dark" for "auto" at midnight (using default Berkeley coords)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 21, 0, 0, 0));
    const result: ResolvedTheme = resolveTheme("auto");
    expect(result).toBe("dark");
    vi.useRealTimers();
  });

  it("should only accept valid ThemePreference values", () => {
    const validPrefs: ThemePreference[] = ["light", "dark", "auto"];
    for (const pref of validPrefs) {
      const result = resolveTheme(pref);
      expect(["light", "dark"]).toContain(result);
    }
  });
});
