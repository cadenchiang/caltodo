"use client";

/**
 * Widget showing upcoming Google Calendar events.
 * Supports Today/Week/Month view mode toggle.
 * Fetches from /api/gcal/events with timeMin/timeMax query params.
 *
 * @param config - Per-widget config (optional calendarId, viewMode)
 * @param onUpdateConfig - Callback to persist config changes
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { useCompactMode } from "@/hooks/useCompactMode";
import type { GCalEvent } from "@/lib/types";

/** Google Calendar color IDs mapped to hex colors. */
const GCAL_COLORS: Record<string, string> = {
  "1": "#7986CB", "2": "#33B679", "3": "#8E24AA", "4": "#E67C73",
  "5": "#F6BF26", "6": "#F4511E", "7": "#039BE5", "8": "#616161",
  "9": "#3F51B5", "10": "#0B8043", "11": "#D50000",
};

/**
 * Parses an event start/end string into a local Date.
 * All-day events use "YYYY-MM-DD" which new Date() parses as UTC midnight,
 * shifting back a day in western timezones. This function detects date-only
 * strings and constructs local midnight instead.
 *
 * @param dateStr - ISO datetime string or YYYY-MM-DD date string
 * @returns Date object in local timezone
 */
function parseEventDate(dateStr: string): Date {
  // Date-only format: "2026-03-03" (no "T" character)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d); // local midnight
  }
  return new Date(dateStr);
}

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

/**
 * Formats a relative time string for the next upcoming event.
 *
 * @param diffMs - Milliseconds until event starts (positive = future)
 * @returns Human-readable relative time like "in 5 min", "in 2 hr", or "now"
 */
function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return "now";
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "in <1 min";
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (hrs < 24 && remainMins === 0) return `in ${hrs} hr`;
  if (hrs < 24) return `in ${hrs} hr ${remainMins} min`;
  return "";
}

function EventsByDay({ events, calendarColors = {}, fallbackColor = "#039BE5" }: { events: GCalEvent[]; calendarColors?: Record<string, string>; fallbackColor?: string }) {
  // Tick state: re-render every 60s to keep countdown fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const today = new Date();
  const todayKey = today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toDateString();

  // Find the next upcoming event (first non-all-day event starting in the future, or currently ongoing)
  const nextEventId = useMemo(() => {
    for (const event of events) {
      if (event.allDay) continue;
      const start = new Date(event.start);
      const end = parseEventDate(event.end);
      // Currently ongoing or starts in the future
      if (end > now) return event.id;
      // Skip past events
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, Math.floor(now.getTime() / 60000)]);

  /**
   * Groups events by their date string key.
   * All-day events use YYYY-MM-DD format which new Date() parses as UTC,
   * causing a day shift in western timezones. We detect date-only strings
   * and parse them as local midnight instead.
   */
  const grouped = useMemo(() => {
    const map = new Map<string, GCalEvent[]>();
    for (const event of events) {
      const key = parseEventDate(event.start).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [events]);

  /**
   * Returns a human-readable day label.
   *
   * @param dateKey - Date.toDateString() key
   * @returns "Today", "Tomorrow", or a formatted date string
   */
  function dayLabel(dateKey: string): string {
    if (dateKey === todayKey) return "Today";
    if (dateKey === tomorrowKey) return "Tomorrow";
    return new Date(dateKey).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {Array.from(grouped.entries()).map(([dateKey, dayEvents], idx) => (
        <div key={dateKey}>
          {/* Day divider */}
          <div className={`flex items-center gap-2 px-1 ${idx > 0 ? "mt-1" : ""}`}>
            <span className={`text-[10px] font-semibold tracking-wider shrink-0 ${
              dateKey === todayKey ? "text-blue-500" : "text-foreground"
            }`}>
              {dayLabel(dateKey)}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Events for this day */}
          <div className="space-y-1 mt-1">
            {dayEvents.map((event) => {
              const color = event.colorId
                ? GCAL_COLORS[event.colorId]
                : (event.calendarId && calendarColors[event.calendarId]) || fallbackColor;
              const timeStr = event.allDay
                ? "All day"
                : new Date(event.start).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });

              // Detect past events: compare event end time to now
              const eventEnd = parseEventDate(event.end);
              const isPast = eventEnd < now;

              // Countdown for the next upcoming event
              const isNext = event.id === nextEventId;
              const eventStart = new Date(event.start);
              const countdown = isNext && !event.allDay
                ? formatCountdown(eventStart.getTime() - now.getTime())
                : "";

              return (
                <a
                  key={event.id}
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`no-drag flex items-center gap-2 bg-muted/50 rounded-lg p-2 hover:bg-black/10 dark:hover:bg-white/15 transition-colors ${
                    isPast ? "opacity-40" : ""
                  }`}
                >
                  <div
                    className="w-[3px] self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate ${
                      isPast ? "text-muted-foreground line-through" : "text-foreground"
                    }`}>
                      {event.summary}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className={`text-[10px] ${
                        isPast ? "text-muted-foreground" : "text-foreground/80"
                      }`}>
                        {timeStr}
                      </p>
                      {countdown && (
                        <span className="text-[9px] font-medium text-blue-500">
                          {countdown}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

interface GoogleCalendarWidgetProps {
  config: Record<string, string>;
  editMode?: boolean;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

export default function GoogleCalendarWidget({ config, editMode, onUpdateConfig }: GoogleCalendarWidgetProps) {
  const router = useRouter();
  const viewMode = (config.viewMode as ViewMode) || "week";
  const { containerRef, compact } = useCompactMode(160);
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

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

  const calendarIdsKey = calendarIds.join(",");

  const fetchEvents = useCallback(async () => {
    try {
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

      const res = await fetch(`/api/gcal/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data.events || []);
      setConnected(data.connected ?? true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarIdsKey, viewMode, config.customDays]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col p-4">
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
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
        <Calendar size={24} className="text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">Google Calendar</p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Connect to see your events
        </p>
        <button
          type="button"
          onClick={() => router.push("/app/settings?section=integrations")}
          className="no-drag inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Sync Google Calendar
        </button>
      </div>
    );
  }

  const accentFallback = config.accentColor || "#039BE5";

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Google Calendar</h3>
        <span className="text-[10px] text-muted-foreground">
          {viewMode === "custom"
            ? `${config.customDays || "7"} Days`
            : VIEW_MODES.find((m) => m.key === viewMode)?.label ?? viewMode}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Calendar size={20} className="text-foreground mb-2" />
          <p className="text-sm text-foreground">No events</p>
        </div>
      ) : (
        <EventsByDay
          events={events.slice(0, compact ? 3 : 50)}
          calendarColors={calendarColors}
          fallbackColor={accentFallback}
        />
      )}
    </div>
  );
}
