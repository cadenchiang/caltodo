"use client";

/**
 * Modal for creating a new Google Calendar event. Part of the calendar
 * overlay mode, which is currently never mounted (see CalendarPanel).
 * Built on Modal so it shares the task editor's dialog semantics.
 */

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { CalendarDays, Clock, MapPin, AlignLeft } from "lucide-react";
import { format } from "date-fns";
import { useLocationAutocomplete } from "@/hooks/useLocationAutocomplete";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ACTIONS } from "@/lib/copy";

interface GCalEventCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultDate?: string | null;
  defaultStartTime?: string | null;
  defaultEndTime?: string | null;
  /** When provided, shows a Task/Event toggle at the top. */
  createTypeToggle?: React.ReactNode;
}

/** Row recipe shared with the task editor. */
const ROW = "flex items-center gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-muted";

/**
 * Builds the request body for /api/gcal/events/create.
 *
 * @returns The body, or an error message when the inputs do not form a valid range
 */
export function buildEventBody(input: { title: string; date: string; allDay: boolean; startTime: string; endTime: string; location: string; description: string }): { body: Record<string, unknown> } | { error: string } {
  const { title, date, allDay, startTime, endTime, location, description } = input;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Invalid date" };
  const body: Record<string, unknown> = { summary: title.trim(), allDay };
  if (allDay) {
    const endDate = new Date(`${date}T00:00:00`);
    if (isNaN(endDate.getTime())) return { error: "Invalid date" };
    endDate.setDate(endDate.getDate() + 1);
    body.start = date;
    body.end = format(endDate, "yyyy-MM-dd");
  } else {
    const startDt = new Date(`${date}T${startTime}`);
    const endDt = new Date(`${date}T${endTime}`);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return { error: "Invalid date or time" };
    if (endDt <= startDt) return { error: "End time must be after start time" };
    body.start = startDt.toISOString();
    body.end = endDt.toISOString();
  }
  if (location.trim()) body.location = location.trim();
  if (description.trim()) body.description = description.trim();
  return { body };
}

/**
 * Creates a Google Calendar event via the API.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param onCreated - Callback after successful creation (to trigger refetch)
 * @param defaultDate - Pre-filled date in YYYY-MM-DD format
 * @param defaultStartTime - Pre-filled start time in HH:MM format
 * @param defaultEndTime - Pre-filled end time in HH:MM format
 * @param createTypeToggle - Task/Event toggle rendered at top of form
 */
export default function GCalEventCreateModal({ open, onClose, onCreated, defaultDate, defaultStartTime, defaultEndTime, createTypeToggle }: GCalEventCreateModalProps) {
  const id = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationFocused, setLocationFocused] = useState(false);
  const locationSuggestions = useLocationAutocomplete(location, locationFocused);
  const locationRef = useRef<HTMLDivElement>(null);

  const handleLocationBlur = useCallback((e: MouseEvent) => {
    if (locationRef.current && !locationRef.current.contains(e.target as Node)) setLocationFocused(false);
  }, []);

  useEffect(() => {
    if (!locationFocused) return;
    document.addEventListener("mousedown", handleLocationBlur);
    return () => document.removeEventListener("mousedown", handleLocationBlur);
  }, [locationFocused, handleLocationBlur]);

  // Reset form when opened
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDate(defaultDate || format(new Date(), "yyyy-MM-dd"));
    setStartTime(defaultStartTime || "09:00");
    setEndTime(defaultEndTime || "10:00");
    setAllDay(false);
    setLocation("");
    setDescription("");
    setError(null);
  }, [open, defaultDate, defaultStartTime, defaultEndTime]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    const built = buildEventBody({ title, date, allDay, startTime, endTime, location, description });
    if ("error" in built) {
      setError(built.error);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/gcal/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(built.body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[GCalEventCreateModal] create rejected", { status: res.status, error: data.error });
        setError(data.error || "Couldn't create the event.");
        return;
      }
      onCreated();
      onClose();
    } catch (err) {
      console.error("[GCalEventCreateModal] create failed", { error: err instanceof Error ? err.message : String(err) });
      setError("Couldn't create the event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" aria-label="New event" initialFocusRef={titleRef} bodyClassName="-mx-6 -mt-2">
      <form onSubmit={handleSubmit} className="pb-1">
        {createTypeToggle && <div className="px-6 pb-5 pt-1">{createTypeToggle}</div>}

        <div className="px-6 pb-4 flex items-center gap-4">
          <div className="w-5 h-5 rounded-full shrink-0 border border-hairline" style={{ backgroundColor: "#4285F4" }} aria-hidden="true" />
          <label htmlFor={`${id}-title`} className="sr-only">Event title</label>
          <input
            id={`${id}-title`}
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add title"
            className="w-full text-xl text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors duration-200 pr-8"
            maxLength={200}
          />
        </div>

        <div className="px-2">
          <div className={ROW}>
            <CalendarDays size={20} className="shrink-0 text-foreground" aria-hidden="true" />
            <label htmlFor={`${id}-date`} className="sr-only">Date</label>
            <input id={`${id}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm text-foreground bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden" />
          </div>

          <div className={ROW}>
            <Clock size={20} className="shrink-0 text-foreground" aria-hidden="true" />
            {allDay ? (
              <button type="button" onClick={() => setAllDay(false)} className="text-sm leading-snug text-foreground cursor-pointer">All day</button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <label htmlFor={`${id}-start`} className="sr-only">Start time</label>
                <input id={`${id}-start`} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none [&::-webkit-calendar-picker-indicator]:hidden" />
                <span className="text-sm text-muted-foreground">to</span>
                <label htmlFor={`${id}-end`} className="sr-only">End time</label>
                <input id={`${id}-end`} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none [&::-webkit-calendar-picker-indicator]:hidden" />
                <button type="button" onClick={() => setAllDay(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">All day</button>
              </div>
            )}
          </div>

          <div ref={locationRef} className="relative">
            <div className={ROW}>
              <MapPin size={20} className="shrink-0 text-foreground" aria-hidden="true" />
              <label htmlFor={`${id}-location`} className="sr-only">Location</label>
              <input
                id={`${id}-location`}
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setLocationFocused(true); }}
                onFocus={() => setLocationFocused(true)}
                placeholder="Add location"
                className="flex-1 text-sm text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none"
              />
            </div>
            {locationFocused && locationSuggestions.length > 0 && (
              <div className="absolute left-4 right-4 top-full z-dropdown bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-popover-in" role="listbox">
                {locationSuggestions.map((s, i) => (
                  <button key={i} type="button" role="option" aria-selected={false} onClick={() => { setLocation(s); setLocationFocused(false); }} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors truncate">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-muted">
            <AlignLeft size={20} className="shrink-0 mt-0.5 text-foreground" aria-hidden="true" />
            <label htmlFor={`${id}-description`} className="sr-only">Description</label>
            <textarea id={`${id}-description`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add description" rows={2} className="flex-1 text-sm text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none resize-none leading-relaxed" maxLength={2000} />
          </div>
        </div>

        {error && <p className="text-xs text-danger px-6 pt-2" role="alert">{error}</p>}

        <div className="flex items-center justify-end gap-2 px-6 pt-5 mt-3 border-t border-border">
          <Button variant="ghost" onClick={onClose}>{ACTIONS.cancel}</Button>
          <Button type="submit" loading={saving} disabled={!title.trim()}>{ACTIONS.save}</Button>
        </div>
      </form>
    </Modal>
  );
}
