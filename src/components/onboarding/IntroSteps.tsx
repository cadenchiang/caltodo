"use client";

import { Monitor } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import Button from "@/components/ui/Button";
import SearchableSelect from "@/components/onboarding/SearchableSelect";
import { BRAND } from "@/lib/copy";

/**
 * The three steps before any platform is chosen: welcome, school, referral.
 * Each is a small presentational component; the page owns the state.
 */

export interface WelcomeStepProps {
  /** Advances to the school step. */
  onStart: () => void;
}

/**
 * Welcome screen with the logo and a single call to action.
 *
 * @param onStart - Called by "Get started"
 */
export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <img src="/logo.png" alt={BRAND} className="h-14 dark:invert" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3">Welcome to {BRAND}.</h1>
      <p className="text-foreground text-sm mb-2">This takes about 5 to 10 minutes.</p>
      <p className="text-foreground text-sm mb-8 flex items-center justify-center gap-2">
        <Monitor size={16} strokeWidth={2} aria-hidden="true" />
        We recommend doing this on a computer.
      </p>
      <Button variant="inverted" size="lg" className="w-full" onClick={onStart} autoFocus>
        Get started
      </Button>
    </div>
  );
}

export interface PickerStepProps {
  /** Heading, sentence case. */
  title: string;
  /** One line under the heading. */
  description: ReactNode;
  /** Options for the select. */
  options: string[];
  /** Current value. */
  value: string;
  onChange: (value: string) => void;
  /** Placeholder for the search box. */
  placeholder: string;
  /** Optional custom matcher for the select. */
  search?: (query: string) => string[];
  /** Called on Continue once a value is chosen. */
  onContinue: () => void;
  /** Accessible label for the select. */
  label: string;
}

/**
 * A heading, a searchable select and a Continue button, wrapped in a form so
 * Enter submits once a value is chosen. Used by the school and referral steps.
 *
 * @param title - Heading
 * @param options - Choices
 * @param onContinue - Runs on submit when `value` is non-empty
 */
export function PickerStep({ title, description, options, value, onChange, placeholder, search, onContinue, label }: PickerStepProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onContinue();
  }
  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        search={search}
        label={label}
      />
      <Button type="submit" variant="inverted" size="lg" className="mt-8 w-full" disabled={!value.trim()}>
        Continue
      </Button>
    </form>
  );
}
