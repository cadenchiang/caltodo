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

  const [selectedEvent, setSelectedEvent] = useState<{ event: typeof events[0]; color: string; rect: DOMRect } | null>(null);

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
              <span className={`text-xs font-normal shrink-0 ${
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

                // Full-tint background + saturated left beam. Use
                // color-mix so the tint adapts to whatever event color
                // is assigned without hard-coding every Google Calendar
                // palette value.
                const tintedBg = `color-mix(in srgb, ${color} 18%, transparent)`;
                const tintedBgHover = `color-mix(in srgb, ${color} 28%, transparent)`;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={(e) => setSelectedEvent({ event, color, rect: e.currentTarget.getBoundingClientRect() })}
                    className={`no-drag relative flex items-center gap-2 rounded-lg pl-3 pr-2 py-2 transition-colors w-full text-left cursor-pointer overflow-hidden ${
                      isPast ? "opacity-50" : ""
                    }`}
                    style={{ backgroundColor: selectedEvent?.event.id === event.id ? tintedBgHover : tintedBg }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tintedBgHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedEvent?.event.id === event.id ? tintedBgHover : tintedBg; }}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-normal truncate text-foreground ${
                        isPast ? "line-through" : ""
                      }`}>
                        {event.summary}
                      </p>
                      <p className="text-xs font-normal mt-0.5 text-foreground">
                        {timeStr}
                      </p>
                    </div>
                    {countdown && (
                      <span className="text-xs font-normal text-blue-500 shrink-0">
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
          anchorRect={selectedEvent.rect}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
}
