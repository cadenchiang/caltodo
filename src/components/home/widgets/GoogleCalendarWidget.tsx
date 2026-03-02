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
import { Calendar } from "lucide-react";
import type { GCalEvent } from "@/lib/types";

/** Google Calendar color IDs mapped to hex colors. */
const GCAL_COLORS: Record<string, string> = {
  "1": "#7986CB", "2": "#33B679", "3": "#8E24AA", "4": "#E67C73",
  "5": "#F6BF26", "6": "#F4511E", "7": "#039BE5", "8": "#616161",
  "9": "#3F51B5", "10": "#0B8043", "11": "#D50000",
};

/** View mode options for the calendar. */
type ViewMode = "today" | "week" | "month";

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

/**
 * Computes timeMin/timeMax ISO strings for the given view mode.
 *
 * @param mode - View mode to compute range for
 * @returns Object with timeMin and timeMax ISO strings
 */
function getTimeRange(mode: ViewMode): { timeMin: string; timeMax: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);

  switch (mode) {
    case "today":
      end.setDate(end.getDate() + 1);
      break;
    case "week":
      end.setDate(end.getDate() + 7);
      break;
    case "month":
      end.setDate(end.getDate() + 30);
      break;
  }

  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

/**
 * Groups events by date key and renders with day dividers.
 *
 * @param events - Sorted array of GCalEvents to display
 * @param calendarColors - Map of calendarId → hex color for fallback event colors
 */
function EventsByDay({ events, calendarColors = {} }: { events: GCalEvent[]; calendarColors?: Record<string, string> }) {
  const today = new Date();
  const todayKey = today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toDateString();

  /** Groups events by their date string key. */
  const grouped = useMemo(() => {
    const map = new Map<string, GCalEvent[]>();
    for (const event of events) {
      const key = new Date(event.start).toDateString();
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
                : (event.calendarId && calendarColors[event.calendarId]) || "#039BE5";
              const timeStr = event.allDay
                ? "All day"
                : new Date(event.start).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });

              return (
                <a
                  key={event.id}
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-drag flex items-start gap-2 bg-muted/50 rounded-lg p-2 hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
                >
                  <div
                    className="w-[3px] min-h-[28px] rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">
                      {event.summary}
                    </p>
                    <p className="text-[10px] text-foreground/70 mt-0.5">
                      {timeStr}
                    </p>
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
  const viewMode = (config.viewMode as ViewMode) || "week";
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

      const { timeMin, timeMax } = getTimeRange(viewMode);
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
  }, [calendarIdsKey, viewMode]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
        <a
          href="/app/settings?section=integrations"
          className="no-drag inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Sync Google Calendar
        </a>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Google Calendar</h3>
        <span className="text-[10px] text-muted-foreground capitalize">{viewMode}</span>
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Calendar size={20} className="text-foreground mb-2" />
          <p className="text-sm text-foreground">No events</p>
        </div>
      ) : (
        <EventsByDay events={events.slice(0, 12)} calendarColors={calendarColors} />
      )}
    </div>
  );
}
