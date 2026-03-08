"use client";

/**
 * Cards display for Google Calendar widget.
 * Each event rendered as a color-accented card with tinted background.
 * Shows time, title, and optional location.
 *
 * @param props - GCalDisplayProps
 */

import { useState, useEffect, useMemo } from "react";
import { MapPin } from "lucide-react";
import type { GCalDisplayProps } from "./types";
import {
  parseEventDate, getEventColor, formatCountdown,
  findNextEventId, formatEventTime,
} from "./helpers";
import EventDetailPopover from "./EventDetailPopover";

export default function CardsDisplay({ events, calendarColors, fallbackColor }: GCalDisplayProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<{ event: typeof events[0]; color: string } | null>(null);

  const now = new Date();
  const nextEventId = useMemo(
    () => findNextEventId(events, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, Math.floor(now.getTime() / 60000)]
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {events.map((event) => {
          const color = getEventColor(event, calendarColors, fallbackColor);
          const timeStr = formatEventTime(event);
          const eventEnd = parseEventDate(event.end);
          const isPast = eventEnd < now;
          const isNext = event.id === nextEventId;
          const countdown = isNext && !event.allDay
            ? formatCountdown(new Date(event.start).getTime() - now.getTime())
            : "";

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelectedEvent({ event, color })}
              className={`no-drag w-full text-left rounded-lg p-2 transition-all cursor-pointer hover:brightness-95 dark:hover:brightness-110 ${
                isPast ? "opacity-35" : ""
              }`}
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-medium truncate ${
                  isPast ? "line-through text-muted-foreground" : "text-foreground"
                }`}>
                  {event.summary}
                </p>
                {countdown && (
                  <span className="text-[9px] font-medium text-blue-500 shrink-0">
                    {countdown}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{timeStr}</span>
                {event.location && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                    <MapPin size={8} className="shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
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
