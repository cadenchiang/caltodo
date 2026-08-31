/**
 * Tests that auto theme mode is the right way up in every timezone.
 *
 * Auto resolves against sunrise/sunset, which needs a position. Only the
 * weather widget ever asks for one, so most users fall back. That fallback
 * used to be a fixed Berkeley coordinate combined with the device's own UTC
 * offset, which put a London user's sunrise at 14:38: dark at 10am, light at
 * 10pm. Longitude, not latitude, is what decides when the sun crosses the
 * meridian, so it is derived from the offset.
 */

import { describe, it, expect } from "vitest";
import { getFallbackCoords } from "@/lib/geolocation";
import { getSunTimes, isDarkBySun } from "@/lib/solar";

/** Timezones spanning the populated range of UTC offsets. */
const ZONES: Array<[string, number]> = [
  ["Honolulu", -10],
  ["Berkeley", -7],
  ["New York", -4],
  ["UTC", 0],
  ["London", 1],
  ["Berlin", 2],
  ["Mumbai", 5.5],
  ["Tokyo", 9],
  ["Sydney", 10],
  ["Auckland", 12],
];

/**
 * Builds a local time in a pretend timezone.
 *
 * @param hour - Local hour of day
 * @param tzHours - UTC offset in hours
 * @returns A Date reporting that offset from getTimezoneOffset
 */
function localTime(hour: number, tzHours: number): Date {
  const d = new Date("2026-08-31T00:00:00Z");
  d.setHours(hour, 0, 0, 0);
  Object.defineProperty(d, "getTimezoneOffset", { value: () => -tzHours * 60 });
  return d;
}

describe("getFallbackCoords", () => {
  it("maps each hour of offset to fifteen degrees of longitude", () => {
    expect(getFallbackCoords(localTime(12, 0)).lng).toBe(0);
    expect(getFallbackCoords(localTime(12, -7)).lng).toBe(-105);
    expect(getFallbackCoords(localTime(12, 2)).lng).toBe(30);
    expect(getFallbackCoords(localTime(12, 9)).lng).toBe(135);
  });

  it("handles a half-hour offset", () => {
    expect(getFallbackCoords(localTime(12, 5.5)).lng).toBeCloseTo(82.5, 5);
  });

  it("clamps to valid longitudes", () => {
    // UTC+14 exists (Kiritimati); 14 x 15 = 210 is not a longitude.
    const lng = getFallbackCoords(localTime(12, 14)).lng;
    expect(lng).toBeLessThanOrEqual(180);
    expect(lng).toBeGreaterThanOrEqual(-180);
  });

  it("returns a usable latitude", () => {
    const { lat } = getFallbackCoords(localTime(12, 0));
    expect(lat).toBeGreaterThan(-90);
    expect(lat).toBeLessThan(90);
  });
});

describe("auto mode across timezones", () => {
  it.each(ZONES)("is light at 10am in %s", (_name, tz) => {
    const c = getFallbackCoords(localTime(12, tz));
    expect(isDarkBySun(c.lat, c.lng, localTime(10, tz))).toBe(false);
  });

  it.each(ZONES)("is dark at 10pm in %s", (_name, tz) => {
    const c = getFallbackCoords(localTime(12, tz));
    expect(isDarkBySun(c.lat, c.lng, localTime(22, tz))).toBe(true);
  });

  it.each(ZONES)("is dark at 3am in %s", (_name, tz) => {
    const c = getFallbackCoords(localTime(12, tz));
    expect(isDarkBySun(c.lat, c.lng, localTime(3, tz))).toBe(true);
  });

  it.each(ZONES)("is light at noon in %s", (_name, tz) => {
    const c = getFallbackCoords(localTime(12, tz));
    expect(isDarkBySun(c.lat, c.lng, localTime(12, tz))).toBe(false);
  });

  it.each(ZONES)("puts sunrise in the morning and sunset in the evening in %s", (_name, tz) => {
    const c = getFallbackCoords(localTime(12, tz));
    const { sunrise, sunset } = getSunTimes(c.lat, c.lng, localTime(12, tz));
    expect(sunrise.getHours()).toBeGreaterThanOrEqual(4);
    expect(sunrise.getHours()).toBeLessThanOrEqual(9);
    expect(sunset.getHours()).toBeGreaterThanOrEqual(16);
    expect(sunset.getHours()).toBeLessThanOrEqual(21);
  });

  it("keeps a granted location rather than the approximation", () => {
    // A real position must always win; the fallback is only for its absence.
    const real = { lat: 51.5, lng: -0.13 };
    const { sunrise } = getSunTimes(real.lat, real.lng, localTime(12, 1));
    expect(sunrise.getHours()).toBeGreaterThanOrEqual(4);
    expect(sunrise.getHours()).toBeLessThanOrEqual(9);
  });
});
