"use client";

/**
 * Agenda display for Google Calendar widget.
 * Clean layout with bold times on the left and event details on the right.
 * Separated by subtle horizontal dividers.
 *
 * @param props - GCalDisplayProps
 */

import { useState, useEffect, useMemo } from "react";
import type { GCalDisplayProps } from "./types";
import {
  parseEventDate, getEventColor, formatCountdown,
  findNextEventId,
} from "./helpers";
import EventDetailPopover from "./EventDetailPopover";

export default function AgendaDisplay({ events, calendarColors, fallbackColor }: GCalDisplayProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<{ event: typeof events[0]; color: string; rect: DOMRect } | null>(null);

  const now = new Date();
  const nextEventId = useMemo(
    () => findNextEventId(events, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, Math.floor(now.getTime() / 60000)]
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {events.map((event, idx) => {
          const color = getEventColor(event, calendarColors, fallbackColor);
          const eventEnd = parseEventDate(event.end);
          const isPast = eventEnd < now;
          const isNext = event.id === nextEventId;
          const countdown = isNext && !event.allDay
            ? formatCountdown(new Date(event.start).getTime() - now.getTime())
            : "";

          const startDate = new Date(event.start);
          const timeTop = event.allDay
            ? "ALL"
            : startDate.toLocaleTimeString([], { hour: "numeric" }).replace(/\s?(AM|PM)/, "");
          const timeBottom = event.allDay
            ? "DAY"
            : startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).match(/AM|PM/)?.[0] || "";

          return (
            <button
              key={event.id}
              type="button"
              onClick={(e) => setSelectedEvent({ event, color, rect: e.currentTarget.getBoundingClientRect() })}
              className={`no-drag flex items-center gap-3 w-full text-left py-2 px-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                isPast ? "opacity-35" : ""
              } ${idx > 0 ? "border-t border-border/50" : ""} ${selectedEvent?.event.id === event.id ? "bg-black/5 dark:bg-white/5" : ""}`}
            >
              {/* Time column */}
              <div className="w-8 shrink-0 text-center">
                <p className={`text-sm font-semibold leading-none tabular-nums ${
                  isPast ? "text-muted-foreground" : "text-foreground"
                }`}>
                  {timeTop}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{timeBottom}</p>
              </div>

              {/* Color accent line */}
              <div
                className="w-0.5 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />

              {/* Event details */}
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium truncate ${
                  isPast ? "text-muted-foreground line-through" : "text-foreground"
                }`}>
                  {event.summary}
                </p>
                {event.location && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {event.location}
                  </p>
                )}
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

      {selectedEvent && (
        <EventDetailPopover
          event={selectedEvent.event}
          color={selectedEvent.color}
          anchorRect={selectedEvent.rect}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
}
