/**
 * Modal for creating a new Google Calendar event.
 * Matches TaskCreateModal's shell (same size, header, title input) so
 * switching between Task and Event via the toggle feels seamless.
 * Renders as a centered portal overlay.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Clock, MapPin, FileText } from "lucide-react";
import { format } from "date-fns";

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
 * Layout matches TaskCreateModal: same max-w-md, same close button position,
 * same title input style, so toggling between Task/Event is seamless.
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
  }, [open, defaultDate]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

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

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Shell matches TaskCreateModal: same max-w-md, rounded-2xl, shadow */}
      <div
        ref={ref}
        className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-hidden"
      >
        {/* Close button — same position as TaskCreateModal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors duration-150 cursor-pointer z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit} className="pt-4 pb-4">
          {/* ── Type toggle (Task / Event) ── */}
          {createTypeToggle && (
            <div className="px-6 pb-3">
              {createTypeToggle}
            </div>
          )}

          {/* ── Title — same style as TaskCreateModal ── */}
          <div className="pl-6 pr-6 pb-4 flex items-center gap-4">
            {/* Blue dot placeholder matching color circle position */}
            <div className="w-5 h-5 rounded-full shrink-0 bg-blue-500 border border-black/10 dark:border-white/10" />
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

          {/* ── Rows — same icon+label style as TaskCreateModal ── */}
          <div className="px-2">
            {/* Date + Time row */}
            <div className="flex items-start gap-4 px-4 py-3 rounded-xl">
              <Clock size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none w-fit"
                />
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    className="rounded"
                  />
                  All day
                </label>
                {!allDay && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location row */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl">
              <MapPin size={20} className="shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="flex-1 text-sm text-foreground bg-transparent placeholder:text-muted-foreground/50 focus:outline-none"
              />
            </div>

            {/* Description row */}
            <div className="flex items-start gap-4 px-4 py-3 rounded-xl">
              <FileText size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description"
                rows={2}
                className="flex-1 text-sm text-foreground bg-transparent placeholder:text-muted-foreground/50 focus:outline-none resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 px-6 pt-2">{error}</p>
          )}

          {/* ── Footer — same style as TaskCreateModal ── */}
          <div className="flex justify-end gap-2 px-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
