"use client";

/**
 * Modal that walks the user through finding a Spotify link and pastes it.
 * Mirrors the onboarding-step visual style: numbered badges with instructions,
 * an input field, and a primary "Add" button. Validates the URL via the same
 * parseSpotifyUrl helper the widget uses to render the embed.
 *
 * @module SpotifyLinkModal
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { parseSpotifyUrl } from "./SpotifyWidget";

interface SpotifyLinkModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Initial URL value (for editing an existing link). */
  initialUrl?: string;
  /** Called when the user closes without saving. */
  onClose: () => void;
  /** Called with the validated, trimmed URL when the user submits. */
  onSubmit: (url: string) => void;
}

/**
 * Numbered instruction step rows shown above the input.
 * Each step renders a circular index badge and the instruction text.
 */
const STEPS: Array<{ label: string }> = [
  { label: "Open Spotify on your phone or computer" },
  { label: "Find a song, album, or playlist you want to embed" },
  { label: 'Tap "..." or right-click → Share → Copy link to song or Embed track' },
];

/**
 * Modal that collects a Spotify share link with inline instructions.
 *
 * @param open - Whether the modal is visible
 * @param initialUrl - Pre-fills the input (used when editing an existing link)
 * @param onClose - Invoked when the user dismisses the modal
 * @param onSubmit - Invoked with the validated URL when the user clicks Add
 */
export default function SpotifyLinkModal({
  open,
  initialUrl,
  onClose,
  onSubmit,
}: SpotifyLinkModalProps) {
  const [draft, setDraft] = useState(initialUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset draft + focus the input each time the modal opens so a fresh paste
  // is the natural next action.
  useEffect(() => {
    if (!open) return;
    setDraft(initialUrl ?? "");
    setError(null);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open, initialUrl]);

  // Close on Escape so the modal feels like the rest of the app.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /**
   * Validates the current draft and forwards it to onSubmit when valid.
   * Sets an inline error message when parseSpotifyUrl rejects the input.
   */
  function handleSubmit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Paste a Spotify link to continue.");
      return;
    }
    const parsed = parseSpotifyUrl(trimmed);
    if (!parsed) {
      setError("That doesn't look like a Spotify link.");
      return;
    }
    setError(null);
    onSubmit(trimmed);
  }

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-[440px] max-w-[95vw] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spotify-link-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-6 pb-5 text-center">
          <h2
            id="spotify-link-modal-title"
            className="text-lg font-bold text-foreground"
          >
            Add a Spotify link
          </h2>
        </div>

        <div className="px-6 pb-5 flex flex-col gap-1 text-left">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2">
              <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-foreground">
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5">
          <input
            ref={inputRef}
            type="url"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="https://open.spotify.com/track/..."
            autoComplete="off"
            className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
          />
          {error && (
            <p className="mt-2 text-[12px] text-red-500">{error}</p>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!draft.trim()}
            className={`w-full px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              !draft.trim()
                ? "bg-[#D1D1D6] dark:bg-[#3A3A3C] text-white/70 dark:text-white/40 cursor-not-allowed"
                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800"
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
