"use client";

/**
 * List display for Google Calendar widget.
 * Events grouped by day with colored sidebar indicators.
 * This is the original/default display style.
 *
 * @param props - GCalDisplayProps
 */

import { useState, useEffect, useMemo } from "react";
import type { GCalDisplayProps } from "./types";
import {
  parseEventDate, getEventColor, formatCountdown,
  groupEventsByDay, dayLabel, findNextEventId, formatEventTime,
} from "./helpers";
import EventDetailPopover from "./EventDetailPopover";

export default function ListDisplay({ events, calendarColors, fallbackColor, compact }: GCalDisplayProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<{ event: typeof events[0]; color: string } | null>(null);

  const now = new Date();
  const todayKey = new Date().toDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toDateString();

  const nextEventId = useMemo(
    () => findNextEventId(events, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, Math.floor(now.getTime() / 60000)]
  );

  const grouped = useMemo(() => groupEventsByDay(events), [events]);

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-2">
        {Array.from(grouped.entries()).map(([dateKey, dayEvents], idx) => (
          <div key={dateKey}>
            <div className={`flex items-center gap-2 px-1 ${idx > 0 ? "mt-1" : ""}`}>
              <span className={`text-[10px] font-semibold tracking-wider shrink-0 ${
                dateKey === todayKey ? "text-blue-500" : "text-foreground"
              }`}>
                {dayLabel(dateKey, todayKey, tomorrowKey)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-1 mt-1">
              {dayEvents.map((event) => {
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
