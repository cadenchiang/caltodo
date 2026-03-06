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

import { useState, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, ExternalLink, X, FileText } from "lucide-react";
import { useCompactMode } from "@/hooks/useCompactMode";
import { WidgetShell, WidgetHeader, WidgetEmptyState } from "./WidgetPrimitives";
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
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

/**
 * Formats a time range string for an event.
 *
 * @param start - ISO start datetime or date string
 * @param end - ISO end datetime or date string
 * @param allDay - Whether this is an all-day event
 * @returns Formatted string like "Mon, Mar 3 · 8:00 AM – 9:00 AM" or "All day"
 */
function formatTimeRange(start: string, end: string, allDay: boolean): string {
  if (allDay) {
    const s = parseEventDate(start);
    return s.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + " · All day";
  }
  const s = new Date(start);
  const e = new Date(end);
  const datePart = s.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const startTime = s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const endTime = e.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${startTime} – ${endTime}`;
}

/**
 * Strips HTML tags from a string for plain-text display.
 *
 * @param html - HTML string from Google Calendar description
 * @returns Plain text string
 */
function stripHtml(html: string): string {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

/**
 * Detail popover matching Google Calendar's event card design.
 * Renders via portal to document body with backdrop.
 *
 * Layout: close button top-right, colored dot + title + time header,
 * then icon-row details (location, description, calendar link).
 *
 * @param event - The GCalEvent to display
 * @param color - Accent color for the event
 * @param onClose - Callback to close the popover
 */
function EventDetailPopover({ event, color, onClose }: { event: GCalEvent; color: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const description = event.description ? stripHtml(event.description) : null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div
        ref={ref}
        className="relative bg-popover rounded-lg shadow-2xl border border-border w-full max-w-[448px] overflow-hidden animate-in"
      >
        {/* Top action bar — close button */}
        <div className="flex items-center justify-end gap-1 px-2 pt-2">
          <a
            href={event.htmlLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open in Google Calendar"
          >
            <ExternalLink size={18} />
          </a>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title section — colored dot + title + time */}
        <div className="flex items-start gap-4 px-6 pb-4 pt-1">
          <div
            className="w-4 h-4 rounded shrink-0 mt-1.5"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-[22px] font-normal text-foreground leading-7">
              {event.summary}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatTimeRange(event.start, event.end, event.allDay)}
            </p>
          </div>
        </div>

        {/* Detail rows */}
        <div className="pb-4">
          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-4 px-6 py-2.5">
              <MapPin size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {event.location}
              </span>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="flex items-start gap-4 px-6 py-2.5">
              <FileText size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
                {description}
              </p>
            </div>
          )}

          {/* Calendar name */}
          <div className="flex items-center gap-4 px-6 py-2.5">
            <Calendar size={20} className="shrink-0 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {event.calendarId || "Google Calendar"}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function EventsByDay({ events, calendarColors = {}, fallbackColor = "#039BE5" }: { events: GCalEvent[]; calendarColors?: Record<string, string>; fallbackColor?: string }) {
  // Tick state: re-render every 60s to keep countdown fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<{ event: GCalEvent; color: string } | null>(null);

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
      const end = parseEventDate(event.end);
      if (end > now) return event.id;
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, Math.floor(now.getTime() / 60000)]);

  /**
   * Groups events by their date string key.
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
    <>
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
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEvent({ event, color })}
                    className={`no-drag flex items-center gap-2 bg-muted/50 rounded-lg p-2 hover:bg-black/10 dark:hover:bg-white/15 transition-colors w-full text-left cursor-pointer ${
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
                      <p className={`text-[10px] mt-0.5 ${
                        isPast ? "text-muted-foreground" : "text-foreground/80"
                      }`}>
                        {timeStr}
                      </p>
                    </div>
                    {countdown && (
                      <span className="text-[9px] font-medium text-blue-500 shrink-0">
                        {countdown}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <EventDetailPopover
          event={selectedEvent.event}
          color={selectedEvent.color}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
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
    }
  );

  const events: GCalEvent[] = data?.events || [];
  const connected: boolean | null = data ? (data.connected ?? true) : null;

  if (isLoading) {
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
      <WidgetEmptyState
        icon={<Calendar size={24} />}
        message="Connect to see your events"
        action={
          <button
            type="button"
            onClick={() => router.push("/app/settings?section=integrations")}
            className="no-drag inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Sync Google Calendar
          </button>
        }
      />
    );
  }

  const accentFallback = config.accentColor || "#039BE5";

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col p-4 overflow-hidden">
      <WidgetHeader
        title="Google Calendar"
        right={
          <span className="text-[10px] text-muted-foreground">
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
        <EventsByDay
          events={events.slice(0, compact ? 3 : 50)}
          calendarColors={calendarColors}
          fallbackColor={accentFallback}
        />
      )}
    </div>
  );
}
