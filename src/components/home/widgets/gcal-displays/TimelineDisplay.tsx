"use client";

/**
 * Timeline display for Google Calendar widget.
 * Vertical timeline with colored dots and a connecting line.
 * The next upcoming event is highlighted with a pulsing dot.
 *
 * @param props - GCalDisplayProps
 */

import { useState, useEffect, useMemo } from "react";
import type { GCalDisplayProps } from "./types";
import {
  parseEventDate, getEventColor, formatCountdown,
  findNextEventId, formatEventTime,
} from "./helpers";
import EventDetailPopover from "./EventDetailPopover";

export default function TimelineDisplay({ events, calendarColors, fallbackColor }: GCalDisplayProps) {
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
      <div className="flex-1 overflow-y-auto relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        {events.map((event, idx) => {
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
              onClick={(e) => setSelectedEvent({ event, color, rect: e.currentTarget.getBoundingClientRect() })}
              className={`no-drag relative flex items-start gap-3 w-full text-left py-1.5 pl-0 pr-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors cursor-pointer ${
                isPast ? "opacity-35" : ""
              } ${selectedEvent?.event.id === event.id ? "bg-black/5 dark:bg-white/5" : ""}`}
            >
              {/* Timeline dot */}
              <div className="relative z-10 mt-1 shrink-0">
                <div
                  className={`w-[15px] h-[15px] rounded-full border-2 ${
                    isNext ? "animate-pulse" : ""
                  }`}
                  style={{
                    backgroundColor: isPast ? "transparent" : color,
                    borderColor: color,
                  }}
                />
              </div>

              {/* Event content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-medium truncate flex-1 ${
                    isPast ? "text-foreground line-through" : "text-foreground"
                  }`}>
                    {event.summary}
                  </p>
                  {countdown && (
                    <span className="text-[9px] font-medium text-blue-500 shrink-0">
                      {countdown}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-foreground mt-0.5">{timeStr}</p>
              </div>
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
