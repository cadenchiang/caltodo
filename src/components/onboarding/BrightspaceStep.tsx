"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/**
 * Loose client-side check: an HTTPS URL. Brightspace (D2L) feed URLs are
 * per-institution (the host varies by school), so we can't pin a domain like
 * Pensieve does — the server's SSRF allowlist (isAllowedCanvasUrl) is the real
 * gate. We only catch obvious mistakes (non-HTTPS / empty) here.
 */
const HTTPS_URL_REGEX = /^https:\/\/.+/i;

/** Instruction steps for connecting a Brightspace calendar feed. */
const BRIGHTSPACE_STEPS: Array<{ text: string }> = [
  { text: "Open Brightspace and go to Calendar" },
  { text: "Click \"Subscribe\" (top-right of the calendar)" },
  { text: "Copy the iCal feed URL it gives you" },
  { text: "Paste the URL below" },
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
}

/**
 * Brightspace (D2L) onboarding step. Theme-aware, mirrors PensieveStep but
 * URL-only: Brightspace has no per-course selection in the sync backend, so
 * the feed's courses all sync. Validates a basic HTTPS URL client-side; the
 * server enforces the SSRF allowlist and the feed's real validity on save.
 *
 * @param onNext - Async callback to save the URL; returns true on success
 * @param onSkip - Callback to skip this step
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function BrightspaceStep({ onNext, onSkip, saving, error, setError, initialUrl, onDraftChange }: BrightspaceStepProps) {
  const { showToast } = useToast();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [urlInvalid, setUrlInvalid] = useState(false);

  /** Ref tracking latest URL for unmount draft reporting. */
  const draftRef = useRef({ url });
  useEffect(() => { draftRef.current = { url }; });
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Validates the URL and saves it. */
  async function handleSaveAndNext() {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlInvalid(true);
      showToast("Please enter your Brightspace calendar URL.", { variant: "error", duration: 4000 });
      return;
    }
    if (!HTTPS_URL_REGEX.test(trimmed)) {
      setUrlInvalid(true);
      showToast("Enter a valid https:// calendar feed URL.", { variant: "error", duration: 4000 });
      return;
    }
    setUrlInvalid(false);
    setError(null);
    await onNext({ brightspace_calendar_url: trimmed });
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-foreground animate-drop-in">Brightspace</h2>
      </div>

      {/* Numbered instruction steps */}
      <div className="animate-drop-in delay-100">
        <div className="flex flex-col gap-1 mb-4 text-left">
          {BRIGHTSPACE_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2">
              <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{step.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* URL input */}
      <div className="mb-5 animate-drop-in delay-200">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (urlInvalid) setUrlInvalid(false);
          }}
          placeholder="https://your-school.brightspace.com/.../feed.ics"
          autoComplete="off"
          name="brightspace-url-nofill"
          className={`w-full px-3 py-2.5 rounded-xl border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none transition-colors ${
            urlInvalid
              ? "border-red-500 focus:border-red-500"
              : "border-foreground/20 focus:border-foreground/50"
          }`}
        />
      </div>

      {/* Action button */}
      <div className="animate-drop-in delay-300">
        <button
          onClick={handleSaveAndNext}
          disabled={saving || !url.trim()}
          className={`w-full px-5 py-2.5 rounded-full text-sm font-semibold border border-transparent flex items-center justify-center gap-2 transition-colors ${
            !url.trim()
              ? "bg-[#D1D1D6] dark:bg-[#3A3A3C] text-white/70 dark:text-white/40 cursor-not-allowed"
              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 disabled:opacity-50"
          }`}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Saving..." : "Connect"}
        </button>
        <button
          onClick={onSkip}
          className="mt-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>

      {error && <p className="sr-only">{error}</p>}
    </div>
  );
}
