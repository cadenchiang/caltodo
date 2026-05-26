"use client";

/**
 * Widget showing upcoming Google Calendar events.
 * Supports Today/Week/Month view mode toggle.
 * Fetches from /api/gcal/events with timeMin/timeMax query params.
 * Clicking an event opens an inline detail popover.
 *
 * @param config - Per-widget config (optional calendarId, viewMode)
 * @param onUpdateConfig - Callback to persist config changes
 */

import { useMemo } from "react";
import useSWR from "swr";
import { Calendar } from "lucide-react";
import { useCompactMode } from "@/hooks/useCompactMode";
import { WidgetHeader } from "./WidgetPrimitives";
import { GCAL_DISPLAY_MAP } from "./gcal-displays";
import { DEFAULT_GCAL_DISPLAY } from "@/lib/gcal-displays";
import type { GCalEvent } from "@/lib/types";

/** View mode options for the calendar. */
export type ViewMode = "today" | "2day" | "3day" | "4day" | "5day" | "week" | "month" | "custom";

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "2day", label: "2 Days" },
  { key: "3day", label: "3 Days" },
  { key: "4day", label: "4 Days" },
  { key: "5day", label: "5 Days" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "custom", label: "Custom" },
];

/**
 * Computes timeMin/timeMax ISO strings for the given view mode.
 *
 * @param mode - View mode to compute range for
 * @param customDays - Number of days for "custom" mode (default 7)
 * @returns Object with timeMin and timeMax ISO strings
 */
export function getTimeRange(mode: ViewMode, customDays?: number): { timeMin: string; timeMax: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);

  switch (mode) {
    case "today":
      end.setDate(end.getDate() + 1);
      break;
    case "2day":
      end.setDate(end.getDate() + 2);
      break;
    case "3day":
      end.setDate(end.getDate() + 3);
      break;
    case "4day":
      end.setDate(end.getDate() + 4);
      break;
    case "5day":
      end.setDate(end.getDate() + 5);
      break;
    case "week":
      end.setDate(end.getDate() + 7);
      break;
    case "month":
      end.setDate(end.getDate() + 30);
      break;
    case "custom": {
      const days = customDays && customDays >= 1 ? Math.min(customDays, 90) : 7;
      end.setDate(end.getDate() + days);
      break;
    }
  }

  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

const GCAL_CACHE_PREFIX = "gcal-widget-cache:";

/**
 * Reads cached Google Calendar events from localStorage for instant rendering.
 *
 * @param key - The SWR key (API URL) used as the cache identifier
 * @returns Cached API response object, or null if not found/invalid
 */
function readGCalCache(key: string): { events: GCalEvent[]; connected?: boolean } | null {
  try {
    const raw = localStorage.getItem(GCAL_CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.events)) return parsed;
    return null;
  } catch {
    return null;
  }
}

/**
 * Writes Google Calendar API response to localStorage for instant rendering on next mount.
 *
 * @param key - The SWR key (API URL) used as the cache identifier
 * @param data - The API response data to cache
 */
function writeGCalCache(key: string, data: { events: GCalEvent[]; connected?: boolean }): void {
  try {
    localStorage.setItem(GCAL_CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Kicks off the Google Calendar OAuth flow directly from the widget so
 * the empty-state "Sync" button takes the user straight to Google's
 * sign-in modal instead of forcing them through the Settings page first.
 * Mirrors the desktop popup / mobile redirect behavior in
 * GoogleCalendarSettings.handleConfirmConnect so both entry points feel
 * identical.
 */
function startGCalConnect(): void {
  if (typeof window === "undefined") return;
  const isDesktop = window.innerWidth >= 768;
  if (!isDesktop) {
    window.location.href = "/api/gcal/auth";
    return;
  }
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  window.open(
    "/api/gcal/auth",
    "gcal-auth",
    `width=${width},height=${height},left=${left},top=${top},popup=true`,
  );
}

interface GoogleCalendarWidgetProps {
  config: Record<string, string>;
  editMode?: boolean;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

export default function GoogleCalendarWidget({ config, editMode, onUpdateConfig }: GoogleCalendarWidgetProps) {
  const viewMode = (config.viewMode as ViewMode) || "week";
  const { containerRef, compact } = useCompactMode(160);
  // Parse multi-calendar config: calendarIds (JSON) → calendarId (single) → ["primary"]
  const calendarIds: string[] = useMemo(() => {
    if (config.calendarIds) {
      try { return JSON.parse(config.calendarIds); } catch { /* fallback */ }
    }
    if (config.calendarId) return [config.calendarId];
    return ["primary"];
  }, [config.calendarIds, config.calendarId]);

  // Parse calendar color map for fallback event colors
  const calendarColors: Record<string, string> = useMemo(() => {
    if (config.calendarColors) {
      try { return JSON.parse(config.calendarColors); } catch { /* fallback */ }
    }
    return {};
  }, [config.calendarColors]);

  // Build SWR key from calendar + view params
  const swrKey = useMemo(() => {
    const params = new URLSearchParams();
    if (calendarIds.length === 1) {
      params.set("calendarId", calendarIds[0]);
    } else if (calendarIds.length > 1) {
      params.set("calendarIds", calendarIds.join(","));
    }
    const customDays = viewMode === "custom" ? parseInt(config.customDays || "7", 10) : undefined;
    const { timeMin, timeMax } = getTimeRange(viewMode, customDays);
    params.set("timeMin", timeMin);
    params.set("timeMax", timeMax);
    return `/api/gcal/events?${params}`;
  }, [calendarIds, viewMode, config.customDays]);

  // Read cached data for instant render while SWR revalidates in background
  const cachedGcalData = useMemo(() => readGCalCache(swrKey), [swrKey]);

  const { data, isLoading } = useSWR(
    swrKey,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
      refreshInterval: 300000,
      fallbackData: cachedGcalData ?? undefined,
      onSuccess: (freshData) => {
        writeGCalCache(swrKey, freshData);
      },
    }
  );

  const events: GCalEvent[] = data?.events || [];
  const connected: boolean | null = data ? (data.connected ?? true) : null;

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2.5 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1 h-8 rounded bg-muted animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (connected === false) {
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center gap-2 text-foreground no-drag p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar size={20} className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Not connected</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            startGCalConnect();
          }}
          className="px-3 py-1 text-xs rounded-full font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
        >
          Sync
        </button>
      </div>
    );
  }

  const accentFallback = config.accentColor || "#4285F4";
  const displayId = config.gcalDisplay || DEFAULT_GCAL_DISPLAY;
  const DisplayComponent = GCAL_DISPLAY_MAP[displayId] || GCAL_DISPLAY_MAP.list;

  return (
    <div ref={containerRef} className="relative h-full w-full flex flex-col px-5 py-4 overflow-hidden">
      <WidgetHeader
        title="Google Calendar"
        right={
          <span className="text-xs text-foreground">
            {viewMode === "custom"
              ? `${config.customDays || "7"} Days`
              : VIEW_MODES.find((m) => m.key === viewMode)?.label ?? viewMode}
          </span>
        }
      />

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Calendar size={20} className="text-foreground mb-2" />
          <p className="text-sm text-foreground">No events</p>
        </div>
      ) : (
        <DisplayComponent
          events={events.slice(0, compact ? 3 : 50)}
          calendarColors={calendarColors}
          fallbackColor={accentFallback}
          compact={compact}
        />
      )}
      {/* Subtle fade at the bottom edge — tells the user the event list
          continues offscreen when it overflows, without adding a visible
          scrollbar or harsh edge. Sits above the list content but lets
          clicks pass through so events stay interactive. */}
      {events.length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--card)]"
        />
      )}
    </div>
  );
}
