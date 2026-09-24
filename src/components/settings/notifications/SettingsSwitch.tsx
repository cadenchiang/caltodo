"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsSwitchProps {
  /** Row title. Also the switch's accessible name. */
  label: string;
  /** Muted line under the title. */
  description?: ReactNode;
  /** Current value. */
  checked: boolean;
  /** Called with the next value. */
  onChange: (next: boolean) => void;
  /** Blocks interaction and shows a spinner while a request is in flight. */
  busy?: boolean;
  /** Blocks interaction (unsupported browser, permission denied). */
  disabled?: boolean;
}

/**
 * A labelled on/off row: title and description on the left, a switch on the
 * right. The whole row is one control with role="switch".
 *
 * @param label - Accessible name and visible title
 * @param description - Helper text
 * @param checked - Current value
 * @param onChange - Receives the flipped value
 * @param busy - Spinner and no interaction while a request runs
 * @param disabled - No interaction, reduced emphasis
 */
export default function SettingsSwitch({
  label,
  description,
  checked,
  onChange,
  busy = false,
  disabled = false,
}: SettingsSwitchProps) {
  const inert = busy || disabled;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={busy || undefined}
      disabled={inert}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl border border-border bg-card transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        inert ? "cursor-not-allowed opacity-60" : "hover:bg-accent"
      )}
    >
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>}
      </span>
      {busy ? (
        <Loader2 size={16} className="animate-spin text-muted-foreground shrink-0" aria-hidden="true" />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-block w-9 h-5 rounded-full shrink-0 transition-colors",
            checked ? "bg-blue-500" : "bg-input-border"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
              checked ? "translate-x-4" : "translate-x-0"
            )}
          />
        </span>
      )}
    </button>
  );
}
