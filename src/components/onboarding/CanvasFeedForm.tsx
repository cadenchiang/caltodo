"use client";

import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { NumberedSteps } from "@/components/onboarding/StepChrome";

/** Instructions for finding the Canvas calendar feed URL. */
export const FEED_STEPS: ReadonlyArray<string> = [
  "Go to your Canvas calendar",
  'Click "Calendar feed" at the bottom right',
  "Copy the feed URL and paste it below",
];

/**
 * Validates a Canvas calendar feed URL.
 *
 * @param url - Raw text from the field
 * @returns An error message, or null when the URL is usable
 */
export function validateFeedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return "Paste your calendar feed URL.";
  if (!trimmed.startsWith("https://") || !trimmed.endsWith(".ics")) {
    return "That does not look like a calendar feed URL. It should start with https:// and end with .ics";
  }
  return null;
}

/** Shared style for the small mode-switch link under each Canvas form. */
export const MODE_SWITCH_LINK =
  "mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors rounded px-1 py-2 -my-1";

export interface CanvasFeedFormProps {
  /** Feed URL text. */
  url: string;
  onUrlChange: (value: string) => void;
  /** Called on submit once validation passes. */
  onSubmit: () => void;
  /** Called when validation fails, with the message to surface. */
  onInvalid: (message: string) => void;
  /** Whether the feed preview request is in flight. */
  loading: boolean;
  /** Whether the parent is saving. */
  saving: boolean;
  /** Switches to the API-token mode. */
  onUseToken: () => void;
}

/**
 * Canvas calendar-feed form: three instructions, a labeled URL field, and a
 * connect button. Enter submits.
 *
 * @param url - Feed URL text
 * @param onSubmit - Runs after validateFeedUrl passes
 * @param onInvalid - Receives the validation message
 * @param loading - Spinner on the connect button while the feed loads
 * @param onUseToken - Mode switch to the token form
 */
export default function CanvasFeedForm({ url, onUrlChange, onSubmit, onInvalid, loading, saving, onUseToken }: CanvasFeedFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validateFeedUrl(url);
    if (problem) {
      onInvalid(problem);
      return;
    }
    onSubmit();
  }

  const busy = loading || saving;
  return (
    <form onSubmit={handleSubmit} noValidate className="text-left">
      <NumberedSteps steps={FEED_STEPS} />
      <div className="mb-5">
        <TextField
          label="Calendar feed URL"
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://...calendar.ics"
          autoComplete="off"
          name="canvas-feed-url-nofill"
        />
      </div>
      <Button type="submit" variant="inverted" size="lg" className="w-full" loading={busy} disabled={!url.trim()}>
        {loading ? "Loading classes..." : saving ? "Saving..." : "Connect"}
      </Button>
      <div className="text-center">
        <button type="button" onClick={onUseToken} className={MODE_SWITCH_LINK}>
          Use an API token instead (more setup)
        </button>
      </div>
    </form>
  );
}
