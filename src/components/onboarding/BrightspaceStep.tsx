"use client";

import FeedUrlStep from "@/components/onboarding/FeedUrlStep";

/** Instruction steps for connecting a Brightspace calendar feed. */
export const BRIGHTSPACE_STEPS: ReadonlyArray<string> = [
  "Open Brightspace and go to Calendar",
  'Click "Subscribe" (top right of the calendar)',
  "Copy the iCal feed URL it gives you",
  "Paste the URL below",
];

interface BrightspaceStepProps {
  onNext: (payload: { brightspace_calendar_url: string }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  /** Persisted draft URL from a previous visit to this step. */
  initialUrl?: string;
  /** Called on unmount to persist draft state across step navigation. */
  onDraftChange?: (draft: { url: string }) => void;
  /** Secondary action label; Settings passes "Cancel". */
  skipLabel?: string;
}

/**
 * Brightspace (D2L) onboarding step. URL-only: the sync backend has no
 * per-class selection for Brightspace, so every class in the feed syncs.
 *
 * @param onNext - Saves the URL; resolves true on success
 * @param onSkip - Skip (flow) or cancel (settings)
 */
export default function BrightspaceStep({ onNext, onSkip, saving, setError, initialUrl, onDraftChange, skipLabel }: BrightspaceStepProps) {
  return (
    <FeedUrlStep
      provider="brightspace"
      instructions={BRIGHTSPACE_STEPS}
      placeholder="https://your-school.brightspace.com/.../feed.ics"
      onSave={(url) => onNext({ brightspace_calendar_url: url })}
      onSkip={onSkip}
      saving={saving}
      setError={setError}
      initialUrl={initialUrl}
      onDraftChange={onDraftChange}
      skipLabel={skipLabel}
    />
  );
}
