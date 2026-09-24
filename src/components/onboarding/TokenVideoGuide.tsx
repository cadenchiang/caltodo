"use client";

import { useCallback, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { NumberedSteps, STEP_LINK } from "@/components/onboarding/StepChrome";
import { cn } from "@/lib/utils";

/** Instruction steps for generating a Canvas access token, keyed to the video. */
export const TOKEN_STEPS: ReadonlyArray<{ label: string; time: number }> = [
  { label: "Open your Canvas settings", time: 0 },
  { label: "Click New access token", time: 5 },
  { label: "Name the token whatever you want", time: 9 },
  { label: "Set expiration to the maximum (120 days)", time: 12 },
  { label: "Copy and paste your token below", time: 18 },
];

/** Seconds at which the walkthrough ends and the player collapses. */
const VIDEO_END_S = 28;

/**
 * Formats seconds as "M:SS".
 *
 * @param seconds - Time in seconds
 * @returns "0:05" style label
 */
export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Builds the Canvas profile settings URL for a host.
 *
 * @param host - Bare Canvas hostname; empty falls back to a generic path
 * @returns Absolute settings URL, or a relative hint when no host is known
 */
export function canvasSettingsUrl(host: string): string {
  return host ? `https://${host}/profile/settings` : "https://canvas.instructure.com/profile/settings";
}

export interface TokenVideoGuideProps {
  /** Canvas host used for the settings link. */
  host: string;
}

/**
 * Numbered token instructions with an expandable walkthrough video. When
 * expanded, the steps highlight in time with playback and clicking one
 * seeks the video.
 *
 * @param host - Canvas hostname for the "Open your Canvas settings" link
 */
export default function TokenVideoGuide({ host }: TokenVideoGuideProps) {
  const [expanded, setExpanded] = useState(false);
  const [time, setTime] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setTime(v.currentTime);
    if (v.currentTime >= VIDEO_END_S && !v.paused) {
      v.pause();
      v.currentTime = 0;
      setTime(0);
      setExpanded(false);
    }
  }, []);

  const activeStep = expanded ? TOKEN_STEPS.reduce((acc, step, i) => (time >= step.time ? i : acc), 0) : -1;

  function play(fromSeconds: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = fromSeconds;
    v.play().catch((err: unknown) => console.warn("[onboarding] video play blocked", err));
  }

  const settingsLink = (
    <>
      Open your{" "}
      <a href={canvasSettingsUrl(host)} target="_blank" rel="noopener noreferrer" className={STEP_LINK}>
        Canvas settings
      </a>
    </>
  );

  return (
    <div>
      {/* Expanded: steps beside the video */}
      <div
        className={cn("grid overflow-hidden transition-all duration-500", expanded && "sm:-mx-80")}
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr", opacity: expanded ? 1 : 0 }}
        aria-hidden={!expanded}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-8 mb-4">
            <div className="sm:w-56 shrink-0 flex flex-col gap-1.5">
              {TOKEN_STEPS.map((step, i) => {
                const active = activeStep === i;
                return (
                  <button
                    key={step.time}
                    type="button"
                    tabIndex={expanded ? 0 : -1}
                    onClick={() => play(step.time)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-foreground hover:bg-accent"
                    )}
                  >
                    <span className="tabular-nums text-xs font-mono text-muted-foreground shrink-0 w-8 text-right">
                      {formatTimestamp(step.time)}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        active ? "bg-blue-500 text-white" : "bg-foreground text-background"
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className={cn("text-sm leading-tight", active ? "font-semibold" : "font-medium")}>
                      {i === 0 ? settingsLink : step.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex-1 min-w-0 rounded-xl overflow-hidden shadow-lg dark:shadow-none">
              <video ref={videoRef} src="/bcourses-instructions.mp4" muted playsInline controls onTimeUpdate={handleTimeUpdate} className="w-full" />
            </div>
          </div>
          <button
            type="button"
            tabIndex={expanded ? 0 : -1}
            onClick={() => { setExpanded(false); videoRef.current?.pause(); }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1 rounded px-1 py-1"
          >
            <X size={14} aria-hidden="true" />
            Hide video
          </button>
        </div>
      </div>

      {/* Collapsed: numbered steps and the watch button */}
      <div
        className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-500"
        style={{ gridTemplateRows: expanded ? "0fr" : "1fr", opacity: expanded ? 0 : 1 }}
        aria-hidden={expanded}
      >
        <div className="min-h-0 overflow-hidden">
          <NumberedSteps
            steps={TOKEN_STEPS.map((step, i) =>
              i === 0 ? settingsLink : i === 1 ? (
                <>
                  {step.label}
                  <button
                    type="button"
                    tabIndex={expanded ? -1 : 0}
                    onClick={() => setShowHelp((v) => !v)}
                    aria-expanded={showHelp}
                    className="text-blue-500 font-normal text-xs hover:text-blue-600 transition-colors rounded px-1"
                  >
                    Having issues?
                  </button>
                </>
              ) : step.label
            )}
          />
          {showHelp && (
            <p className="text-xs text-muted-foreground ml-12 -mt-2 mb-3 leading-relaxed text-left">
              If you have any existing API tokens, delete them first, then create a new one.
            </p>
          )}
          <button
            type="button"
            tabIndex={expanded ? -1 : 0}
            onClick={() => {
              setExpanded(true);
              setTimeout(() => {
                play(0);
                if (videoRef.current) videoRef.current.playbackRate = 1.1;
              }, 400);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-3 mb-4 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Play size={14} aria-hidden="true" />
            Watch how to generate a token
          </button>
        </div>
      </div>
    </div>
  );
}
