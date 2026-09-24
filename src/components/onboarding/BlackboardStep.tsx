"use client";

import FeedUrlStep from "@/components/onboarding/FeedUrlStep";

/** Instruction steps for connecting a Blackboard Learn calendar feed. */
export const BLACKBOARD_STEPS: ReadonlyArray<string> = [
  "Open Blackboard and go to Calendar",
  'Click "Get external calendar link" at the bottom left',
  "Copy the iCal feed URL it gives you",
  "Paste the URL below",
];

interface BlackboardStepProps {
  onNext: (payload: { blackboard_calendar_url: string }) => Promise<boolean>;
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
 * Blackboard Learn onboarding step. URL-only: the sync backend has no
 * per-class selection for Blackboard, so every class in the feed syncs.
 *
 * @param onNext - Saves the URL; resolves true on success
 * @param onSkip - Skip (flow) or cancel (settings)
 */
export default function BlackboardStep({ onNext, onSkip, saving, setError, initialUrl, onDraftChange, skipLabel }: BlackboardStepProps) {
  return (
    <FeedUrlStep
      provider="blackboard"
      instructions={BLACKBOARD_STEPS}
      placeholder="https://your-school.blackboard.com/.../feed.ics"
      onSave={(url) => onNext({ blackboard_calendar_url: url })}
      onSkip={onSkip}
      saving={saving}
      setError={setError}
      initialUrl={initialUrl}
      onDraftChange={onDraftChange}
      skipLabel={skipLabel}
    />
  );
}
