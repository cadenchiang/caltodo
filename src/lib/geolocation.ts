/**
 * Geolocation utilities with localStorage caching.
 * Falls back to Berkeley, CA (37.87, -122.27) when unavailable.
 */

/** localStorage key for cached coordinates. */
const COORDS_KEY = "caltodo_coords";

/** Default coordinates: Berkeley, CA. */
const DEFAULT_COORDS = { lat: 37.87, lng: -122.27 };

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Synchronously reads cached coordinates from localStorage.
 * Returns default (Berkeley) if nothing is cached or localStorage is unavailable.
 *
 * @returns Cached coordinates or default
 */
export function getCachedCoords(): Coords {
  if (typeof window === "undefined") return DEFAULT_COORDS;
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
  return DEFAULT_COORDS;
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
