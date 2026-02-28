"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Lock } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import type { ColorTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/** localStorage key for the set of unlocked theme IDs. */
const UNLOCKED_THEMES_KEY = "caltodo_unlocked_themes";

/** Hardcoded access code for the Miffy theme (case-insensitive). */
const MIFFY_ACCESS_CODE = "CHENFEI";

/**
 * Theme option metadata for rendering in the picker grid.
 *
 * @param id - Color theme identifier
 * @param name - Display name
 * @param description - Short description
 * @param locked - Whether a code is required to unlock
 * @param swatches - 4 hex colors for the preview circles
 */
interface ThemeOption {
  id: NonNullable<ColorTheme>;
  name: string;
  description: string;
  locked: boolean;
  swatches: [string, string, string, string];
}

/** All available themes displayed in the picker grid. */
const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep blue-teal",
    locked: false,
    swatches: ["#5ba4c8", "#2e88b0", "#e0eff5", "#143e52"],
  },
  {
    id: "forest",
    name: "Forest",
    description: "Green-emerald earth",
    locked: false,
    swatches: ["#4a9a4a", "#388038", "#e4f0e0", "#1a2e1a"],
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange-coral",
    locked: false,
    swatches: ["#e87040", "#d85828", "#fce8dc", "#2c1a10"],
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft purple-violet",
    locked: false,
    swatches: ["#8a60c0", "#7248a8", "#ebe0f5", "#1e1a2e"],
  },
  {
    id: "nord",
    name: "Nord",
    description: "Arctic blue-gray",
    locked: false,
    swatches: ["#5e81ac", "#81a1c1", "#d8dee9", "#2e3440"],
  },
  {
    id: "rosewood",
    name: "Rosewood",
    description: "Wine-burgundy",
    locked: false,
    swatches: ["#a03040", "#882838", "#f0e0e0", "#2a1418"],
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Navy with electric blue",
    locked: false,
    swatches: ["#3a6cf0", "#2a58d8", "#dce0ea", "#0a0e18"],
  },
  {
    id: "miffy",
    name: "Miffy",
    description: "Pastel pink palette",
    locked: true,
    swatches: ["#e8729a", "#f4a0bc", "#fce8ef", "#1a1118"],
  },
];

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
 * Renders the light/dark/auto theme toggle and a grid of theme cards.
 * Miffy is locked behind an access code; all other themes are freely selectable.
 */
export default function AppearanceSection() {
  const { colorTheme, setColorTheme } = useTheme();
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showUnlockFor, setShowUnlockFor] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load unlocked themes from localStorage on mount
  useEffect(() => {
    setUnlockedThemes(getUnlockedThemes());
  }, []);

  /**
   * Attempts to unlock a locked theme with the entered code.
   * On success: unlocks, activates, and persists.
   * On failure: triggers shake animation and error message.
   *
   * @param themeId - The theme ID to unlock
   */
  const handleUnlock = useCallback((themeId: string) => {
    if (themeId === "miffy" && codeInput.trim().toUpperCase() === MIFFY_ACCESS_CODE) {
      const next = [...unlockedThemes, themeId];
      setUnlockedThemes(next);
      saveUnlockedThemes(next);
      setColorTheme(themeId as ColorTheme);
      setCodeInput("");
      setError(false);
      setShowUnlockFor(null);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  }, [codeInput, unlockedThemes, setColorTheme]);

  /**
   * Handles clicking a theme card. Toggles active theme, or shows unlock input for locked themes.
   *
   * @param theme - The theme option that was clicked
   */
  const handleThemeClick = useCallback((theme: ThemeOption) => {
    if (theme.locked && !unlockedThemes.includes(theme.id)) {
      setShowUnlockFor(showUnlockFor === theme.id ? null : theme.id);
      setCodeInput("");
      setError(false);
      return;
    }
    const next: ColorTheme = colorTheme === theme.id ? null : theme.id;
    setColorTheme(next);
  }, [colorTheme, unlockedThemes, showUnlockFor, setColorTheme]);

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Appearance</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Choose your preferred appearance.
      </p>
      <ThemeToggle />

      {/* Theme Grid */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-secondary-foreground mb-3">
          Themes
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Default "caltodo" theme card */}
          <button
            type="button"
            onClick={() => setColorTheme(null)}
            aria-label={colorTheme === null ? "Default theme active" : "Switch to default theme"}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border p-3 transition-all duration-200 cursor-pointer text-left",
              "hover:border-input-border",
              colorTheme === null
                ? "border-ring bg-accent ring-1 ring-ring"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 bg-[#3B82F6]" />
              <span className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 bg-[#f3f4f6] dark:bg-[#404040]" />
              <span className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 bg-[#1f2937] dark:bg-[#f3f4f6]" />
              <span className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#111111]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium text-foreground">caltodo</span>
              <p className="text-[10px] text-muted-foreground leading-tight">Default theme</p>
            </div>
            {colorTheme === null && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ring flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
          </button>

          {THEME_OPTIONS.map((theme) => {
            const isActive = colorTheme === theme.id;
            const isLocked = theme.locked && !unlockedThemes.includes(theme.id);
            const showingUnlock = showUnlockFor === theme.id;

            return (
              <div key={theme.id} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleThemeClick(theme)}
                  aria-label={
                    isLocked
                      ? `Unlock ${theme.name} theme`
                      : isActive
                        ? `Deactivate ${theme.name} theme`
                        : `Activate ${theme.name} theme`
                  }
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-xl border p-3 transition-all duration-200 cursor-pointer text-left",
                    "hover:border-input-border",
                    isActive
                      ? "border-ring bg-accent ring-1 ring-ring"
                      : "border-border bg-card"
                  )}
                >
                  {/* Swatch row */}
                  <div className="flex items-center gap-1.5">
                    {theme.swatches.map((color, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Name + description */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">{theme.name}</span>
                      {isLocked && <Lock size={10} className="text-muted-foreground" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {isLocked ? "Enter code to unlock" : theme.description}
                    </p>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ring flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>

                {/* Unlock input (only for locked themes) */}
                {isLocked && showingUnlock && (
                  <div className={cn("flex items-center gap-1.5 px-1", shaking && "animate-shake")}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value);
                        if (error) setError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUnlock(theme.id);
                      }}
                      placeholder="Enter code"
                      autoFocus
                      className={cn(
                        "h-7 flex-1 min-w-0 rounded-md border px-2 text-xs bg-background text-foreground",
                        "placeholder:text-subtle-foreground",
                        "focus:outline-none focus:ring-1 focus:ring-ring",
                        error
                          ? "border-red-400 dark:border-red-500"
                          : "border-input-border"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => handleUnlock(theme.id)}
                      aria-label="Unlock theme"
                      className={cn(
                        "h-7 px-2.5 shrink-0 rounded-md flex items-center justify-center text-xs font-medium",
                        "bg-accent text-foreground hover:bg-muted",
                        "transition-colors duration-150"
                      )}
                    >
                      Unlock
                    </button>
                  </div>
                )}

                {/* Error message for unlock */}
                {isLocked && showingUnlock && error && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 pl-1">
                    Wrong code. Try again.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
