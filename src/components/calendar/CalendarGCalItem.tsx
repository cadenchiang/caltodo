/**
 * Month view line item for a Google Calendar event.
 * Shows a colored dot + compact time + truncated title.
 * Click opens GCalEventPopover.
 */

"use client";

import { useState, useCallback } from "react";
import { useSWRConfig } from "swr";
import type { GCalEvent } from "@/lib/types";
import { formatEventTime, getEventColor, blendHex } from "@/lib/gcal/event-utils";
import GCalEventPopover from "./GCalEventPopover";

interface CalendarGCalItemProps {
  event: GCalEvent;
  calendarColor?: string;
}

/**
 * Renders a single GCal event as a dot+time+title line in month view.
 *
 * @param event - The GCalEvent to display
 * @param calendarColor - Fallback color from the calendar
 */
export default function CalendarGCalItem({ event, calendarColor }: CalendarGCalItemProps) {
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
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
  const color = getEventColor(event.colorId, calendarColor);
  const timeStr = formatEventTime(event.start, event.allDay);
  const isPast = new Date(event.end).getTime() < Date.now();
  const isTentative = event.responseStatus === "tentative" || event.responseStatus === "needsAction";
  const isDeclined = event.responseStatus === "declined";
  const dotColor = isPast ? blendHex(color, "#FFFFFF", 0.5) : color;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPopoverAnchor(e.currentTarget.getBoundingClientRect());
        }}
        className={`w-full text-left flex items-center gap-1 px-1 py-0 rounded hover:bg-gray-100 dark:hover:bg-white/10 hover:brightness-110 hover:-translate-y-px transition-all overflow-hidden cursor-pointer h-[16px] ${isDeclined ? "opacity-40" : ""}`}
        title={event.summary}
        aria-label={`${event.summary}${!event.allDay ? `, ${timeStr}` : ""}${event.location ? `, ${event.location}` : ""}`}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={isTentative
            ? { backgroundColor: "transparent", border: `1.5px solid ${dotColor}`, opacity: isPast ? 0.5 : 1 }
            : { backgroundColor: dotColor }
          }
        />
        {!event.allDay && (
          <span className={`text-[10px] shrink-0 font-medium ${isPast ? "text-foreground/40" : "text-foreground"}`}>
            {timeStr}
          </span>
        )}
        <span className={`text-[10px] font-medium truncate ${isDeclined ? "line-through" : ""} ${isPast ? "text-foreground/50" : "text-foreground"}`}>
          {event.summary}
        </span>
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
