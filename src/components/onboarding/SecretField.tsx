"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import TextField from "@/components/ui/TextField";

export interface SecretFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  /** Visible label. */
  label: ReactNode;
  /** What the toggle reveals, used in its accessible name ("Show token"). */
  secretNoun?: string;
  /** Helper text under the control. */
  hint?: ReactNode;
  /** Error text under the control. */
  error?: ReactNode;
}

/**
 * Password-style TextField with a labeled show/hide toggle.
 *
 * @param label - Field label
 * @param secretNoun - Noun for the toggle's aria-label; defaults to "password"
 * @param hint - Helper text
 * @param error - Error text
 * @remarks Password managers are told to stay out with the same attributes
 *          the old hand-rolled inputs carried; pass `name` and
 *          `autoComplete` from the call site when they differ.
 */
export default function SecretField({ label, secretNoun = "password", hint, error, className, ...rest }: SecretFieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <TextField
        label={label}
        type={shown ? "text" : "password"}
        hint={hint}
        error={error}
        className={`pr-10 ${className ?? ""}`}
        {...rest}
      />
      <IconButton
        aria-label={shown ? `Hide ${secretNoun}` : `Show ${secretNoun}`}
        aria-pressed={shown}
        size="sm"
        bleed
        onClick={() => setShown((v) => !v)}
        className="absolute right-2 top-[26px]"
      >
        {shown ? <EyeOff size={15} /> : <Eye size={15} />}
      </IconButton>
    </div>
  );
}
