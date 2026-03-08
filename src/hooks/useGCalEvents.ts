/**
 * Hook to fetch Google Calendar events for a given date range.
 * Uses SWR for caching and automatic revalidation.
 *
 * @param timeMin - ISO start of range
 * @param timeMax - ISO end of range
 * @returns { events, isLoading, connected } - events array, loading state, and connection status
 */

import useSWR from "swr";
import type { GCalEvent } from "@/lib/types";

/** SWR fetcher for JSON endpoints. */
async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch GCal events");
  return res.json();
}

interface UseGCalEventsResult {
  events: GCalEvent[];
  isLoading: boolean;
  connected: boolean | null;
  /** Trigger a refetch of events. */
  mutate: () => void;
}

/**
 * Fetches Google Calendar events for the specified time range.
 * Automatically revalidates on focus and every 5 minutes.
 *
 * @param timeMin - ISO datetime string for range start
 * @param timeMax - ISO datetime string for range end
 * @returns Events array, loading state, and GCal connection status
 */
export function useGCalEvents(timeMin?: string, timeMax?: string): UseGCalEventsResult {
  const key = timeMin && timeMax
    ? `/api/gcal/events?${new URLSearchParams({ timeMin, timeMax })}`
    : null;

  const { data, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 60_000,
    refreshInterval: 300_000,
    keepPreviousData: true,
  });

  return {
    events: data?.events ?? [],
    isLoading,
    connected: data ? (data.connected ?? true) : null,
    /** Trigger a refetch of events. */
    mutate,
  };
}
