/**
 * Hook for location autocomplete using OpenStreetMap Nominatim API.
 * Debounces input and returns matching place suggestions.
 *
 * @param query - The search string
 * @param enabled - Whether to run searches (disable when dropdown closed)
 * @returns Array of location suggestion strings
 */

import { useState, useEffect, useRef } from "react";

/** Nominatim API response item (subset of fields used). */
interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

/** Debounce delay in milliseconds. */
const DEBOUNCE_MS = 300;

/** Minimum characters before triggering a search. */
const MIN_CHARS = 3;

/**
 * Fetches location suggestions from Nominatim with debouncing.
 *
 * @param query - Search text typed by the user
 * @param enabled - Set false to pause searches
 * @returns suggestions - Array of display_name strings
 */
export function useLocationAutocomplete(query: string, enabled: boolean): string[] {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || query.trim().length < MIN_CHARS) {
      setSuggestions([]);
      return;
    }

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // Abort previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          q: query.trim(),
          format: "json",
          limit: "5",
          addressdetails: "0",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { "Accept-Language": "en" },
          }
        );
        if (!res.ok) return;
        const data: NominatimResult[] = await res.json();
        if (!controller.signal.aborted) {
          setSuggestions(data.map((r) => r.display_name));
        }
      } catch {
        // Aborted or network error — ignore
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, enabled]);

  return suggestions;
}
