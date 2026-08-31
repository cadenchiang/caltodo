/**
 * Geolocation utilities with localStorage caching.
 * Falls back to coordinates derived from the device's timezone when the user
 * has not granted location.
 */

/** localStorage key for cached coordinates. */
const COORDS_KEY = "caltodo_coords";

/**
 * Latitude assumed when the user's real position is unknown.
 *
 * Latitude cannot be inferred from a timezone, so this is a mid-northern
 * value. It only affects how long the day is, not when the middle of it
 * falls, so being wrong shifts sunrise and sunset by an hour or so rather
 * than putting them on the wrong side of the clock.
 */
const FALLBACK_LAT = 37.87;

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Approximates coordinates from the device's UTC offset.
 *
 * @param date - Instant whose offset to read; defaults to now
 * @returns Coordinates whose solar noon lands near 12:00 local
 * @remarks Every hour of UTC offset is 15 degrees of longitude. Without this
 *          the fallback was Berkeley for everyone, so auto mode combined a
 *          London user's timezone with a Californian longitude and put
 *          sunrise at 14:38 — dark at 10am, light at 10pm. Longitude is what
 *          decides when the sun crosses the meridian, so deriving it from the
 *          offset is what keeps auto mode the right way up worldwide.
 */
export function getFallbackCoords(date: Date = new Date()): Coords {
  const offsetHours = -date.getTimezoneOffset() / 60;
  const lng = Math.max(-180, Math.min(180, offsetHours * 15));
  return { lat: FALLBACK_LAT, lng };
}

/**
 * Synchronously reads cached coordinates from localStorage.
 *
 * @returns Cached coordinates, or a timezone-derived approximation
 * @remarks Only the weather widget ever asks for real coordinates, so most
 *          users never have a cached value and always take the fallback.
 */
export function getCachedCoords(): Coords {
  if (typeof window === "undefined") return getFallbackCoords();
  try {
    const stored = localStorage.getItem(COORDS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        return parsed;
      }
    }
  } catch {
    // localStorage or JSON parse failed
  }
  return getFallbackCoords();
}

/**
 * Asynchronously gets the user's coordinates via the Geolocation API.
 * Caches the result in localStorage for future synchronous reads.
 * Falls back to cached value or default if geolocation is denied/unavailable.
 *
 * @returns Promise resolving to coordinates
 */
export function getUserCoords(): Promise<Coords> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(getCachedCoords());
  }

  return new Promise<Coords>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        try {
          localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
        } catch {
          // localStorage unavailable
        }
        resolve(coords);
      },
      () => {
        // Geolocation denied or failed — use cached/default
        resolve(getCachedCoords());
      },
      { timeout: 5000, maximumAge: 86400000 }
    );
  });
}
