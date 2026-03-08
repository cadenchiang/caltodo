/**
 * Reusable time grid for week and day views.
 * Renders hourly rows with positioned GCal event blocks.
 * Auto-scrolls to current hour on mount.
 */

"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import type { GCalEvent } from "@/lib/types";
import { parseEventDate } from "@/lib/gcal/event-utils";
import TimeGridEvent from "./TimeGridEvent";

/** Default row height in pixels per hour. */
const DEFAULT_ROW_HEIGHT = 60;

interface TimeGridColumn {
  events: GCalEvent[];
  calendarColors?: Record<string, string>;
}

interface TimeGridProps {
  columns: TimeGridColumn[];
  columnDates?: string[];
  startHour?: number;
  endHour?: number;
  rowHeight?: number;
  showCurrentTime?: boolean;
  onTimeDoubleClick?: (date: string, hour: number, minute: number) => void;
}

/**
 * Computes overlap groups for events in a column, assigning left/width
 * so overlapping events split width equally.
 *
 * @param events - Array of timed GCal events for a single column
 * @param startHour - First hour of the grid
 * @param rowHeight - Pixels per hour
 * @returns Array of positioned event data
 */
function layoutEvents(
  events: GCalEvent[],
  startHour: number,
  rowHeight: number
): Array<{ event: GCalEvent; top: number; height: number; left: string; width: string; zIndex: number }> {
  if (events.length === 0) return [];

  /** Offset in % each overlapping event is shifted right. */
  const OVERLAP_OFFSET = 30;
  /** Maximum width % for any event in an overlap group. */
  const MAX_WIDTH = 85;
  /** Minimum width % for the last event in an overlap group. */
  const MIN_WIDTH = 40;

  // Sort by start time, then longer events first (so they sit behind),
  // then tentative/needsAction events last so they render on top
  const sorted = [...events].sort((a, b) => {
    const aStart = new Date(a.start).getTime();
    const bStart = new Date(b.start).getTime();
    if (aStart !== bStart) return aStart - bStart;
    const aDur = new Date(a.end).getTime() - aStart;
    const bDur = new Date(b.end).getTime() - bStart;
    if (aDur !== bDur) return bDur - aDur;
    // Tentative events sort last so they get higher z-index in cascade
    const aTent = a.responseStatus === "tentative" || a.responseStatus === "needsAction" ? 1 : 0;
    const bTent = b.responseStatus === "tentative" || b.responseStatus === "needsAction" ? 1 : 0;
    return aTent - bTent;
  });

  // Compute top/height for each event
  const entries = sorted.map((event) => {
    const s = new Date(event.start);
    const e = new Date(event.end);
    const startMin = s.getHours() * 60 + s.getMinutes();
    const endMin = e.getHours() * 60 + e.getMinutes();
    const top = ((startMin - startHour * 60) / 60) * rowHeight;
    const height = Math.max(((endMin - startMin) / 60) * rowHeight, 20);
    return { event, top, height, startMin, endMin };
  });

  // Group overlapping events: an event overlaps if its start < previous group end
  const groups: (typeof entries)[] = [];
  let currentGroup: typeof entries = [];
  let groupEnd = 0;

  for (const entry of entries) {
    if (currentGroup.length === 0 || entry.startMin < groupEnd) {
      currentGroup.push(entry);
      groupEnd = Math.max(groupEnd, entry.endMin);
    } else {
      groups.push(currentGroup);
      currentGroup = [entry];
      groupEnd = entry.endMin;
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  // Cascade layout: each event in a group is offset right, with decreasing width
  const result: Array<{ event: GCalEvent; top: number; height: number; left: string; width: string; zIndex: number }> = [];

  for (const group of groups) {
    const count = group.length;
    if (count === 1) {
      const entry = group[0];
      result.push({
        event: entry.event,
        top: entry.top,
        height: entry.height,
        left: "0%",
        width: "100%",
        zIndex: 10,
      });
    } else {
      for (let i = 0; i < count; i++) {
        const entry = group[i];
        const leftPct = i * OVERLAP_OFFSET;
        const widthPct = Math.max(Math.min(100 - leftPct, MAX_WIDTH), MIN_WIDTH);
        result.push({
          event: entry.event,
          top: entry.top,
          height: entry.height,
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          zIndex: 10 + i,
        });
      }
    }
  }

  return result;
}

/**
 * Renders a scrollable time grid with hour labels and positioned event blocks.
 *
 * @param columns - Array of column data (one per day in week view, one for day view)
 * @param startHour - First visible hour (default 7)
 * @param endHour - Last visible hour (default 22)
 * @param rowHeight - Pixels per hour (default 60)
 * @param showCurrentTime - Whether to show the red "now" line
 */
/** Preview block state for the ghost placeholder on double-click. */
interface PreviewBlock {
  colIndex: number;
  top: number;
  height: number;
}

export default function TimeGrid({
  columns,
  columnDates,
  startHour = 0,
  endHour = 24,
  rowHeight = DEFAULT_ROW_HEIGHT,
  showCurrentTime = true,
  onTimeDoubleClick,
}: TimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<PreviewBlock | null>(null);

  /** Clear the preview block when clicking outside the grid or when events change. */
  const clearPreview = useCallback(() => setPreview(null), []);
  useEffect(() => { setPreview(null); }, [columns]);

  /** Full day range — always 12 AM to 12 AM (midnight to midnight). */
  const effectiveRange = useMemo(() => ({
    startHour,
    endHour,
  }), [startHour, endHour]);

  const hours = Array.from(
    { length: effectiveRange.endHour - effectiveRange.startHour },
    (_, i) => effectiveRange.startHour + i
  );
  const totalHeight = hours.length * rowHeight;

  // Auto-scroll to current hour on mount (1 hour before current time)
  useEffect(() => {
    if (!scrollRef.current) return;
    const currentHour = new Date().getHours();
    const targetHour = Math.max(0, currentHour - 1);
    scrollRef.current.scrollTop = targetHour * rowHeight;
  }, [rowHeight]);

  // Current time indicator
  const now = new Date();
  const currentMinOfDay = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = ((currentMinOfDay - effectiveRange.startHour * 60) / 60) * rowHeight;
  const showLine = showCurrentTime &&
    currentMinOfDay >= effectiveRange.startHour * 60 &&
    currentMinOfDay <= effectiveRange.endHour * 60;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
      <div className="flex" style={{ minHeight: `${totalHeight}px` }}>
        {/* Hour labels gutter */}
        <div className="w-14 shrink-0 relative" style={{ height: `${totalHeight}px` }}>
          {hours.map((hour) => {
            const top = (hour - effectiveRange.startHour) * rowHeight;
            const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
            return (
              <div
                key={hour}
                className="absolute right-2 text-[10px] text-muted-foreground leading-none"
                style={{ top: `${top - 5}px` }}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* Columns */}
        <div className="flex-1 flex relative">
          {/* Horizontal grid lines */}
          {hours.map((hour) => {
            const top = (hour - effectiveRange.startHour) * rowHeight;
            return (
              <div
                key={`line-${hour}`}
                className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-700/50"
                style={{ top: `${top}px` }}
              />
            );
          })}

          {/* Current time line */}
          {showLine && (
            <div
              className="absolute left-0 right-0 z-20 flex items-center"
              style={{ top: `${currentTimeTop}px` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1" />
              <div className="flex-1 h-[2px] bg-red-500" />
            </div>
          )}

          {/* Event columns */}
          {columns.map((col, i) => {
            const laid = layoutEvents(col.events, effectiveRange.startHour, rowHeight);
            return (
              <div
                key={i}
                className={`flex-1 relative ${i < columns.length - 1 ? "border-r border-gray-200 dark:border-gray-700/50" : ""}`}
                style={{ height: `${totalHeight}px` }}

                onClick={() => clearPreview()}
                onDoubleClick={(e) => {
                  if (!onTimeDoubleClick || !columnDates?.[i]) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const yOffset = e.clientY - rect.top;
                  const totalMinutes = effectiveRange.startHour * 60 + (yOffset / rowHeight) * 60;
                  const hour = Math.floor(totalMinutes / 60);
                  const rawMin = Math.round((totalMinutes % 60) / 15) * 15;
                  const minute = rawMin >= 60 ? 0 : rawMin;
                  const snappedHour = rawMin >= 60 ? hour + 1 : hour;
                  // Show preview block (1 hour)
                  const previewTop = ((snappedHour * 60 + minute - effectiveRange.startHour * 60) / 60) * rowHeight;
                  setPreview({ colIndex: i, top: previewTop, height: rowHeight });
                  onTimeDoubleClick(columnDates[i], snappedHour, minute);
                }}
              >
                {laid.map((item) => (
                  <TimeGridEvent
                    key={item.event.id}
                    event={item.event}
                    calendarColor={col.calendarColors?.[item.event.calendarId ?? ""] ?? undefined}
                    top={item.top}
                    height={item.height}
                    left={item.left}
                    width={item.width}
                    zIndex={item.zIndex}
                  />
                ))}
                {preview && preview.colIndex === i && (
                  <div
                    className="absolute left-0 right-0 rounded-lg bg-blue-500/20 border-2 border-blue-500/40 border-dashed pointer-events-none z-5"
                    style={{
                      top: `${preview.top + 1}px`,
                      height: `${preview.height - 2}px`,
                    }}
                  >
                    <span className="text-[11px] font-medium text-blue-400 px-2 py-1">(No title)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
