"use client";

import { useState } from "react";
import { EyeOff } from "lucide-react";
import { FOREVER_HOURS, SNOOZE_PRESETS } from "@/lib/snooze";

/** Shared row recipe for menu items in the task menus. */
export const MENU_ITEM =
  "flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-foreground hover:bg-accent focus-visible:bg-accent focus-visible:outline-none transition-colors";

interface SnoozeMenuProps {
  /** Hides the task for the given number of hours. */
  onSnooze: (hours: number) => void;
  /** Called after a choice so the parent menu can close. */
  onDone: () => void;
}

/**
 * The "Hide for..." list: preset durations, a custom hour count, and
 * "Until I unhide". Rendered inside a task menu as a submenu panel.
 *
 * @param onSnooze - Receives the chosen duration in hours
 * @param onDone - Closes the surrounding menu
 * @remarks Every option is a real button so the list is reachable by Tab.
 */
export default function SnoozeMenu({ onSnooze, onDone }: SnoozeMenuProps) {
  const [customHours, setCustomHours] = useState("");

  /**
   * Applies a duration and closes the menu.
   *
   * @param hours - Duration to hide the task for
   */
  function choose(hours: number) {
    onSnooze(hours);
    onDone();
  }

  return (
    <div role="menu" aria-label="Hide for" className="py-1 min-w-[150px]">
      {SNOOZE_PRESETS.map((preset) => (
        <button key={preset.hours} type="button" role="menuitem" onClick={() => choose(preset.hours)} className={MENU_ITEM}>
          {preset.label}
        </button>
      ))}
      <div className="border-t border-border my-1" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const h = parseFloat(customHours);
          if (h > 0) {
            setCustomHours("");
            choose(h);
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5"
      >
        <label htmlFor="snooze-custom-hours" className="sr-only">
          Custom hours
        </label>
        <input
          id="snooze-custom-hours"
          type="number"
          min="1"
          step="1"
          value={customHours}
          onChange={(e) => setCustomHours(e.target.value)}
          placeholder="hrs"
          className="w-14 px-2 py-1 text-sm rounded-md border border-input-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="text-xs text-muted-foreground">hours</span>
      </form>
      <button type="button" role="menuitem" onClick={() => choose(FOREVER_HOURS)} className={MENU_ITEM}>
        <EyeOff size={13} />
        Until I unhide
      </button>
    </div>
  );
}
