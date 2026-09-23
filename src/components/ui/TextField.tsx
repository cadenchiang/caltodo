"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";
import {
  FIELD_ERROR,
  FIELD_HINT,
  FIELD_INPUT,
  FIELD_INPUT_ERROR,
  FIELD_LABEL,
  describedBy,
} from "@/components/ui/field-recipe";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Label text. Always rendered; visually hidden when hideLabel is set. */
  label: ReactNode;
  /** Keep the label for assistive tech only (search boxes, inline editors). */
  hideLabel?: boolean;
  /** Helper text under the control. */
  hint?: ReactNode;
  /** Error message. Sets aria-invalid and links the message via aria-describedby. */
  error?: ReactNode;
  /** Explicit id. Generated when omitted. */
  id?: string;
  /** Forwarded to the native input (React 19 ref-as-prop). */
  ref?: Ref<HTMLInputElement>;
  /** Extra classes for the outer wrapper. */
  wrapperClassName?: string;
}

/**
 * Labeled single-line input with hint and error wiring.
 *
 * @param label - Required accessible label
 * @param hideLabel - sr-only label
 * @param hint - Helper text, linked through aria-describedby
 * @param error - Error text, linked through aria-describedby and aria-invalid
 * @remarks The label is required so every field has a name; pass hideLabel
 *          rather than omitting it.
 */
export default function TextField({
  label,
  hideLabel = false,
  hint,
  error,
  id: explicitId,
  className,
  wrapperClassName,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hasError = Boolean(error);

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={cn(FIELD_LABEL, hideLabel && "sr-only")}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(id, Boolean(hint), hasError)}
        className={cn(FIELD_INPUT, hasError && FIELD_INPUT_ERROR, className)}
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className={FIELD_HINT}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className={FIELD_ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}
