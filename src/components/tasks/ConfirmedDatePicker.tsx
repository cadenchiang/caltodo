"use client";

/**
 * A date picker whose changes are staged until Save.
 *
 * The detail panel edits an assignment that already exists, so a stray click
 * on the grid used to move a real due date the instant it landed - which is
 * exactly how a date gets changed by accident. This holds every choice the
 * picker offers (date, time, repeat, and when the repeat ends) as a draft and
 * flushes them together on Save.
 *
 * The picker itself is unchanged and still applies immediately everywhere
 * else, which is right for the create forms: there is no saved task to
 * damage while one is being written.
 */

import { useState } from "react";
import DatePicker from "./DatePicker";

type RepeatUnit = "day" | "week" | "month";

/** Everything the picker can change, held together so Save flushes one set. */
interface DateDraft {
  date: string | null;
  time: string | null;
  repeatInterval: number | null;
  repeatUnit: RepeatUnit | null;
  repeatEndDate: string | null;
  repeatEndCount: number | null;
}

interface ConfirmedDatePickerProps {
  /** The task's current due date as YYYY-MM-DD, or null. */
  value: string | null;
  /** The task's current due time as HH:MM, or null. */
  timeValue: string | null;
  /** The task's current repeat interval, or null. */
  repeatInterval: number | null;
  /** The task's current repeat unit, or null. */
  repeatUnit: RepeatUnit | null;
  /** The task's current repeat end date, or null. */
  repeatEndDate?: string | null;
  /** The task's current repeat end count, or null. */
  repeatEndCount?: number | null;
  /** Applies the staged draft. Runs on Save only. */
  onCommit: (draft: DateDraft) => void;
  /** Closes the picker, on Save or Cancel. */
  onDone: () => void;
}

/** True when a draft still matches what the task holds. */
function isUnchanged(draft: DateDraft, initial: DateDraft): boolean {
  return (
    draft.date === initial.date &&
    draft.time === initial.time &&
    draft.repeatInterval === initial.repeatInterval &&
    draft.repeatUnit === initial.repeatUnit &&
    draft.repeatEndDate === initial.repeatEndDate &&
    draft.repeatEndCount === initial.repeatEndCount
  );
}

/**
 * Renders the picker over a draft, with a Save row inside its card.
 *
 * @param value - Current due date
 * @param timeValue - Current due time
 * @param repeatInterval - Current repeat interval
 * @param repeatUnit - Current repeat unit
 * @param repeatEndDate - Current repeat end date
 * @param repeatEndCount - Current repeat end count
 * @param onCommit - Receives the whole draft when Save is pressed
 * @param onDone - Closes the picker
 * @remarks Save stays disabled until something actually differs, so the
 *          button says whether there is anything to confirm. Cancel simply
 *          closes: the draft lives in this component and goes with it, so
 *          there is nothing to roll back.
 */
export default function ConfirmedDatePicker({
  value,
  timeValue,
  repeatInterval,
  repeatUnit,
  repeatEndDate = null,
  repeatEndCount = null,
  onCommit,
  onDone,
}: ConfirmedDatePickerProps) {
  const initial: DateDraft = {
    date: value,
    time: timeValue,
    repeatInterval,
    repeatUnit,
    repeatEndDate,
    repeatEndCount,
  };
  const [draft, setDraft] = useState<DateDraft>(initial);
  const dirty = !isUnchanged(draft, initial);

  /** Applies the draft to the task and closes. */
  function commit() {
    onCommit(draft);
    onDone();
  }

  return (
    <DatePicker
      value={draft.date}
      timeValue={draft.time}
      onChange={(date) => setDraft((d) => ({ ...d, date }))}
      onTimeChange={(time) => setDraft((d) => ({ ...d, time }))}
      repeatInterval={draft.repeatInterval}
      repeatUnit={draft.repeatUnit}
      onRepeatChange={(interval, unit) =>
        setDraft((d) => ({ ...d, repeatInterval: interval, repeatUnit: unit }))
      }
      repeatEndDate={draft.repeatEndDate}
      repeatEndCount={draft.repeatEndCount}
      onRepeatEndChange={(endDate, endCount) =>
        setDraft((d) => ({ ...d, repeatEndDate: endDate, repeatEndCount: endCount }))
      }
      footer={
        <div className="flex items-center justify-end gap-1.5 border-t border-border px-1 pt-2 mt-2">
          <button
            type="button"
            onClick={onDone}
            className="px-2.5 py-1 text-xs font-medium rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commit}
            disabled={!dirty}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 transition-colors"
          >
            Save
          </button>
        </div>
      }
    />
  );
}
