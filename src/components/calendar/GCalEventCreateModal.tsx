/**
 * Modal for creating a new Google Calendar event.
 * Shell, sizing, icons, and footer match TaskCreateModal exactly
 * so switching between Task and Event via the toggle is seamless.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, CalendarDays, Clock, MapPin, AlignLeft } from "lucide-react";
import { format } from "date-fns";
import { useLocationAutocomplete } from "@/hooks/useLocationAutocomplete";

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

/**
 * Creates a Google Calendar event via the API.
 * Layout matches TaskCreateModal exactly: same w-[540px], bg-card,
 * rounded-2xl, icon sizes, row padding, footer border-t, button styles.
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
  const ref = useRef<HTMLDivElement>(null);
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

  /** Close location dropdown on outside click. */
  const handleLocationBlur = useCallback((e: MouseEvent) => {
    if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
      setLocationFocused(false);
    }
  }, []);

  useEffect(() => {
    if (locationFocused) {
      document.addEventListener("mousedown", handleLocationBlur);
      return () => document.removeEventListener("mousedown", handleLocationBlur);
    }
  }, [locationFocused, handleLocationBlur]);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setTitle("");
      setDate(defaultDate || format(new Date(), "yyyy-MM-dd"));
      setStartTime(defaultStartTime || "09:00");
      setEndTime(defaultEndTime || "10:00");
      setAllDay(false);
      setLocation("");
      setDescription("");
      setError(null);
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open, defaultDate, defaultStartTime, defaultEndTime]);

  /** Close the modal. */
  function handleClose() {
    onClose();
  }

  // Close on escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        summary: title.trim(),
        allDay,
      };

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setError("Invalid date");
        return;
      }

      if (allDay) {
        body.start = date;
        const endDate = new Date(`${date}T00:00:00`);
        if (isNaN(endDate.getTime())) {
          setError("Invalid date");
          return;
        }
        endDate.setDate(endDate.getDate() + 1);
        body.end = format(endDate, "yyyy-MM-dd");
      } else {
        const startDt = new Date(`${date}T${startTime}`);
        const endDt = new Date(`${date}T${endTime}`);
        if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
          setError("Invalid date or time");
          return;
        }
        if (endDt <= startDt) {
          setError("End time must be after start time");
          return;
        }
        body.start = startDt.toISOString();
        body.end = endDt.toISOString();
      }

      if (location.trim()) body.location = location.trim();
      if (description.trim()) body.description = description.trim();

      const res = await fetch("/api/gcal/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create event");
        return;
      }

      onCreated();
      onClose();
    } catch {
      setError("Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div style={!open ? { display: 'none' } : undefined}>
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] bg-black/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={ref}
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-[540px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close button — exact same as TaskCreateModal */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors duration-150 cursor-pointer z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit} className="pt-4 pb-4">
          {/* ── Type toggle (Task / Event) — left-aligned with icons ── */}
          {createTypeToggle && (
            <div className="px-6 pb-5 pt-1">
              {createTypeToggle}
            </div>
          )}

          {/* ── Color circle + Title — exact same as TaskCreateModal ── */}
          <div className="pl-6 pr-6 pb-4 flex items-center gap-4">
            <div
              className="w-5 h-5 rounded-full shrink-0 border border-black/10 dark:border-white/10"
              style={{ backgroundColor: "#4285F4" }}
            />
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              className="w-full text-[22px] text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors duration-200 pr-8"
              maxLength={200}
            />
          </div>

          {/* ── Rows — exact same px-2 wrapper, px-4 py-4 rows, size-20 icons ── */}
          <div className="px-2">
            {/* Date row */}
            <div className="flex items-center gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800">
              <CalendarDays size={20} className="shrink-0 text-foreground" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm text-foreground bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>

            {/* Time row — start/end or "All day" */}
            <div className="flex items-center gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Clock size={20} className="shrink-0 text-foreground" />
              {allDay ? (
                <button
                  type="button"
                  onClick={() => setAllDay(false)}
                  className="text-sm leading-snug text-foreground cursor-pointer"
                >
                  All day
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <span className="mx-1 text-muted-foreground/30">|</span>
                  <button
                    type="button"
                    onClick={() => setAllDay(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    All day
                  </button>
                </div>
              )}
            </div>

            {/* Location row with autocomplete */}
            <div ref={locationRef} className="relative">
              <div className="flex items-center gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800">
                <MapPin size={20} className="shrink-0 text-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setLocationFocused(true); }}
                  onFocus={() => setLocationFocused(true)}
                  placeholder="Add location"
                  className="flex-1 text-sm text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none"
                />
              </div>
              {locationFocused && locationSuggestions.length > 0 && (
                <div className="absolute left-4 right-4 top-full z-20 bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {locationSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setLocation(s); setLocationFocused(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors truncate"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description row */}
            <div className="flex items-start gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800">
              <AlignLeft size={20} className="shrink-0 mt-0.5 text-foreground" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description"
                rows={2}
                className="flex-1 text-sm text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none resize-none leading-relaxed"
                maxLength={2000}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 px-6 pt-2">{error}</p>
          )}

          {/* ── Footer — exact same as TaskCreateModal ── */}
          <div className="flex items-center justify-end px-6 pt-5 mt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors duration-150 active:scale-[0.97] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="px-6 py-2 text-sm font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97] cursor-pointer"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </div>,
    document.body
  );
}
