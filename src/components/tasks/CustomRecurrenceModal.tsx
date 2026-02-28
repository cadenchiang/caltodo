"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type RepeatUnit = "day" | "week" | "month";

interface CustomRecurrenceModalProps {
  open: boolean;
  onClose: () => void;
  interval: number | null;
  unit: RepeatUnit | null;
  repeatEndDate: string | null;
  repeatEndCount: number | null;
  /** Called with the configured recurrence when the user clicks Done. */
  onDone: (
    interval: number,
    unit: RepeatUnit,
    endDate: string | null,
    endCount: number | null
  ) => void;
}

/**
 * Modal dialog for configuring a custom repeat recurrence.
 * Mirrors Google Calendar's "Custom recurrence" dialog with
 * interval/unit selector, ends condition, and Cancel/Done buttons.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param interval - Current repeat interval (pre-fill)
 * @param unit - Current repeat unit (pre-fill)
 * @param repeatEndDate - Current end date (pre-fill)
 * @param repeatEndCount - Current end count (pre-fill)
 * @param onDone - Callback with configured values
 */
export default function CustomRecurrenceModal({
  open,
  onClose,
  interval,
  unit,
  repeatEndDate,
  repeatEndCount,
  onDone,
}: CustomRecurrenceModalProps) {
  const [localInterval, setLocalInterval] = useState(interval ?? 1);
  const [localUnit, setLocalUnit] = useState<RepeatUnit>(unit ?? "week");
  const [endMode, setEndMode] = useState<"never" | "date" | "count">(
    repeatEndDate ? "date" : repeatEndCount ? "count" : "never"
  );
  const [localEndDate, setLocalEndDate] = useState(repeatEndDate ?? "");
  const [localEndCount, setLocalEndCount] = useState(repeatEndCount ?? 13);

  if (!open) return null;

  /**
   * Submits the configured recurrence and closes the modal.
   */
  function handleDone() {
    const endDate = endMode === "date" && localEndDate ? localEndDate : null;
    const endCount = endMode === "count" ? localEndCount : null;
    onDone(localInterval, localUnit, endDate, endCount);
  }

  /**
   * Returns the singular/plural unit label based on the interval.
   *
   * @param u - Repeat unit
   * @returns Label string (e.g. "day", "weeks")
   */
  function unitLabel(u: RepeatUnit): string {
    if (localInterval === 1) {
      return u === "day" ? "day" : u === "week" ? "week" : "month";
    }
    return u === "day" ? "days" : u === "week" ? "weeks" : "months";
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/40 animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-popover rounded-2xl border border-border shadow-2xl w-[400px] max-w-[90vw] p-6 animate-in zoom-in-95 fade-in duration-150"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-foreground">
            Custom recurrence
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Repeat every */}
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Repeat every
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={365}
              value={localInterval}
              onChange={(e) =>
                setLocalInterval(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-16 px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={localUnit}
              onChange={(e) => setLocalUnit(e.target.value as RepeatUnit)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="day">{unitLabel("day")}</option>
              <option value="week">{unitLabel("week")}</option>
              <option value="month">{unitLabel("month")}</option>
            </select>
          </div>
        </div>

        {/* Ends */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Ends
          </label>
          <div className="flex flex-col gap-3">
            {/* Never */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="endMode"
                checked={endMode === "never"}
                onChange={() => setEndMode("never")}
                className="accent-blue-500"
              />
              <span className="text-sm text-foreground">Never</span>
            </label>

            {/* On date */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="endMode"
                checked={endMode === "date"}
                onChange={() => setEndMode("date")}
                className="accent-blue-500"
              />
              <span className="text-sm text-foreground">On</span>
              <input
                type="date"
                value={localEndDate}
                onChange={(e) => {
                  setLocalEndDate(e.target.value);
                  setEndMode("date");
                }}
                className="px-2 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            {/* After N occurrences */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="endMode"
                checked={endMode === "count"}
                onChange={() => setEndMode("count")}
                className="accent-blue-500"
              />
              <span className="text-sm text-foreground">After</span>
              <input
                type="number"
                min={2}
                max={999}
                value={localEndCount}
                onChange={(e) => {
                  setLocalEndCount(
                    Math.max(2, parseInt(e.target.value) || 2)
                  );
                  setEndMode("count");
                }}
                className="w-16 px-2 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-foreground">occurrences</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="px-6 py-2 text-sm font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
