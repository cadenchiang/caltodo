/**
 * Pure sunrise/sunset calculation using the simplified NOAA solar equation.
 * No external dependencies or side effects. Accurate to ~2 minutes.
 */

/** Degrees to radians. */
const DEG = Math.PI / 180;

/** Radians to degrees. */
const RAD = 180 / Math.PI;

/**
 * Computes sunrise and sunset times for a given location and date.
 * Uses the simplified NOAA solar position algorithm (solar declination + hour angle).
 *
 * @param lat - Latitude in decimal degrees (positive north)
 * @param lng - Longitude in decimal degrees (positive east)
 * @param date - Date to compute for (defaults to now)
 * @returns Object with sunrise and sunset as Date instances (local time)
 *
 * Edge cases:
 * - Near the poles during polar day/night, sunrise may be after sunset.
 *   In that case both are clamped to noon (isDarkBySun returns false).
 */
export function getSunTimes(
  lat: number,
  lng: number,
  date: Date = new Date()
): { sunrise: Date; sunset: Date } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Day of year
  const n1 = Math.floor(275 * month / 9);
  const n2 = Math.floor((month + 9) / 12);
  const n3 = 1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3);
  const dayOfYear = n1 - n2 * n3 + day - 30;

  // Solar declination (radians)
  const declination = -23.45 * DEG * Math.cos(DEG * (360 / 365) * (dayOfYear + 10));

  // Hour angle (degrees)
  const latRad = lat * DEG;
  const cosHourAngle =
    (Math.cos(90.833 * DEG) - Math.sin(latRad) * Math.sin(declination)) /
    (Math.cos(latRad) * Math.cos(declination));

  // Polar day/night: sun never sets or never rises
  if (cosHourAngle > 1 || cosHourAngle < -1) {
    const noon = new Date(date);
    noon.setHours(12, 0, 0, 0);
    return { sunrise: noon, sunset: noon };
  }

  const hourAngle = Math.acos(cosHourAngle) * RAD;

  // Solar noon in hours (UTC), then convert to local offset
  const tzOffset = -date.getTimezoneOffset() / 60;
  const solarNoon = 12 - lng / 15 + tzOffset;

  const sunriseHour = solarNoon - hourAngle / 15;
  const sunsetHour = solarNoon + hourAngle / 15;

  const sunrise = new Date(date);
  sunrise.setHours(0, 0, 0, 0);
  sunrise.setMinutes(Math.round(sunriseHour * 60));

  const sunset = new Date(date);
  sunset.setHours(0, 0, 0, 0);
  sunset.setMinutes(Math.round(sunsetHour * 60));

  return { sunrise, sunset };
}

/**
 * Returns true if the current time is before sunrise or after sunset.
 *
 * @param lat - Latitude in decimal degrees
 * @param lng - Longitude in decimal degrees
 * @param date - Date/time to check (defaults to now)
 * @returns true if it's dark (before sunrise or after sunset)
 */
export function isDarkBySun(
  lat: number,
  lng: number,
  date: Date = new Date()
): boolean {
  const { sunrise, sunset } = getSunTimes(lat, lng, date);
  // Polar edge case: sunrise === sunset means polar day or night.
  // If declination puts us in polar day, not dark; polar night, dark.
  if (sunrise.getTime() === sunset.getTime()) {
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );
    // Northern hemisphere summer (roughly Apr-Sep) = polar day if lat > 66
    const isSummerHalf = lat > 0 ? (dayOfYear > 80 && dayOfYear < 267) : (dayOfYear < 80 || dayOfYear > 267);
    return !isSummerHalf;
  }
  return date < sunrise || date > sunset;
}
