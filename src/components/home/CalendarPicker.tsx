"use client";

/**
 * Inline calendar toggle list for selecting which Google Calendars
 * to display in the widget. Renders inside the settings modal.
 *
 * @param calendars - Array of all user's Google Calendar entries
 * @param selectedIds - Set of currently selected calendar IDs
 * @param onToggle - Callback when a single calendar is toggled
 * @param onSelectAll - Callback to select all calendars
 * @param onDeselectAll - Callback to deselect all calendars
 * @param loading - Whether the calendar list is still loading
 */

import type { GCalCalendarEntry } from "@/lib/types";

interface CalendarPickerProps {
  calendars: GCalCalendarEntry[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  loading: boolean;
}

export default function CalendarPicker({
  calendars,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  loading,
}: CalendarPickerProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground">Loading calendars...</span>
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No calendars found. Connect Google Calendar in Settings.
      </p>
    );
  }

  const allSelected = calendars.every((c) => selectedIds.has(c.id));
  const noneSelected = selectedIds.size === 0;

  return (
    <div>
      {/* Select/Deselect all */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Calendars</span>
        <button
          type="button"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Calendar list */}
      <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-input-border bg-card p-2">
        {calendars.map((cal) => {
          const checked = selectedIds.has(cal.id);
          return (
            <button
              key={cal.id}
              type="button"
              onClick={() => onToggle(cal.id)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              {/* Checkbox */}
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  checked
                    ? "border-blue-500 bg-blue-500"
                    : "border-input-border bg-card"
                }`}
              >
                {checked && (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5L4.5 7.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Calendar color dot */}
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cal.backgroundColor }}
              />

              {/* Calendar name */}
              <span className="text-sm text-foreground truncate">
                {cal.summary}
                {cal.primary && (
                  <span className="text-xs text-muted-foreground ml-1">(primary)</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {noneSelected && (
        <p className="text-xs text-red-500 mt-1">Select at least one calendar</p>
      )}
    </div>
  );
}
