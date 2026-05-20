"use client";

/**
 * Detail popover for a Google Calendar event.
 * Rendered via portal to document body with backdrop.
 * Displays event title, time, location, description, and calendar link.
 *
 * @param event - The GCalEvent to display
 * @param color - Accent color for the event
 * @param onClose - Callback to close the popover
 */

import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, MapPin, ExternalLink, X, FileText } from "lucide-react";
import type { GCalEvent } from "@/lib/types";
import { parseEventDate } from "./helpers";

/** Popover width in px — matches GCalEventPopover. */
const POPOVER_WIDTH = 448;
/** Minimum gap from viewport edges. */
const GAP = 6;

/**
 * Formats a time range string for an event.
 *
 * @param start - ISO start datetime or date string
 * @param end - ISO end datetime or date string
 * @param allDay - Whether this is an all-day event
 * @returns Formatted string like "Mon, Mar 3 · 8:00 AM – 9:00 AM"
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
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

interface EventDetailPopoverProps {
  event: GCalEvent;
  color: string;
  /** Anchor rectangle for positioning the popover next to the clicked element. */
  anchorRect?: DOMRect;
  onClose: () => void;
}

/**
 * Detail popover for a Google Calendar event inside the home widget.
 * When anchorRect is provided, positions next to the anchor element.
 * Falls back to centered layout if no anchor.
 *
 * @param event - The GCalEvent to display
 * @param color - Accent color for the event dot
 * @param anchorRect - DOMRect of the clicked element for positioning
 * @param onClose - Callback to close the popover
 */
export default function EventDetailPopover({ event, color, anchorRect, onClose }: EventDetailPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  // Compute anchor-relative position
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchorRect) return;

    const popoverHeight = el.scrollHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;

    // Horizontal: place to right or left of anchor
    let left: number;
    if (anchorCenterX < vw / 2) {
      left = anchorRect.right + GAP;
    } else {
      left = anchorRect.left - POPOVER_WIDTH - GAP;
    }
    left = Math.max(GAP, Math.min(left, vw - POPOVER_WIDTH - GAP));

    // Vertical: blend between anchor top and viewport center
    const anchorTop = anchorRect.top;
    const centeredTop = (vh - popoverHeight) / 2;
    const BLEND = 0.35;
    let top = anchorTop + (centeredTop - anchorTop) * BLEND;

    if (top + popoverHeight > vh - GAP) {
      top = vh - popoverHeight - GAP;
    }
    top = Math.max(GAP, top);

    setPos({ left, top });
  }, [anchorRect]);

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
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="absolute bg-popover rounded-lg shadow-2xl border border-border overflow-hidden animate-in"
        style={
          anchorRect && pos
            ? { left: pos.left, top: pos.top, width: POPOVER_WIDTH }
            : { left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: POPOVER_WIDTH }
        }
      >
        <div className="flex items-center justify-end gap-1 px-2 pt-2">
          <a
            href={event.htmlLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open in Google Calendar"
          >
            <ExternalLink size={18} />
          </a>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-start gap-4 px-6 pb-4 pt-1">
          <div className="w-4 h-4 rounded shrink-0 mt-1.5" style={{ backgroundColor: color }} />
          <div className="min-w-0 flex-1">
            <h3 className="text-[22px] font-normal text-foreground leading-7">{event.summary}</h3>
            <p className="text-sm text-foreground mt-0.5">
              {formatTimeRange(event.start, event.end, event.allDay)}
            </p>
          </div>
        </div>

        <div className="pb-4">
          {event.location && (
            <div className="flex items-start gap-4 px-6 py-2.5">
              <MapPin size={20} className="shrink-0 mt-0.5 text-foreground" />
              <span className="text-sm font-medium text-foreground">{event.location}</span>
            </div>
          )}
          {description && (
            <div className="flex items-start gap-4 px-6 py-2.5">
              <FileText size={20} className="shrink-0 mt-0.5 text-foreground" />
              <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">{description}</p>
            </div>
          )}
          <div className="flex items-center gap-4 px-6 py-2.5">
            <Calendar size={20} className="shrink-0 text-foreground" />
            <span className="text-sm text-foreground">{event.calendarId || "Google Calendar"}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
