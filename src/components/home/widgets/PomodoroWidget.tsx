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
import { useCompactMode } from "@/hooks/useCompactMode";

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
  const { containerRef, compact } = useCompactMode(180);

  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  /** Total seconds for the current phase (used for progress calculation). */
  const totalForPhase = phase === "work" ? workMinutes * 60 : breakMinutes * 60;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Wall-clock timestamp (ms) when the timer was started/resumed. */
  const startTimeRef = useRef<number>(0);
  /** How many seconds were remaining when the timer was started/resumed. */
  const startSecondsRef = useRef<number>(0);

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

  /**
   * Tick the timer using wall-clock elapsed time so it stays accurate
   * even when the browser tab is backgrounded / throttled.
   */
  useEffect(() => {
    if (!running) {
      clearTimer();
      return;
    }

    startTimeRef.current = Date.now();
    startSecondsRef.current = secondsLeft;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, startSecondsRef.current - elapsed);

      if (remaining <= 0) {
        // Phase complete — switch phases
        clearTimer();
        setRunning(false);

        if (phase === "work") {
          setCompletedSessions((s) => s + 1);
          setPhase("break");
          setSecondsLeft(breakMinutes * 60);
        } else {
          setPhase("work");
          setSecondsLeft(workMinutes * 60);
        }
        return;
      }
      setSecondsLeft(remaining);
    };

    intervalRef.current = setInterval(tick, 500);

    return clearTimer;
  }, [running, phase, workMinutes, breakMinutes, clearTimer]); // eslint-disable-line react-hooks/exhaustive-deps

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

  /** Ring color based on current phase and accent config. */
  const workColor = config?.accentColor || '#f97316';
  const breakColor = '#22c55e';
  const ringStroke = phase === "work" ? workColor : breakColor;
  const labelText = phase === "work" ? "Focus" : "Break";

  const ringSize = compact ? 80 : 130;
  const timeTextClass = compact ? "text-xl" : "text-3xl";

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col items-center justify-center p-4 gap-1">
      {/* SVG progress ring with time display */}
      <div className="relative flex items-center justify-center">
        <svg
          width={ringSize}
          height={ringSize}
          viewBox="0 0 120 120"
          className="-rotate-90"
          style={running ? { filter: `drop-shadow(0 0 8px ${ringStroke}40)` } : undefined}
        >
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
            stroke={ringStroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>

        {/* Centered time text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${timeTextClass} font-light tracking-tight text-foreground tabular-nums`}>
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Phase label — hidden in compact mode */}
      {!compact && (
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase bg-muted/50 rounded-full px-3 py-0.5">
          {labelText}
        </span>
      )}

      {/* Session dots — hidden in compact mode */}
      {!compact && (
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_SESSIONS }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < completedSessions
                  ? workColor
                  : 'var(--color-muted-foreground, #9ca3af)',
                opacity: i < completedSessions ? 1 : 0.2,
              }}
            />
          ))}
        </div>
      )}

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
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-40 disabled:pointer-events-none"
          style={{ backgroundColor: workColor }}
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
