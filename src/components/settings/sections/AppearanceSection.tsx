"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import type { ColorTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/** localStorage key for the set of unlocked theme IDs. */
const UNLOCKED_THEMES_KEY = "caltodo_unlocked_themes";

/** Hardcoded access code for the Miffy theme (case-insensitive). */
const MIFFY_ACCESS_CODE = "MIFFY";

/**
 * Reads the set of unlocked theme IDs from localStorage.
 *
 * @returns Array of unlocked theme ID strings
 */
function getUnlockedThemes(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_THEMES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // localStorage unavailable or corrupt
  }
  return [];
}

/**
 * Persists the set of unlocked theme IDs to localStorage.
 *
 * @param themes - Array of unlocked theme ID strings
 */
function saveUnlockedThemes(themes: string[]): void {
  try {
    localStorage.setItem(UNLOCKED_THEMES_KEY, JSON.stringify(themes));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Appearance settings section.
 * Renders the light/dark/auto theme toggle and exclusive theme cards.
 */
export default function AppearanceSection() {
  const { colorTheme, setColorTheme } = useTheme();
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load unlocked themes from localStorage on mount
  useEffect(() => {
    setUnlockedThemes(getUnlockedThemes());
  }, []);

  const isMiffyUnlocked = unlockedThemes.includes("miffy");
  const isMiffyActive = colorTheme === "miffy";

  /**
   * Attempts to unlock the Miffy theme with the entered code.
   * On success: unlocks, activates, and persists.
   * On failure: triggers shake animation and error message.
   */
  const handleUnlock = useCallback(() => {
    if (codeInput.trim().toUpperCase() === MIFFY_ACCESS_CODE) {
      const next = [...unlockedThemes, "miffy"];
      setUnlockedThemes(next);
      saveUnlockedThemes(next);
      setColorTheme("miffy");
      setCodeInput("");
      setError(false);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  }, [codeInput, unlockedThemes, setColorTheme]);

  /**
   * Toggles the Miffy color theme on or off.
   */
  const handleToggleMiffy = useCallback(() => {
    const next: ColorTheme = isMiffyActive ? null : "miffy";
    setColorTheme(next);
  }, [isMiffyActive, setColorTheme]);

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Appearance</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Choose your preferred appearance.
      </p>
      <ThemeToggle />

      {/* Exclusive Themes */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-secondary-foreground mb-3">
          Themes
        </h3>

        {/* Miffy Theme Card */}
        <div
          className={cn(
            "relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
            isMiffyActive
              ? "border-[#f0b8cc] bg-[#fdf2f5] dark:border-[#4a3542] dark:bg-[#231920]"
              : "border-border bg-card"
          )}
        >
          {/* Miffy face icon */}
          <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#fdf2f5] dark:bg-[#231920] flex items-center justify-center p-1">
            <img
              src="/miffy/miffy-head.png"
              alt="Miffy"
              className="h-full w-full object-contain dark:invert"
            />
          </div>

          {/* Label + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">Miffy</span>
              {isMiffyUnlocked && isMiffyActive && (
                <span className="text-[10px] font-medium text-[#e8729a] dark:text-[#f4a0bc]">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isMiffyUnlocked ? "Pastel pink palette" : "Enter code to unlock"}
            </p>
          </div>

          {/* Right side: lock/unlock controls */}
          {isMiffyUnlocked ? (
            <button
              type="button"
              onClick={handleToggleMiffy}
              aria-label={isMiffyActive ? "Deactivate Miffy theme" : "Activate Miffy theme"}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f9a8c9]",
                isMiffyActive
                  ? "bg-[#e8729a]"
                  : "bg-gray-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  isMiffyActive && "translate-x-5"
                )}
              />
            </button>
          ) : (
            <div className={cn("flex items-center gap-1.5", shaking && "animate-shake")}>
              <input
                ref={inputRef}
                type="text"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  if (error) setError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock();
                }}
                placeholder="Enter code"
                className={cn(
                  "h-7 w-24 rounded-md border px-2 text-xs bg-background text-foreground",
                  "placeholder:text-subtle-foreground",
                  "focus:outline-none focus:ring-1 focus:ring-[#f9a8c9]",
                  error
                    ? "border-red-400 dark:border-red-500"
                    : "border-input-border"
                )}
              />
              <button
                type="button"
                onClick={handleUnlock}
                aria-label="Unlock theme"
                className={cn(
                  "h-7 px-2.5 shrink-0 rounded-md flex items-center justify-center text-xs font-medium",
                  "bg-[#fce8ef] text-[#e8729a] hover:bg-[#f9d5e0]",
                  "dark:bg-[#2a1f26] dark:text-[#f4a0bc] dark:hover:bg-[#3d2e36]",
                  "transition-colors duration-150"
                )}
              >
                Unlock
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-[11px] text-red-500 dark:text-red-400 pl-1">
            Wrong code. Try again.
          </p>
        )}
      </div>
    </section>
  );
}
