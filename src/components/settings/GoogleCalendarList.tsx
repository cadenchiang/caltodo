"use client";

/**
 * Which Google calendars sync, inside the Google Calendar card's dropdown.
 *
 * Google Calendar is one OAuth identity, so unlike the other integrations it
 * cannot hold a second account: the tokens live in singular credential columns
 * and there is nowhere to put another pair. What it can hold is several
 * calendars, which is its own analogue of choosing classes - so that is what
 * the panel's add control does.
 */

import { useCallback, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { GCalCalendarEntry } from "@/lib/types";
import { MAX_SELECTED_CALENDARS } from "@/lib/gcal-calendar-ids";
import { CLASS_PILL, PILL_SHAPE } from "./AccountClasses";

interface GoogleCalendarListProps {
  /** Called after a successful save so the card can refresh its credentials. */
  onSaved: () => void;
}

/**
 * Lists the selected calendars and lets the user add or remove one.
 *
 * @param onSaved - Refreshes the surrounding card after a change.
 * @returns The calendar pills and the add control.
 * @remarks The full calendar list is fetched only when the add control is
 *          used. Expanding the card should not cost a Google API call.
 */
export default function GoogleCalendarList({ onSaved }: GoogleCalendarListProps) {
  const { showToast } = useToast();
  const [loaded, setLoaded] = useState<{
    calendars: GCalCalendarEntry[];
    selectedIds: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Loads the account's calendars and its current selection. */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gcal/calendars?all=true");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to load calendars");
      setLoaded({
        calendars: (body.calendars ?? []) as GCalCalendarEntry[],
        selectedIds: (body.selectedCalendarIds ?? []) as string[],
      });
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load calendars");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /** Persists a new selection, refusing to leave it empty. */
  const save = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) {
        showToast("Keep at least one calendar.");
        return;
      }
      setSaving(true);
      try {
        const res = await fetch("/api/gcal/select-calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calendarIds: ids.slice(0, MAX_SELECTED_CALENDARS) }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Failed to save calendars");
        setLoaded((prev) => (prev ? { ...prev, selectedIds: ids } : prev));
        onSaved();
        showToast("Calendars updated.");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to save calendars");
      } finally {
        setSaving(false);
      }
    },
    [onSaved, showToast]
  );

  /** Opens the picker, loading the list the first time only. */
  async function openPicker() {
    if (loaded) {
      setPicking(true);
      return;
    }
    if (await load()) setPicking(true);
  }

  const selected = loaded
    ? loaded.calendars.filter((c) => loaded.selectedIds.includes(c.id))
    : [];
  const unselected = loaded
    ? loaded.calendars.filter((c) => !loaded.selectedIds.includes(c.id))
    : [];
  const atLimit = (loaded?.selectedIds.length ?? 0) >= MAX_SELECTED_CALENDARS;

  return (
    <div>
      {/* Same labelled shape as an account's Classes block. */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-[11px] font-semibold text-foreground">
          Calendars{selected.length > 0 ? ` · ${selected.length}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {selected.map((calendar) => (
          <span key={calendar.id} className={`${CLASS_PILL} gap-1 pr-1.5`}>
            {calendar.summary}
            <button
              onClick={() =>
                save(loaded!.selectedIds.filter((id) => id !== calendar.id))
              }
              disabled={saving || loaded!.selectedIds.length === 1}
              aria-label={`Stop syncing ${calendar.summary}`}
              className="shrink-0 rounded-full p-0.5 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X size={11} />
            </button>
          </span>
        ))}

        {!atLimit && (
          <button
            onClick={openPicker}
            disabled={loading || saving}
            aria-label="Add another calendar"
            className={`${PILL_SHAPE} gap-1 cursor-pointer bg-[#0e89d6]/10 text-[#0e89d6] hover:bg-[#0e89d6]/20 transition-colors disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 size={11} className="animate-spin shrink-0" />
            ) : (
              <Plus size={12} className="shrink-0" />
            )}
            Add another calendar
          </button>
        )}
      </div>

      {picking && loaded && (
        <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-border divide-y divide-border">
          {unselected.map((calendar) => (
            <button
              key={calendar.id}
              onClick={async () => {
                await save([...loaded.selectedIds, calendar.id]);
                setPicking(false);
              }}
              disabled={saving}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-muted/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: calendar.backgroundColor || "#9ca3af" }}
              />
              <span className="text-[11px] text-foreground truncate">{calendar.summary}</span>
            </button>
          ))}
          {unselected.length === 0 && (
            <p className="px-2.5 py-3 text-[11px] text-muted-foreground text-center">
              Every calendar on this account is already syncing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
