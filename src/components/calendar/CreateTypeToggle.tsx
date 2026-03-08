/**
 * Animated segmented toggle for switching between Task and Event creation.
 * Uses a sliding pill indicator for smooth visual feedback.
 * Rendered at the top of creation modals in calendar views.
 */

"use client";

import type { CreateType } from "@/hooks/useCalendarModals";

interface CreateTypeToggleProps {
  value: CreateType;
  onChange: (type: CreateType) => void;
}

/**
 * Segmented control: Task | Event with animated sliding pill.
 *
 * @param value - Current selection ("task" or "event")
 * @param onChange - Called when the user switches
 */
export default function CreateTypeToggle({ value, onChange }: CreateTypeToggleProps) {
  return (
    <div className="relative flex items-center bg-muted rounded-lg p-0.5 w-fit">
      {/* Sliding pill indicator */}
      <div
        className="absolute top-0.5 bottom-0.5 rounded-md bg-white dark:bg-gray-600 shadow-md transition-all duration-200 ease-out"
        style={{
          left: value === "task" ? "2px" : "50%",
          width: "calc(50% - 2px)",
        }}
      />
      <button
        type="button"
        onClick={() => onChange("task")}
        className={`relative z-[1] px-4 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
          value === "task"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Task
      </button>
      <button
        type="button"
        onClick={() => onChange("event")}
        className={`relative z-[1] px-4 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
          value === "event"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Event
      </button>
    </div>
  );
}
