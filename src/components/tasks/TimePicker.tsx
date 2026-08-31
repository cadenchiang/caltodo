"use client";

/**
 * 12-hour time picker with typeable hour and minute fields.
 *
 * Steppers alone made setting 11:47 PM a chore, so both numbers are plain
 * inputs; the chevrons remain for nudging. Conversion and clamping live in
 * lib/time-input so they can be tested without rendering.
 */

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  from24h,
  to24h,
  sanitizeTimeDigits,
  parseHourInput,
  parseMinuteInput,
  stepHour,
  stepMinute,
} from "@/lib/time-input";

/** Shared styling for the two number fields. */
const FIELD_CLASS =
  "w-10 h-8 flex items-center justify-center rounded-lg bg-accent text-sm font-medium text-foreground text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-ring cursor-text";

/**
 * Renders the hour, minute, and AM/PM controls.
 *
 * @param value - Current time as 24-hour "HH:MM", or null when unset
 * @param onChange - Called with the new "HH:MM", or null when cleared
 * @remarks Emitting on every keystroke would fight the user mid-edit (typing
 *          the "1" of "12" would commit 1 and re-render "01"), so each field
 *          keeps a draft string while focused and commits on blur or Enter.
 */
export default function TimePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (time: string | null) => void;
}) {
  const { hour12, minute, ampm } = from24h(value);

  // Draft text while a field has focus; null means "show the committed value".
  const [hourDraft, setHourDraft] = useState<string | null>(null);
  const [minuteDraft, setMinuteDraft] = useState<string | null>(null);

  // Drop any stale draft if the time is changed from outside (a preset, a
  // stepper, or the picker being reopened on a different task).
  useEffect(() => {
    setHourDraft(null);
    setMinuteDraft(null);
  }, [value]);

  /** Emits a new time built from the current parts. */
  function commit(nextHour: number, nextMinute: number, nextAmPm: "AM" | "PM") {
    onChange(to24h(nextHour, nextMinute, nextAmPm));
  }

  /** Commits the hour draft, falling back to the current hour when empty. */
  function commitHour() {
    const parsed = hourDraft === null ? null : parseHourInput(hourDraft);
    setHourDraft(null);
    commit(parsed ?? hour12, minute, ampm);
  }

  /** Commits the minute draft, falling back to the current minute when empty. */
  function commitMinute() {
    const parsed = minuteDraft === null ? null : parseMinuteInput(minuteDraft);
    setMinuteDraft(null);
    commit(hour12, parsed ?? minute, ampm);
  }

  /**
   * Shared key handling for both fields: Enter commits, Escape abandons the
   * draft, and the arrow keys step the value like the chevrons do.
   */
  function fieldKeys(
    e: React.KeyboardEvent<HTMLInputElement>,
    onCommit: () => void,
    onStep: (delta: number) => void,
    clearDraft: () => void
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      onCommit();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      clearDraft();
      e.currentTarget.blur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      clearDraft();
      onStep(e.key === "ArrowUp" ? 1 : -1);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 justify-center">
        {/* Hour */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            aria-label="Later hour"
            onClick={() => commit(stepHour(hour12, 1), minute, ampm)}
            className="text-subtle-foreground hover:text-foreground transition-colors cursor-pointer p-0.5"
          >
            <ChevronLeft size={12} className="rotate-90" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Hour"
            value={hourDraft ?? String(hour12)}
            onChange={(e) => setHourDraft(sanitizeTimeDigits(e.target.value))}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={commitHour}
            onKeyDown={(e) =>
              fieldKeys(
                e,
                commitHour,
                (d) => commit(stepHour(hour12, d), minute, ampm),
                () => setHourDraft(null)
              )
            }
            className={FIELD_CLASS}
          />
          <button
            type="button"
            aria-label="Earlier hour"
            onClick={() => commit(stepHour(hour12, -1), minute, ampm)}
            className="text-subtle-foreground hover:text-foreground transition-colors cursor-pointer p-0.5"
          >
            <ChevronLeft size={12} className="-rotate-90" />
          </button>
        </div>

        <span className="text-sm font-medium text-muted-foreground">:</span>

        {/* Minute */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            aria-label="Later minute"
            onClick={() => commit(hour12, stepMinute(minute, 1), ampm)}
            className="text-subtle-foreground hover:text-foreground transition-colors cursor-pointer p-0.5"
          >
            <ChevronLeft size={12} className="rotate-90" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Minute"
            // Padded only when committed, so typing "5" does not jump to "05".
            value={minuteDraft ?? String(minute).padStart(2, "0")}
            onChange={(e) => setMinuteDraft(sanitizeTimeDigits(e.target.value))}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={commitMinute}
            onKeyDown={(e) =>
              fieldKeys(
                e,
                commitMinute,
                (d) => commit(hour12, stepMinute(minute, d), ampm),
                () => setMinuteDraft(null)
              )
            }
            className={FIELD_CLASS}
          />
          <button
            type="button"
            aria-label="Earlier minute"
            onClick={() => commit(hour12, stepMinute(minute, -1), ampm)}
            className="text-subtle-foreground hover:text-foreground transition-colors cursor-pointer p-0.5"
          >
            <ChevronLeft size={12} className="-rotate-90" />
          </button>
        </div>

        {/* AM/PM toggle */}
        <button
          type="button"
          onClick={() => commit(hour12, minute, ampm === "AM" ? "PM" : "AM")}
          className="w-10 h-8 rounded-lg bg-accent text-xs font-medium text-foreground hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
        >
          {ampm}
        </button>
      </div>

      {/* Clear action */}
      <div className="flex items-center justify-end">
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] text-subtle-foreground hover:text-secondary-foreground transition-colors shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
