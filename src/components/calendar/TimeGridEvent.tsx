/**
 * Positioned event block in a time grid.
 * Shows title, time range, and optional location with a colored left border.
 */

"use client";

import { useState, useCallback } from "react";
import { useSWRConfig } from "swr";
import type { GCalEvent } from "@/lib/types";
import { hexToRgba, getEventColor, formatEventTime, blendHex } from "@/lib/gcal/event-utils";
import { useTheme } from "@/contexts/ThemeContext";
import GCalEventPopover from "./GCalEventPopover";

interface TimeGridEventProps {
  event: GCalEvent;
  calendarColor?: string;
  /** The YYYY-MM-DD date of the column this event is in. */
  columnDate?: string;
  top: number;
  height: number;
  left: string;
  width: string;
  zIndex?: number;
}

/**
 * Renders a positioned GCal event block in a time grid column.
 *
 * @param event - The GCal event to render
 * @param calendarColor - Fallback color from the calendar
 * @param top - Top offset in pixels
 * @param height - Height in pixels
 * @param left - CSS left position (e.g. "0%", "50%")
 * @param width - CSS width (e.g. "100%", "50%")
 */
export default function TimeGridEvent({ event, calendarColor, columnDate, top, height, left, width, zIndex = 10 }: TimeGridEventProps) {
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
  const isSelected = popoverAnchor !== null;
  const { mutate: globalMutate } = useSWRConfig();
  const invalidateEvents = useCallback(() => {
    globalMutate((key: string) => typeof key === "string" && key.startsWith("/api/gcal/events"));
  }, [globalMutate]);
  const handleRsvp = useCallback((eventId: string, status: string) => {
    globalMutate(
      (key: string) => typeof key === "string" && key.startsWith("/api/gcal/events"),
      (data: { events: GCalEvent[] } | undefined) => {
        if (!data?.events) return data;
        return { ...data, events: data.events.map((e) => e.id === eventId ? { ...e, responseStatus: status } : e) };
      },
      { revalidate: false },
    );
  }, [globalMutate]);
  const { colorTheme } = useTheme();
  const rawColor = getEventColor(event.colorId, calendarColor, undefined, colorTheme);
  const minHeight = Math.max(height, 20);

  // Only fade events from past days, not events that ended earlier today
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = columnDate === todayStr;
  const isPast = !isToday && new Date(event.end).getTime() < Date.now();
  const isTentative = event.responseStatus === "tentative" || event.responseStatus === "needsAction";
  const isDeclined = event.responseStatus === "declined";
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");
  /** Use Google's colors directly. Only fade past-day events. */
  const color = rawColor;
  const displayColor = isPast
    ? blendHex(color, isDark ? "#1a1a2e" : "#FFFFFF", 0.45)
    : color;
  const startTime = formatEventTime(event.start, false);
  const endDate = new Date(event.end);
  const endH = endDate.getHours();
  const endM = endDate.getMinutes();
  const endSuffix = endH >= 12 ? "pm" : "am";
  const endH12 = endH === 0 ? 12 : endH > 12 ? endH - 12 : endH;
  const endTime = endM === 0 ? `${endH12}${endSuffix}` : `${endH12}:${String(endM).padStart(2, "0")}${endSuffix}`;
  const textClass = isPast ? "text-foreground/50" : "text-white";

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPopoverAnchor(e.currentTarget.getBoundingClientRect());
        }}
        className={`absolute rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:brightness-110 hover:-translate-y-px ${isTentative && !isPast ? "bg-card" : ""} ${isDeclined ? "opacity-40" : ""}`}
        style={{
          top: `${top + 1}px`,
          height: `${minHeight - 2}px`,
          left,
          width,
          backgroundColor: isTentative ? undefined : displayColor,
          border: isTentative ? `1px solid ${isPast ? displayColor : color}` : `1px solid ${isDark ? "#000000" : "#FFFFFF"}`,
          zIndex: isSelected ? 50 : zIndex,
        }}
        title={event.summary}
        aria-label={`${event.summary}, ${startTime} – ${endTime}${event.location ? `, ${event.location}` : ""}`}
      >
        {minHeight <= 24 ? (
          <div className="px-1.5 h-full flex items-center overflow-hidden text-left" style={{ maskImage: "linear-gradient(to right, black 95%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 95%, transparent 100%)" }}>
            <p
              className={`text-[10px] font-medium leading-none whitespace-nowrap ${textClass}`}
              style={{ color: isTentative ? (isPast ? displayColor : rawColor) : undefined }}
            >
              {event.summary}
            </p>
          </div>
        ) : (
          <div className="px-2 py-1 h-full flex flex-col justify-start overflow-hidden text-left" style={{ maskImage: "linear-gradient(to right, black 95%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 95%, transparent 100%)" }}>
            <p
              className={`text-[12px] font-medium leading-snug whitespace-nowrap ${isDeclined ? "line-through" : ""} ${isTentative ? "" : textClass}`}
              style={isTentative ? { color: isPast ? displayColor : rawColor } : undefined}
            >
              {event.summary}
            </p>
            {minHeight > 30 && (
              <p
                className={`text-[11px] font-medium leading-snug whitespace-nowrap ${isTentative ? "" : textClass}`}
                style={isTentative ? { color: isPast ? displayColor : rawColor, opacity: 0.8 } : undefined}
              >
                {startTime} – {endTime}
              </p>
            )}
            {minHeight > 50 && event.location && (
              <p
                className={`text-[11px] font-medium leading-snug whitespace-nowrap ${isTentative ? "" : textClass}`}
                style={isTentative ? { color: isPast ? displayColor : rawColor, opacity: 0.6 } : undefined}
              >
                {event.location}
              </p>
            )}
          </div>
        )}
      </button>

      {popoverAnchor && (
        <GCalEventPopover
          event={event}
          color={color}
          anchorRect={popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          onDeleted={invalidateEvents}
          onRsvp={handleRsvp}
        />
      )}
    </>
  );
}
