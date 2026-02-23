"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

/** Regex for validating a Pensieve calendar URL. */
const PENSIEVE_URL_REGEX = /^https:\/\/api\.pensieve\.co\/api\/calendar\/[^/]+\.ics$/;

/** Instruction steps for connecting Pensieve. */
const PENSIEVE_STEPS: Array<{ text: string; href?: string }> = [
  { text: "Log into Pensieve", href: "https://www.pensieve.co" },
  { text: "Click on your profile (bottom left)" },
  { text: "Click on \"Enable Calendar URL\"" },
  { text: "Copy and paste the URL below" },
];

interface PensieveStepProps {
  onNext: (payload: { pensieve_calendar_url: string }) => Promise<boolean>;
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
 * Pensieve onboarding step with always-white styling.
 * Shows numbered instructions and a URL input.
 * Validates the URL format client-side before saving.
 *
 * @param onNext - Async callback to save credentials; returns true on success
 * @param onSkip - Callback to skip this step
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function PensieveStep({ onNext, onSkip, saving, error, setError, initialUrl, onDraftChange }: PensieveStepProps) {
  const [url, setUrl] = useState(initialUrl ?? "");

  /** Ref tracking latest URL for unmount draft reporting. */
  const draftRef = useRef({ url });
  useEffect(() => { draftRef.current = { url }; });
  /** Reports draft state to parent on unmount so it persists across step navigation. */
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Validates the URL and saves credentials, then advances to next step.
   */
  async function handleSaveAndNext() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter your Pensieve calendar URL.");
      return;
    }
    if (!PENSIEVE_URL_REGEX.test(trimmed)) {
      setError("Invalid Pensieve URL. It should look like https://api.pensieve.co/api/calendar/...ics");
      return;
    }
    setError(null);
    await onNext({ pensieve_calendar_url: trimmed });
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img src="/pensieve-logo.png" alt="Pensieve" width={22} height={22} className="shrink-0" />
        <h2 className="text-lg font-bold text-gray-800 animate-drop-in">Pensieve</h2>
      </div>

      {/* Numbered instruction steps */}
      <div className="animate-drop-in delay-100">
        <div className="flex flex-col gap-1 mb-4 text-left">
          {PENSIEVE_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2">
              <span className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              {step.href ? (
                <span className="text-sm font-medium text-gray-700">
                  Log into{" "}
                  <a
                    href={step.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Pensieve
                  </a>
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-700">{step.text}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* URL input */}
      <div className="mb-5 animate-drop-in delay-200">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.pensieve.co/api/calendar/...ics"
          autoComplete="off"
          name="pensieve-url-nofill"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 animate-drop-in delay-300">
        <button
          onClick={onSkip}
          className="flex-1 px-4 py-2.5 text-sm text-gray-400 rounded-xl bg-white btn-elevated-secondary"
        >
          skip
        </button>
        <button
          onClick={handleSaveAndNext}
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 btn-elevated-primary"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "saving..." : "save & next"}
        </button>
      </div>
    </div>
  );
}
