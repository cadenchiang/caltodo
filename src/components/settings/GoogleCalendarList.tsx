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
import { Loader2, Lock, Plus, X } from "lucide-react";
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
      console.error("GoogleCalendarList: load failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "the picker stays closed",
      });
      showToast(err instanceof Error ? err.message : "Failed to load calendars", { variant: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /** Persists a new selection, refusing to leave it empty. */
  const save = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) {
        showToast("Keep at least one calendar.", { variant: "error" });
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
        console.error("GoogleCalendarList: save failed", {
          error: err instanceof Error ? err.message : String(err),
          impact: "the previous selection is unchanged",
        });
        showToast(err instanceof Error ? err.message : "Failed to save calendars", { variant: "error" });
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

  /** Toggles the picker: the add button becomes Cancel while it is open. */
  function togglePicker() {
    if (picking) {
      setPicking(false);
      return;
    }
    void openPicker();
  }

  // The first selected id is where tasks are written (getCalendarId reads
  // index 0). Removing it would retarget every create to whatever came next
  // and orphan every existing event, so it is shown locked and listed first.
  const writeCalendarId = loaded?.selectedIds[0] ?? null;
  const selected = loaded
    ? loaded.calendars
        .filter((c) => loaded.selectedIds.includes(c.id))
        .sort((a, b) => (a.id === writeCalendarId ? -1 : b.id === writeCalendarId ? 1 : 0))
    : [];
  const unselected = loaded
    ? loaded.calendars.filter((c) => !loaded.selectedIds.includes(c.id))
    : [];
  const atLimit = (loaded?.selectedIds.length ?? 0) >= MAX_SELECTED_CALENDARS;

  return (
    <div>
      {/* Same labelled shape as an account's Classes block. */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-2xs font-semibold text-foreground">
          Calendars{selected.length > 0 ? ` · ${selected.length}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {selected.map((calendar) =>
          calendar.id === writeCalendarId ? (
            <span key={calendar.id} className={`${CLASS_PILL} gap-1 pr-1.5`}>
              {calendar.summary}
              <Lock size={11} className="shrink-0 opacity-60" aria-hidden="true" />
            </span>
          ) : (
            <span key={calendar.id} className={`${CLASS_PILL} gap-1 pr-1.5`}>
              {calendar.summary}
              <button
                onClick={() =>
                  save(loaded!.selectedIds.filter((id) => id !== calendar.id))
                }
                disabled={saving}
                aria-label={`Stop syncing ${calendar.summary}`}
                className="shrink-0 rounded-full p-0.5 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X size={11} />
              </button>
            </span>
          )
        )}

        {!atLimit && (
          <button
            type="button"
            onClick={togglePicker}
            disabled={loading || saving}
            aria-expanded={picking}
            className={`${PILL_SHAPE} gap-1 cursor-pointer transition-colors disabled:opacity-50 ${
              picking
                ? "bg-muted text-muted-foreground hover:text-foreground"
                : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            }`}
          >
            {loading ? (
              <Loader2 size={11} className="animate-spin shrink-0" />
            ) : picking ? (
              <X size={12} className="shrink-0" />
            ) : (
              <Plus size={12} className="shrink-0" />
            )}
            {picking ? "Cancel" : "Add another calendar"}
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <p className="mt-1.5 text-2xs text-muted-foreground">
          Tasks are written to {selected[0].summary}, so it cannot be removed. The others are read only.
        </p>
      )}

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
              <span className="text-2xs text-foreground truncate">{calendar.summary}</span>
            </button>
          ))}
          {unselected.length === 0 && (
            <p className="px-2.5 py-3 text-2xs text-muted-foreground text-center">
              Every calendar on this account is already syncing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
