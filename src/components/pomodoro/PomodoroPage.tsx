"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus, X, Check } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColor } from "@/lib/constants";
import { playPomodoroClick, playPomodoroAlarm } from "@/lib/sounds";
import TaskPickerModal from "./TaskPickerModal";
import type { Task } from "@/lib/types";

type Mode = "pomodoro" | "shortBreak" | "longBreak";

const MODE_DURATIONS: Record<Mode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  pomodoro: "Pomodoro",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const STORAGE_KEY = "caltodo_focus_session";

interface PersistedState {
  mode: Mode;
  timeLeft: number;
  running: boolean;
  endTime: number | null;
  sessionCount: number;
  selectedTaskIds: string[];
}

function readPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function writePersisted(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* non-critical */ }
}

/**
 * Full-page Pomodoro timer with task selection, session tracking, and
 * persistent state. Supports three modes (Pomodoro, Short Break, Long
 * Break) and optional task association from the user's task list.
 */
export default function PomodoroPage() {
  const { tasks, toggleComplete } = useTaskContext();
  const { colorTheme } = useTheme();

  const persisted = useRef(readPersisted());
  const [mode, setMode] = useState<Mode>(persisted.current?.mode ?? "pomodoro");
  const [timeLeft, setTimeLeft] = useState(() => {
    const p = persisted.current;
    if (!p) return MODE_DURATIONS.pomodoro;
    if (p.running && p.endTime) {
      const remaining = Math.max(0, Math.round((p.endTime - Date.now()) / 1000));
      return remaining;
    }
    return p.timeLeft;
  });
  const [running, setRunning] = useState(() => {
    const p = persisted.current;
    if (!p) return false;
    if (p.running && p.endTime) {
      return (p.endTime - Date.now()) > 0;
    }
    return false;
  });
  const [sessionCount, setSessionCount] = useState(
    persisted.current?.sessionCount ?? 0,
  );
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(
    persisted.current?.selectedTaskIds ?? [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const endTimeRef = useRef<number | null>(
    persisted.current?.running ? persisted.current.endTime : null,
  );
  const hasAlertedRef = useRef(false);

  const persist = useCallback(() => {
    writePersisted({
      mode,
      timeLeft,
      running,
      endTime: endTimeRef.current,
      sessionCount,
      selectedTaskIds,
    });
  }, [mode, timeLeft, running, sessionCount, selectedTaskIds]);

  useEffect(() => {
    persist();
  }, [persist]);

  useEffect(() => {
    if (!running) return;

    const tick = setInterval(() => {
      const end = endTimeRef.current;
      if (!end) return;
      const remaining = Math.max(
        0,
        Math.round((end - Date.now()) / 1000),
      );
      setTimeLeft(remaining);

      if (remaining <= 0 && !hasAlertedRef.current) {
        hasAlertedRef.current = true;
        playPomodoroAlarm();
        setRunning(false);
        endTimeRef.current = null;
        if (mode === "pomodoro") {
          setSessionCount((c) => c + 1);
        }
      }
    }, 250);

    return () => clearInterval(tick);
  }, [running, mode]);

  function handleStart() {
    playPomodoroClick();
    if (running) {
      setRunning(false);
      endTimeRef.current = null;
    } else {
      const t = timeLeft > 0 ? timeLeft : MODE_DURATIONS[mode];
      if (timeLeft <= 0) setTimeLeft(t);
      endTimeRef.current = Date.now() + t * 1000;
      hasAlertedRef.current = false;
      setRunning(true);
    }
  }

  function handleReset() {
    playPomodoroClick();
    setRunning(false);
    endTimeRef.current = null;
    hasAlertedRef.current = false;
    setTimeLeft(MODE_DURATIONS[mode]);
  }

  function handleModeChange(m: Mode) {
    playPomodoroClick();
    setMode(m);
    setRunning(false);
    endTimeRef.current = null;
    hasAlertedRef.current = false;
    setTimeLeft(MODE_DURATIONS[m]);
  }

  function removeTask(id: string) {
    setSelectedTaskIds((prev) => prev.filter((t) => t !== id));
  }

  function handleToggleComplete(id: string) {
    toggleComplete(id);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = MODE_DURATIONS[mode];
  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

  const selectedTasks: Task[] = selectedTaskIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => !!t);

  const focusMessage =
    mode === "pomodoro"
      ? "Time to focus!"
      : mode === "shortBreak"
        ? "Take a short break"
        : "Take a long break";

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto py-6 pb-24 md:pb-6">
      {/* Timer Section */}
      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-lg font-semibold text-foreground mb-6">
          Focus Time
        </h1>

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/60 mb-8">
          {(["pomodoro", "shortBreak", "longBreak"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                mode === m
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-6">
          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 288 288"
          >
            <circle
              cx="144"
              cy="144"
              r="136"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-border"
            />
            <circle
              cx="144"
              cy="144"
              r="136"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 136}
              strokeDashoffset={2 * Math.PI * 136 * (1 - progress)}
              strokeLinecap="round"
              className="text-foreground transition-all duration-500"
            />
          </svg>
          <div className="text-center z-10">
            <span
              className="text-7xl font-bold tabular-nums text-foreground tracking-tight"
              style={{
                textShadow: running
                  ? "0 0 30px rgba(var(--foreground-rgb, 0 0 0) / 0.1)"
                  : undefined,
              }}
            >
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity shadow-sm"
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 text-sm rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* Session Info */}
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            #{sessionCount + 1}
          </p>
          <p className="text-sm text-muted-foreground">{focusMessage}</p>
        </div>

        {/* Session Dots */}
        {sessionCount > 0 && (
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: Math.min(sessionCount, 8) }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-foreground/70"
              />
            ))}
            {sessionCount < 4 &&
              Array.from({ length: 4 - sessionCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-2 h-2 rounded-full bg-border"
                />
              ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="lg:w-96 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Tasks</h2>
          <span className="text-xs text-muted-foreground">
            {selectedTasks.filter((t) => t.is_completed).length}/
            {selectedTasks.length} done
          </span>
        </div>

        {selectedTasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedTasks.map((task) => {
              const taskColor = getThemeColor(task.color, colorTheme);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card transition-opacity ${
                    task.is_completed ? "opacity-50" : ""
                  }`}
                >
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      task.is_completed
                        ? "bg-muted-foreground border-muted-foreground"
                        : "border-muted-foreground/40 hover:border-foreground"
                    }`}
                  >
                    {task.is_completed && (
                      <Check size={12} className="text-background" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        task.is_completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className="text-xs mt-0.5" style={{ color: taskColor }}>
                        {formatTaskDate(task)}
                      </p>
                    )}
                  </div>
                  {task.course_name && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      # {task.course_name}
                    </span>
                  )}
                  <button
                    onClick={() => removeTask(task.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks selected for this session.
          </div>
        )}

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <TaskPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(ids) => setSelectedTaskIds(ids)}
        alreadySelected={selectedTaskIds}
      />
    </div>
  );
}

function formatTaskDate(task: Task): string {
  if (!task.due_date) return "";
  const d = new Date(task.due_date + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
  if (task.due_time) {
    const [h, m] = task.due_time.split(":");
    const dt = new Date();
    dt.setHours(Number(h), Number(m));
    return `${dateStr}, ${dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }
  return dateStr;
}
