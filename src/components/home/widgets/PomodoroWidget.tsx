"use client";

/**
 * Pomodoro timer widget with work/break intervals.
 * Features an SVG circular progress ring, MM:SS countdown,
 * session counter, and Play/Pause/Reset/Skip controls.
 *
 * Timer state is ephemeral — resets on page refresh.
 *
 * @param config - Widget config with workMinutes and breakMinutes
 * @param onUpdateConfig - Callback to persist config changes
 * @param editMode - Whether the dashboard is in edit mode (disables controls)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface PomodoroWidgetProps {
  config?: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
  editMode?: boolean;
}

/** Pomodoro phase — either focusing or taking a break. */
type Phase = "work" | "break";

/** SVG progress ring radius and derived constants. */
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Formats seconds into MM:SS string.
 *
 * @param totalSeconds - Number of seconds to format
 * @returns Formatted time string (e.g. "25:00")
 */
function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const TOTAL_SESSIONS = 4;

export default function PomodoroWidget({
  config,
  onUpdateConfig,
  editMode,
}: PomodoroWidgetProps) {
  const workMinutes = Number(config?.workMinutes) || 25;
  const breakMinutes = Number(config?.breakMinutes) || 5;

  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  /** Total seconds for the current phase (used for progress calculation). */
  const totalForPhase = phase === "work" ? workMinutes * 60 : breakMinutes * 60;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Clears the running interval if active. */
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** Reset timer when config changes (work/break minutes). */
  useEffect(() => {
    setSecondsLeft(phase === "work" ? workMinutes * 60 : breakMinutes * 60);
    setRunning(false);
    clearTimer();
  }, [workMinutes, breakMinutes, clearTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Tick the timer every second while running. */
  useEffect(() => {
    if (!running) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Phase complete — switch phases
          clearTimer();
          setRunning(false);

          if (phase === "work") {
            setCompletedSessions((s) => s + 1);
            setPhase("break");
            return breakMinutes * 60;
          } else {
            setPhase("work");
            return workMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [running, phase, workMinutes, breakMinutes, clearTimer]);

  /** Toggle play/pause. */
  function handlePlayPause() {
    if (editMode) return;
    setRunning((r) => !r);
  }

  /** Reset timer to beginning of current phase. */
  function handleReset() {
    if (editMode) return;
    setRunning(false);
    clearTimer();
    setSecondsLeft(totalForPhase);
  }

  /** Skip to the next phase. */
  function handleSkip() {
    if (editMode) return;
    setRunning(false);
    clearTimer();

    if (phase === "work") {
      setCompletedSessions((s) => s + 1);
      setPhase("break");
      setSecondsLeft(breakMinutes * 60);
    } else {
      setPhase("work");
      setSecondsLeft(workMinutes * 60);
    }
  }

  /** Progress fraction (0 = full, 1 = empty). */
  const progress = 1 - secondsLeft / totalForPhase;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  /** Ring color based on current phase. */
  const ringColor = phase === "work" ? "stroke-orange-500" : "stroke-green-500";
  const labelText = phase === "work" ? "Focus" : "Break";

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-3 gap-1">
      {/* SVG progress ring with time display */}
      <div className="relative flex items-center justify-center">
        <svg width="130" height="130" viewBox="0 0 120 120" className="-rotate-90">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground/15"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx="60"
            cy="60"
            r={RING_RADIUS}
            fill="none"
            className={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>

        {/* Centered time text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-light tracking-tight text-foreground tabular-nums">
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Phase label */}
      <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
        {labelText}
      </span>

      {/* Session dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_SESSIONS }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < completedSessions
                ? "bg-orange-500"
                : "bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-1 no-drag">
        <button
          onClick={handleReset}
          disabled={editMode}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Reset timer"
        >
          <RotateCcw size={14} />
        </button>

        <button
          onClick={handlePlayPause}
          disabled={editMode}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <button
          onClick={handleSkip}
          disabled={editMode}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Skip to next phase"
        >
          <SkipForward size={14} />
        </button>
      </div>
    </div>
  );
}
