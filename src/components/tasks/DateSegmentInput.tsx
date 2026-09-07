"use client";

/**
 * Three-box MM / DD / YYYY date entry for the date picker.
 *
 * A single free-text field hid both the expected order and the expected
 * width, so the boxes are separate and labelled: type two digits and focus
 * moves on by itself, and a finished date commits without reaching for Enter.
 */

import { useEffect, useRef, useState } from "react";
import {
  DATE_FIELDS,
  FIELD_LENGTH,
  isFieldFull,
  isComplete,
  sanitizeSegment,
  segmentsFromIso,
  segmentsFromPaste,
  segmentsToIso,
  type DateField,
  type DateSegments,
} from "@/lib/date-segments";

/** Placeholder text for each box, which doubles as its format hint. */
const PLACEHOLDER: Record<DateField, string> = {
  month: "MM",
  day: "DD",
  year: "YYYY",
};

/** Accessible name for each box. */
const LABEL: Record<DateField, string> = {
  month: "Month",
  day: "Day",
  year: "Year",
};

interface DateSegmentInputProps {
  /** Currently selected date as YYYY-MM-DD, or null. Pre-fills the boxes. */
  value: string | null;
  /** Called with a complete, valid date the moment the boxes hold one. */
  onCommit: (date: string) => void;
  /**
   * Called with a complete, valid date as it is typed, so the calendar grid
   * can jump to it before anything is committed.
   */
  onPreview?: (date: string) => void;
}

/**
 * Renders the MM / DD / YYYY boxes.
 *
 * @param value - Date to pre-fill the boxes with, or null for empty ones
 * @param onCommit - Receives YYYY-MM-DD once all three boxes hold a real day
 * @param onPreview - Receives the same date as it is typed, for the grid
 * @remarks Commits on completion rather than on Enter, because with a fixed
 *          width per box the last keystroke is unambiguous: there is nothing
 *          further the user could be about to type. Enter still commits, for
 *          anyone who reaches for it out of habit, and Escape clears the
 *          boxes back to the stored date.
 */
export default function DateSegmentInput({ value, onCommit, onPreview }: DateSegmentInputProps) {
  const [segments, setSegments] = useState<DateSegments>(() => segmentsFromIso(value));
  const refs = useRef<Partial<Record<DateField, HTMLInputElement | null>>>({});

  // Adopt a date chosen elsewhere in the picker (a grid click, a preset) so
  // the boxes never contradict the selection shown beside them.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setSegments(segmentsFromIso(value));
  }

  const iso = segmentsToIso(segments);
  const complete = isComplete(segments);
  // Only a finished date can be wrong. A half-typed one is unfinished.
  const invalid = complete && iso === null;

  // Preview runs as an effect, not inside the change handler, so a paste that
  // fills every box at once previews on the same terms as typed digits.
  const previewedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!iso || previewedRef.current === iso) return;
    previewedRef.current = iso;
    onPreview?.(iso);
  }, [iso, onPreview]);

  /** Moves focus to another box, selecting what is there so it retypes. */
  function focusField(field: DateField) {
    const el = refs.current[field];
    if (!el) return;
    el.focus();
    el.select();
  }

  /** Focuses the box after `field`, if there is one. */
  function focusNext(field: DateField) {
    const next = DATE_FIELDS[DATE_FIELDS.indexOf(field) + 1];
    if (next) focusField(next);
  }

  /** Focuses the box before `field`, if there is one. */
  function focusPrev(field: DateField) {
    const prev = DATE_FIELDS[DATE_FIELDS.indexOf(field) - 1];
    if (prev) focusField(prev);
  }

  /**
   * Applies new segment text, committing as soon as it describes a real day.
   *
   * @param next - The boxes after the edit
   * @param field - The box that was edited, for the focus advance
   */
  function apply(next: DateSegments, field: DateField) {
    setSegments(next);
    const parsed = segmentsToIso(next);
    if (parsed) {
      onCommit(parsed);
      return;
    }
    if (isFieldFull(next, field)) focusNext(field);
  }

  /**
   * Handles a keystroke in one box.
   *
   * @param field - The box being typed into
   * @param raw - Its new raw text
   */
  function handleChange(field: DateField, raw: string) {
    apply({ ...segments, [field]: sanitizeSegment(raw, field) }, field);
  }

  /**
   * Spreads a pasted date across the boxes instead of into one.
   *
   * @param field - The box the paste landed in
   * @param e - The paste event
   */
  function handlePaste(field: DateField, e: React.ClipboardEvent<HTMLInputElement>) {
    const next = segmentsFromPaste(e.clipboardData.getData("text"), field);
    if (!next) return;
    e.preventDefault();
    apply(next, "year");
  }

  /**
   * Wires the keys that move between boxes, commit, and clear.
   *
   * @param field - The box the key was pressed in
   * @param e - The keyboard event
   */
  function handleKeyDown(field: DateField, e: React.KeyboardEvent<HTMLInputElement>) {
    const el = e.currentTarget;
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;

    if (e.key === "Enter") {
      e.preventDefault();
      if (iso) onCommit(iso);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setSegments(segmentsFromIso(value));
      return;
    }
    // Backspace in an already-empty box steps back rather than doing nothing,
    // so a mistyped month is one key away no matter which box you are in.
    if (e.key === "Backspace" && segments[field] === "") {
      e.preventDefault();
      focusPrev(field);
      return;
    }
    if (e.key === "ArrowLeft" && atStart) {
      e.preventDefault();
      focusPrev(field);
      return;
    }
    if (e.key === "ArrowRight" && el.selectionStart === segments[field].length) {
      e.preventDefault();
      focusNext(field);
    }
  }

  const borderClass = invalid ? "border-red-400" : "border-border";

  return (
    <div
      className={`flex items-center gap-1 mb-2 px-2 py-1 rounded-lg border bg-card transition-colors focus-within:ring-2 focus-within:ring-ring ${borderClass}`}
    >
      {DATE_FIELDS.map((field, i) => (
        <div key={field} className="flex items-center">
          {i > 0 && <span className="text-xs text-subtle-foreground select-none px-0.5">/</span>}
          <input
            ref={(el) => {
              refs.current[field] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={segments[field]}
            placeholder={PLACEHOLDER[field]}
            aria-label={LABEL[field]}
            aria-invalid={invalid || undefined}
            maxLength={FIELD_LENGTH[field]}
            size={FIELD_LENGTH[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            onKeyDown={(e) => handleKeyDown(field, e)}
            onPaste={(e) => handlePaste(field, e)}
            onFocus={(e) => e.currentTarget.select()}
            // Sized in `ch` so each box is exactly as wide as the digits it
            // takes, which is what makes the row read as one date.
            style={{ width: `${FIELD_LENGTH[field] + 0.5}ch` }}
            className="bg-transparent text-xs text-center text-foreground placeholder-subtle-foreground tabular-nums focus:outline-none"
          />
        </div>
      ))}
      {/* No clear control here: the picker already ends in "Clear date", and
          two of them a few rows apart read as two different actions. */}
      {invalid && (
        <span className="ml-auto text-[10px] text-red-400 select-none">Not a date</span>
      )}
    </div>
  );
}
