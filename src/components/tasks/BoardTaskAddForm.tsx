"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, CalendarDays, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import type { TaskInsert } from "@/lib/types";
import { DEFAULT_TASK_COLOR } from "@/lib/constants";
import DatePicker from "./DatePicker";
import Popover from "@/components/ui/Popover";

interface BoardTaskAddFormProps {
  onAdd: (task: TaskInsert) => void;
  onCancel: () => void;
}

/**
 * Card-style inline task add form for the board view.
 * Renders as a rounded card with blue border, matching the board card style.
 * Shows "+ Add task" placeholder, calendar date picker, and submit chevron.
 *
 * @param onAdd - Callback with the new task data
 * @param onCancel - Callback when form is dismissed (blur outside)
 */
export default function BoardTaskAddForm({ onAdd, onCancel }: BoardTaskAddFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /** Submits the task if title is non-empty. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    onAdd({
      title: trimmed,
      due_date: dueDate,
      color: DEFAULT_TASK_COLOR,
    });
  }

  /** Cancels form when focus leaves the container entirely. */
  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      onCancel();
    }
  }

  const today = new Date();
  const dayOfMonth = today.getDate();

  return (
    <div ref={containerRef} onBlur={handleBlur}>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border-2 border-blue-400 bg-card px-3.5 py-2.5 flex items-center gap-2 shadow-sm"
      >
        <Plus size={16} className="shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Add task"
          className="flex-1 text-sm bg-transparent text-foreground placeholder-muted-foreground focus:outline-none min-w-0"
        />

        {/* Date badge if selected */}
        {dueDate && (
          <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md shrink-0">
            {format(new Date(dueDate + "T00:00:00"), "MMM d")}
          </span>
        )}

        {/* Calendar icon with day number */}
        <button
          ref={dateButtonRef}
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="relative p-1 text-muted-foreground hover:text-blue-500 rounded-lg hover:bg-accent transition-colors shrink-0"
          aria-label="Pick date"
        >
          <CalendarDays size={18} />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-[3px]">
            {dayOfMonth}
          </span>
        </button>

        {/* Submit button */}
        <button
          type="submit"
          className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors shrink-0"
          aria-label="Add task"
        >
          <ChevronDown size={16} />
        </button>
      </form>

      {/* Date picker popup */}
      <Popover
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        triggerRef={dateButtonRef}
        className="absolute right-2 top-full mt-1 z-20"
      >
        <DatePicker
          value={dueDate}
          onChange={(date) => {
            setDueDate(date);
            inputRef.current?.focus();
          }}
        />
      </Popover>
    </div>
  );
}
