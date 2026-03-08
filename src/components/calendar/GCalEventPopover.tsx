/**
 * Detail popover for Google Calendar events.
 * Renders via portal to document body, positioned near the clicked element.
 * Reused in month/week/day views when clicking a GCal event.
 */

"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin, ExternalLink, X, FileText, Calendar, Check, HelpCircle, Trash2, Users } from "lucide-react";
import type { GCalEvent } from "@/lib/types";
import { parseEventDate } from "@/lib/gcal/event-utils";
import { useToast } from "@/contexts/ToastContext";

/** Width of the popover in pixels. */
const POPOVER_WIDTH = 448;
/** Gap between anchor and popover edge. */
const GAP = 6;
/** Max attendees to show before collapsing. */
const MAX_VISIBLE_ATTENDEES = 3;

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

/**
 * Formats a time range string for an event.
 *
 * @param start - ISO start datetime or date string
 * @param end - ISO end datetime or date string
 * @param allDay - Whether this is an all-day event
 * @returns Formatted string like "Mon, Mar 3 - 8:00 AM - 9:00 AM" or "All day"
 */
function formatTimeRange(start: string, end: string, allDay: boolean): string {
  if (allDay) {
    const s = parseEventDate(start);
    return s.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + " - All day";
  }
  const s = new Date(start);
  const e = new Date(end);
  const datePart = s.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const startTime = s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const endTime = e.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${datePart} - ${startTime} - ${endTime}`;
}

/**
 * Official Google Meet logo as inline SVG.
 *
 * @param size - Icon size in pixels
 * @returns SVG element
 */
function GoogleMeetIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.51 72" fill="none" className="shrink-0">
      <path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z" />
      <path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z" />
      <path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z" />
      <path fill="#2684fc" d="M20.5 20.5H0v31h20.5z" />
      <path fill="#00ac47" d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z" />
      <path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z" />
    </svg>
  );
}

interface GCalEventPopoverProps {
  event: GCalEvent;
  color: string;
  /** Bounding rect of the clicked element for positioning. */
  anchorRect?: DOMRect;
  onClose: () => void;
  onDeleted?: () => void;
  onRsvp?: (eventId: string, status: string) => void;
}

/**
 * Google Calendar event detail popover.
 * Positioned near the anchor element (like TaskPreviewPopover).
 *
 * @param event - The GCalEvent to display
 * @param color - Accent color for the event
 * @param anchorRect - DOMRect of the clicked element for positioning
 * @param onClose - Callback to close the popover
 * @param onDeleted - Callback after event is deleted
 * @param onRsvp - Callback for RSVP status change
 */
export default function GCalEventPopover({ event, color, anchorRect, onClose, onDeleted, onRsvp }: GCalEventPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showAllAttendees, setShowAllAttendees] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    // Move focus into the popover for keyboard accessibility
    const timer = setTimeout(() => ref.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  /** Send RSVP response — optimistically update visual and toast. */
  function handleRsvp(status: "accepted" | "tentative" | "declined") {
    const label = status === "accepted" ? "Accepted" : status === "tentative" ? "Maybe" : "Declined";
    showToast(`${label}: ${event.summary}`);
    onRsvp?.(event.id, status);
    onClose();
    fetch("/api/gcal/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, calendarId: event.calendarId || "primary", status }),
    }).catch(() => showToast("Failed to update RSVP"));
  }

  const showRsvp = event.responseStatus !== null && (event.attendeeCount ?? 0) > 0;

  /** Delete event with two-click confirmation. */
  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    showToast(`Deleted: ${event.summary}`);
    onClose();
    onDeleted?.();
    fetch("/api/gcal/events/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, calendarId: event.calendarId || "primary" }),
    }).catch(() => showToast("Failed to delete event"));
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  /** Position the popover near the anchor, biased toward viewport center. */
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchorRect) return;

    const popoverHeight = el.scrollHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;

    let left: number;
    if (anchorCenterX < vw / 2) {
      left = anchorRect.right + GAP;
    } else {
      left = anchorRect.left - POPOVER_WIDTH - GAP;
    }
    left = Math.max(GAP, Math.min(left, vw - POPOVER_WIDTH - GAP));

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

  const description = event.description ? stripHtml(event.description) : null;
  const attendees = event.attendees ?? [];
  const visibleAttendees = showAllAttendees ? attendees : attendees.slice(0, MAX_VISIBLE_ATTENDEES);
  const hiddenCount = attendees.length - MAX_VISIBLE_ATTENDEES;

  const popoverContent = (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Event: ${event.summary}`}
      tabIndex={-1}
      className={`fixed z-[9999] bg-popover rounded-2xl shadow-2xl border border-border overflow-hidden transition-[opacity,transform] duration-150 ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={anchorRect ? {
        left: pos.left,
        top: pos.top,
        width: POPOVER_WIDTH,
        maxHeight: "85vh",
        overflowY: "auto",
      } : {
        left: "50%",
        top: "50%",
        transform: visible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.95)",
        width: POPOVER_WIDTH,
        maxHeight: "85vh",
        overflowY: "auto",
      }}
    >
      {/* Top action bar */}
      <div className="flex items-center justify-end gap-1 px-2 pt-2">
        <button
          onClick={handleDelete}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            confirmDelete
              ? "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          aria-label={confirmDelete ? "Confirm delete" : "Delete event"}
          title={confirmDelete ? "Click again to delete" : "Delete event"}
        >
          <Trash2 size={18} />
        </button>
        <a
          href={event.htmlLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open in Google Calendar"
        >
          <ExternalLink size={18} />
        </a>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Title section */}
      <div className="flex items-start gap-4 px-6 pb-4 pt-1">
        <div
          className="w-4 h-4 rounded shrink-0 mt-1.5"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-[22px] font-normal text-foreground leading-7">
            {event.summary}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatTimeRange(event.start, event.end, event.allDay)}
          </p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="pb-4">
        {event.location && (
          <div className="flex items-start gap-4 px-6 py-2.5">
            <MapPin size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {event.location}
            </span>
          </div>
        )}

        {description && (
          <div className="flex items-start gap-4 px-6 py-2.5">
            <FileText size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
            <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
              {description}
            </p>
          </div>
        )}

        {event.meetLink && (
          <div className="flex items-center gap-4 px-6 py-2.5">
            <GoogleMeetIcon size={20} />
            <a
              href={event.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-500 hover:underline"
            >
              Join Google Meet
            </a>
          </div>
        )}

        {attendees.length > 0 && (
          <div className="flex items-start gap-4 px-6 py-2.5">
            <Users size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-foreground space-y-0.5 min-w-0">
              {visibleAttendees.map((a) => (
                <p key={a.email} className="truncate">
                  {a.displayName}
                  {a.responseStatus === "declined" ? " (declined)" : a.responseStatus === "tentative" ? " (maybe)" : ""}
                </p>
              ))}
              {hiddenCount > 0 && !showAllAttendees && (
                <button
                  onClick={() => setShowAllAttendees(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  +{hiddenCount} more
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 px-6 py-2.5">
          <Calendar size={20} className="shrink-0 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {event.calendarSummary || "Google Calendar"}
          </span>
        </div>

        {showRsvp && (
          <div className="flex items-center gap-2 px-6 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground mr-1">RSVP:</span>
            <button
              onClick={() => handleRsvp("accepted")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                event.responseStatus === "accepted"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
              }`}
            >
              <Check size={12} /> Yes
            </button>
            <button
              onClick={() => handleRsvp("tentative")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                event.responseStatus === "tentative"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-muted text-muted-foreground hover:bg-yellow-50 hover:text-yellow-700 dark:hover:bg-yellow-900/20"
              }`}
            >
              <HelpCircle size={12} /> Maybe
            </button>
            <button
              onClick={() => handleRsvp("declined")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                event.responseStatus === "declined"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
              }`}
            >
              <X size={12} /> No
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(popoverContent, document.body);
}
