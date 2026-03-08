/**
 * Subtle underline toggle for switching between Task and Event creation.
 * Left-aligned with modal icons, minimal styling.
 */

"use client";

import type { CreateType } from "@/hooks/useCalendarModals";

interface CreateTypeToggleProps {
  value: CreateType;
  onChange: (type: CreateType) => void;
}

/**
 * Minimal text toggle: Task | Event with sliding underline indicator.
 *
 * @param value - Current selection ("task" or "event")
 * @param onChange - Called when the user switches
 */
export default function CreateTypeToggle({ value, onChange }: CreateTypeToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange("task")}
        className={`relative text-sm font-medium pb-1 transition-colors duration-200 ${
          value === "task"
            ? "text-foreground"
            : "text-muted-foreground/50 hover:text-muted-foreground"
        }`}
      >
        Task
        {value === "task" && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
        )}
      </button>
      <button
        type="button"
        onClick={() => onChange("event")}
        className={`relative text-sm font-medium pb-1 transition-colors duration-200 ${
          value === "event"
            ? "text-foreground"
            : "text-muted-foreground/50 hover:text-muted-foreground"
        }`}
      >
        Event
        {value === "event" && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
        )}
      </button>
    </div>
  );
}
