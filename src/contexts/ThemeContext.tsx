"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

/** localStorage key for persisting theme preference. */
const THEME_KEY = "caltodo_theme";

type ThemePreference = "light" | "dark";

interface ThemeContextValue {
  /** The user's preference: "light" or "dark". */
  preference: ThemePreference;
  /** The resolved theme actually applied (same as preference). */
  theme: ThemePreference;
  /** Set the theme preference explicitly. */
  setPreference: (pref: ThemePreference) => void;
  /** Toggle between light and dark. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Applies the theme class to the <html> element.
 * Adds or removes the "dark" class to enable Tailwind dark: variants.
 *
 * @param theme - The theme to apply ("light" or "dark")
 */
function applyTheme(theme: ThemePreference, animate = false): void {
  if (typeof document === "undefined") return;

  if (!animate) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return;
  }

  // Subtle fade: briefly lower page opacity, switch theme, restore
  document.documentElement.style.transition = "opacity 150ms ease";
  document.documentElement.style.opacity = "0.7";

  setTimeout(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.style.opacity = "1";
    setTimeout(() => {
      document.documentElement.style.transition = "";
    }, 150);
  }, 150);
}

/**
 * Reads the stored theme preference from localStorage.
 * Falls back to "light" if no valid preference is stored.
 *
 * @returns The stored preference, defaulting to "light"
 */
function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage unavailable
  }
  return "light";
}

/**
 * Theme provider that manages light/dark mode state.
 * Persists preference in localStorage and applies .dark class to <html>.
 * Defaults to light mode.
 *
 * @param children - App content
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("light");

  // On mount, read the stored preference from localStorage and apply it.
  useEffect(() => {
    const stored = getInitialPreference();
    setPreferenceState(stored);
    applyTheme(stored);
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    applyTheme(pref, true);
    try {
      localStorage.setItem(THEME_KEY, pref);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceState((prev) => {
      const next: ThemePreference = prev === "light" ? "dark" : "light";
      applyTheme(next, true);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, theme: preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the theme context.
 * Must be used within a ThemeProvider.
 *
 * @returns ThemeContextValue with current preference, resolved theme, setPreference, and toggleTheme
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
