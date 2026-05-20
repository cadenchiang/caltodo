"use client";

/**
 * Pomodoro timer widget with work/break intervals.
 * Features an SVG circular progress ring, MM:SS countdown,
 * session counter, and Play/Pause/Reset/Skip controls.
 *
 * Timer state is persisted to localStorage — survives page refresh and navigation.
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
const POMO_STORAGE_KEY = "caltodo_pomodoro_state";

interface PersistedPomoState {
  phase: Phase;
  secondsLeft: number;
  running: boolean;
  completedSessions: number;
  /** Wall-clock timestamp (ms) when state was saved — used to compute elapsed time on restore. */
  savedAt: number;
}

/**
 * Reads persisted Pomodoro state from localStorage.
 * If the timer was running when saved, adjusts secondsLeft by elapsed time.
 *
 * @returns Restored state or null if not available
 */
function readPersistedState(): PersistedPomoState | null {
  try {
    const raw = localStorage.getItem(POMO_STORAGE_KEY);
    if (!raw) return null;
    const state: PersistedPomoState = JSON.parse(raw);
    if (state.running && state.savedAt) {
      const elapsed = Math.floor((Date.now() - state.savedAt) / 1000);
      state.secondsLeft = Math.max(0, state.secondsLeft - elapsed);
    }
    return state;
  } catch { return null; }
}

/**
 * Writes Pomodoro state to localStorage for persistence across page refreshes.
 */
function writePersistedState(state: Omit<PersistedPomoState, "savedAt">): void {
  try {
    localStorage.setItem(POMO_STORAGE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch { /* non-critical */ }
}

/**
 * Plays a mechanical clock tick sound using noise burst + resonant filter.
 * Mimics the sharp "tick" of a wind-up clock mechanism.
 */
function playClickSound() {
  try {
    const ctx = new AudioContext();
    const t = ctx.currentTime;

    // Short noise burst for the mechanical "click"
    const bufferSize = Math.floor(ctx.sampleRate * 0.015);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter to give it a woody, clock-like resonance
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3200;
    filter.Q.value = 5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.03);
  } catch { /* Web Audio not supported */ }
}

/**
 * Plays a classic mechanical alarm bell sound.
 * Rapid alternating strikes like a wind-up alarm clock ringing.
 */
function playRingSound() {
  try {
    const ctx = new AudioContext();
    const t = ctx.currentTime;
    const strikes = 8;
    const interval = 0.12;

    for (let i = 0; i < strikes; i++) {
      const offset = t + i * interval;
      // Alternate between two slightly different pitches like a twin-bell alarm
      const freq = i % 2 === 0 ? 2200 : 2600;

      // Bell tone
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;

      // Metallic overtone
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq * 2.76;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, offset);
      gain.gain.linearRampToValueAtTime(0.7, offset + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.09);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, offset);
      gain2.gain.linearRampToValueAtTime(0.25, offset + 0.005);
      gain2.gain.exponentialRampToValueAtTime(0.001, offset + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc.start(offset);
      osc.stop(offset + 0.1);
      osc2.start(offset);
      osc2.stop(offset + 0.1);
    }
  } catch { /* Web Audio not supported */ }
}

export default function PomodoroWidget({
  config,
  onUpdateConfig,
  editMode,
}: PomodoroWidgetProps) {
  const workMinutes = Number(config?.workMinutes) || 25;
  const breakMinutes = Number(config?.breakMinutes) || 5;
  const { containerRef, compact } = useCompactMode(180);

  const [phase, setPhase] = useState<Phase>(() => readPersistedState()?.phase ?? "work");
  const [secondsLeft, setSecondsLeft] = useState(() => readPersistedState()?.secondsLeft ?? workMinutes * 60);
  const [running, setRunning] = useState(() => readPersistedState()?.running ?? false);
  const [completedSessions, setCompletedSessions] = useState(() => readPersistedState()?.completedSessions ?? 0);

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
        // Phase complete — play alarm and notify user
        playRingSound();
        try {
          if (Notification.permission === "granted") {
            new Notification(phase === "work" ? "Break time!" : "Back to focus!", {
              body: phase === "work" ? "Great work! Take a break." : "Break's over. Let's go!",
              silent: false,
            });
          }
        } catch { /* notifications not supported */ }

        if (phase === "work") {
          setCompletedSessions((s) => s + 1);
          setPhase("break");
          setSecondsLeft(breakMinutes * 60);
        } else {
          setPhase("work");
          setSecondsLeft(workMinutes * 60);
        }
        // setPhase triggers effect re-run which restarts the interval
        return;
      }
      setSecondsLeft(remaining);
      // Update tab title in the same tick — no separate interval needed
      const label = phase === "work" ? "Focus" : "Break";
      document.title = `${formatTime(remaining)} — ${label} | caltodo`;
    };

    // Set title immediately on start
    const label = phase === "work" ? "Focus" : "Break";
    document.title = `${formatTime(secondsLeft)} — ${label} | caltodo`;

    intervalRef.current = setInterval(tick, 500);

    return clearTimer;
  }, [running, phase, workMinutes, breakMinutes, clearTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Reset tab title when timer stops. */
  useEffect(() => {
    if (!running) document.title = "caltodo";
  }, [running]);

  /** Persist timer state to localStorage on every change. */
  useEffect(() => {
    writePersistedState({ phase, secondsLeft, running, completedSessions });
  }, [phase, secondsLeft, running, completedSessions]);

  /** Toggle play/pause. Plays click sound on start. Requests notification permission on first start. */
  function handlePlayPause() {
    if (editMode) return;
    if (!running) {
      playClickSound();
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
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
  const workColor = config?.accentColor || '#0e89d6';
  const breakColor = '#22c55e';
  const ringStroke = phase === "work" ? workColor : breakColor;

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col p-3 overflow-hidden">
      {compact ? (
        /* Compact: single row */
        <div className="flex items-center gap-2 h-full">
          <span className="text-lg font-light text-foreground tabular-nums flex-1">
            {formatTime(secondsLeft)}
          </span>
          <div className="flex items-center gap-1 no-drag shrink-0">
            <button onClick={handlePlayPause} disabled={editMode} className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform disabled:opacity-40" style={{ backgroundColor: workColor }} aria-label={running ? "Pause" : "Start"}>
              {running ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
            </button>
            <button onClick={handleReset} disabled={editMode} className="w-5 h-5 rounded-full flex items-center justify-center text-foreground hover:text-foreground transition-colors disabled:opacity-40" aria-label="Reset">
              <RotateCcw size={10} />
            </button>
          </div>
        </div>
      ) : (
        /* Full size: large time, progress bar, label + controls */
        <>
          {/* Phase label */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
              {phase === "work" ? "Focus" : "Break"}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_SESSIONS }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i < completedSessions ? workColor : 'var(--color-muted-foreground, #9ca3af)',
                    opacity: i < completedSessions ? 1 : 0.2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Large time display */}
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-5xl font-extralight tracking-tight text-foreground tabular-nums"
              style={running ? { textShadow: `0 0 20px ${ringStroke}30` } : undefined}
            >
              {formatTime(secondsLeft)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress * 100}%`, backgroundColor: ringStroke }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 no-drag">
            <button onClick={handleReset} disabled={editMode} className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none" aria-label="Reset timer">
              <RotateCcw size={14} />
            </button>
            <button onClick={handlePlayPause} disabled={editMode} className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-40 disabled:pointer-events-none" style={{ backgroundColor: workColor }} aria-label={running ? "Pause timer" : "Start timer"}>
              {running ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button onClick={handleSkip} disabled={editMode} className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none" aria-label="Skip to next phase">
              <SkipForward size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
