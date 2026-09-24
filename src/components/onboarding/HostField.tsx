"use client";

import { useId } from "react";
import { FIELD_HINT, FIELD_LABEL } from "@/components/ui/field-recipe";

/**
 * Turns whatever the user typed into a bare hostname: strips a scheme,
 * trailing slashes and paths, lowercases, trims.
 *
 * @param input - Raw text from the host field or a stored base URL
 * @returns The hostname only, or "" when nothing usable remains
 */
export function normalizeCanvasHost(input: string): string {
  return input
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .split("/")[0]
    .toLowerCase();
}

/**
 * Builds the https base URL the API expects from a host.
 *
 * @param host - Bare hostname
 * @returns "https://<host>" or "" for an empty host
 */
export function baseUrlFromHost(host: string): string {
  const clean = normalizeCanvasHost(host);
  return clean ? `https://${clean}` : "";
}

export interface HostFieldProps {
  /** Current host value (no scheme). */
  value: string;
  /** Change handler with the raw typed text. */
  onChange: (value: string) => void;
  /** Visible label. Defaults to "Canvas address". */
  label?: string;
  /** Placeholder host. */
  placeholder?: string;
  /** Helper text under the control. */
  hint?: string;
  /** Form field name. */
  name?: string;
}

/**
 * Labeled hostname input with a fixed "https://" prefix, so users paste or
 * type their school's Canvas domain without worrying about the scheme.
 *
 * @param value - Hostname
 * @param onChange - Receives the raw text; normalize with normalizeCanvasHost on submit
 * @param label - Field label
 * @param placeholder - Example host
 * @param hint - Helper text
 */
export default function HostField({
  value,
  onChange,
  label = "Canvas address",
  placeholder = "canvas.yourschool.edu",
  hint,
  name = "canvas-host-nofill",
}: HostFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="text-left">
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      <div className="flex items-center rounded-lg border border-input-border bg-card overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-ring">
        <span className="pl-3 pr-2 py-2 text-sm text-muted-foreground select-none shrink-0 bg-muted border-r border-input-border" aria-hidden="true">
          https://
        </span>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="url"
          name={name}
          data-1p-ignore
          aria-describedby={hintId}
          className="flex-1 min-w-0 px-2 py-2 bg-transparent text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />
      </div>
      {hint && (
        <p id={hintId} className={FIELD_HINT}>
          {hint}
        </p>
      )}
    </div>
  );
}
