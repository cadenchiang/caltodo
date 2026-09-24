"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { NumberedSteps, StepHeading } from "@/components/onboarding/StepChrome";
import { PROVIDER_LABELS, SKIP_LABEL, type ProviderKey } from "@/lib/copy";

/**
 * Loose client-side check: an HTTPS URL. Brightspace and Blackboard feed
 * URLs are per-institution, so no domain can be pinned; the server's SSRF
 * allowlist is the real gate. This only catches the obvious mistakes.
 */
export const HTTPS_URL_REGEX = /^https:\/\/.+/i;

/**
 * Validates a calendar feed URL for a per-institution provider.
 *
 * @param url - Raw text from the field
 * @param label - Provider label for the message
 * @returns An error message, or null when the URL is usable
 */
export function validateFeedUrl(url: string, label: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return `Please enter your ${label} calendar URL.`;
  if (!HTTPS_URL_REGEX.test(trimmed)) return "Enter a valid https:// calendar feed URL.";
  return null;
}

export interface FeedUrlStepProps {
  /** Which provider this step connects. */
  provider: Extract<ProviderKey, "brightspace" | "blackboard">;
  /** Numbered instructions for finding the feed URL. */
  instructions: ReadonlyArray<string>;
  /** Example URL shown in the field. */
  placeholder: string;
  /** Saves the URL; resolves true on success. */
  onSave: (url: string) => Promise<boolean>;
  /** Secondary action (skip in the flow, cancel from settings). */
  onSkip: () => void;
  saving: boolean;
  setError: (error: string | null) => void;
  /** Persisted draft URL from a previous visit to this step. */
  initialUrl?: string;
  /** Called on unmount to persist draft state across step navigation. */
  onDraftChange?: (draft: { url: string }) => void;
  /** Label for the secondary action. Defaults to the shared skip label. */
  skipLabel?: string;
}

/**
 * URL-only feed step shared by Brightspace and Blackboard: instructions, a
 * labeled URL field with inline validation, connect, and a quiet skip.
 * Wrapped in a form so Enter submits.
 *
 * @param provider - brightspace | blackboard
 * @param instructions - Steps to find the feed URL
 * @param onSave - Receives the trimmed URL
 * @param skipLabel - "Skip for now" in the flow, "Cancel" from settings
 */
export default function FeedUrlStep({
  provider, instructions, placeholder, onSave, onSkip, saving, setError, initialUrl, onDraftChange, skipLabel = SKIP_LABEL,
}: FeedUrlStepProps) {
  const label = PROVIDER_LABELS[provider];
  const [url, setUrl] = useState(initialUrl ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);

  const draftRef = useRef({ url });
  useEffect(() => { draftRef.current = { url }; });
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validateFeedUrl(url, label);
    if (problem) {
      setUrlError(problem);
      return;
    }
    setUrlError(null);
    setError(null);
    await onSave(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepHeading provider={provider} />
      <NumberedSteps steps={instructions} />
      <div className="mb-5">
        <TextField
          label="Calendar feed URL"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (urlError) setUrlError(null);
          }}
          error={urlError}
          placeholder={placeholder}
          autoComplete="off"
          name={`${provider}-url-nofill`}
        />
      </div>
      <Button type="submit" variant="inverted" size="lg" className="w-full" loading={saving} disabled={!url.trim()}>
        {saving ? "Saving..." : "Connect"}
      </Button>
      <div className="mt-3 text-center">
        <Button variant="ghost" size="sm" onClick={onSkip} disabled={saving}>
          {skipLabel}
        </Button>
      </div>
    </form>
  );
}
