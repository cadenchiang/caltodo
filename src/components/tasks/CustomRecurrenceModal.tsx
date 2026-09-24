"use client";

import { useId, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FIELD_INPUT, FIELD_LABEL } from "@/components/ui/field-recipe";
import { ACTIONS } from "@/lib/copy";

type RepeatUnit = "day" | "week" | "month";

interface CustomRecurrenceModalProps {
  open: boolean;
  onClose: () => void;
  interval: number | null;
  unit: RepeatUnit | null;
  repeatEndDate: string | null;
  repeatEndCount: number | null;
  /** Called with the configured recurrence when the user clicks Done. */
  onDone: (interval: number, unit: RepeatUnit, endDate: string | null, endCount: number | null) => void;
}

/**
 * Dialog for configuring a custom repeat: interval and unit, then an end
 * condition (never, on a date, after N occurrences). Built on Modal, so it
 * stacks over the task editor with its own Escape, focus trap and restore.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param interval - Current repeat interval (pre-fill)
 * @param unit - Current repeat unit (pre-fill)
 * @param repeatEndDate - Current end date (pre-fill)
 * @param repeatEndCount - Current end count (pre-fill)
 * @param onDone - Callback with configured values
 */
export default function CustomRecurrenceModal({ open, onClose, interval, unit, repeatEndDate, repeatEndCount, onDone }: CustomRecurrenceModalProps) {
  const id = useId();
  const [localInterval, setLocalInterval] = useState(interval ?? 1);
  const [localUnit, setLocalUnit] = useState<RepeatUnit>(unit ?? "week");
  const [endMode, setEndMode] = useState<"never" | "date" | "count">(repeatEndDate ? "date" : repeatEndCount ? "count" : "never");
  const [localEndDate, setLocalEndDate] = useState(repeatEndDate ?? "");
  const [localEndCount, setLocalEndCount] = useState(repeatEndCount ?? 13);

  /** Submits the configured recurrence. */
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
    return localInterval === 1 ? u : `${u}s`;
  }

  const radio = "accent-blue-500 w-4 h-4";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Custom recurrence"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{ACTIONS.cancel}</Button>
          <Button onClick={handleDone}>{ACTIONS.done}</Button>
        </>
      }
    >
      <div className="mb-5">
        <label htmlFor={`${id}-interval`} className={FIELD_LABEL}>Repeat every</label>
        <div className="flex items-center gap-2">
          <input
            id={`${id}-interval`}
            type="number"
            min={1}
            max={365}
            value={localInterval}
            onChange={(e) => setLocalInterval(Math.max(1, parseInt(e.target.value) || 1))}
            className={`${FIELD_INPUT} w-20`}
          />
          <label htmlFor={`${id}-unit`} className="sr-only">Unit</label>
          <select id={`${id}-unit`} value={localUnit} onChange={(e) => setLocalUnit(e.target.value as RepeatUnit)} className={`${FIELD_INPUT} w-auto`}>
            <option value="day">{unitLabel("day")}</option>
            <option value="week">{unitLabel("week")}</option>
            <option value="month">{unitLabel("month")}</option>
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={FIELD_LABEL}>Ends</legend>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer min-h-11">
            <input type="radio" name={`${id}-end`} checked={endMode === "never"} onChange={() => setEndMode("never")} className={radio} />
            <span className="text-sm text-foreground">Never</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer min-h-11">
            <input type="radio" name={`${id}-end`} checked={endMode === "date"} onChange={() => setEndMode("date")} className={radio} />
            <span className="text-sm text-foreground">On</span>
            <input
              type="date"
              aria-label="End date"
              value={localEndDate}
              onChange={(e) => { setLocalEndDate(e.target.value); setEndMode("date"); }}
              className={`${FIELD_INPUT} w-auto`}
            />
          </label>
          <label className="flex items-center gap-3 cursor-pointer min-h-11">
            <input type="radio" name={`${id}-end`} checked={endMode === "count"} onChange={() => setEndMode("count")} className={radio} />
            <span className="text-sm text-foreground">After</span>
            <input
              type="number"
              aria-label="Number of occurrences"
              min={2}
              max={999}
              value={localEndCount}
              onChange={(e) => { setLocalEndCount(Math.max(2, parseInt(e.target.value) || 2)); setEndMode("count"); }}
              className={`${FIELD_INPUT} w-20`}
            />
            <span className="text-sm text-foreground">occurrences</span>
          </label>
        </div>
      </fieldset>
    </Modal>
  );
}
