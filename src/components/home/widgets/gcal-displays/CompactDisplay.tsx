"use client";

/**
 * Compact display for Google Calendar widget.
 * Minimal dense rows — just colored dot, title, and time.
 * No cards or backgrounds, maximum information density.
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

export default function CompactDisplay({ events, calendarColors, fallbackColor }: GCalDisplayProps) {
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
              onClick={(e) => setSelectedEvent({ event, color, rect: e.currentTarget.getBoundingClientRect() })}
              className={`no-drag flex items-center gap-2 w-full text-left px-1 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors cursor-pointer ${
                isPast ? "opacity-35" : ""
              } ${selectedEvent?.event.id === event.id ? "bg-black/5 dark:bg-white/5" : ""}`}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className={`text-[11px] truncate flex-1 ${
                isPast ? "text-foreground line-through" : "text-foreground"
              }`}>
                {event.summary}
              </span>
              <span className="text-[10px] text-foreground tabular-nums shrink-0">
                {timeStr}
              </span>
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
