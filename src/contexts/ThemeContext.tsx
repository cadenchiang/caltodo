"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

/** localStorage key for persisting theme preference. */
const THEME_KEY = "caltodo_theme";

type ThemePreference = "light" | "dark" | "auto";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  /** The user's preference: "light", "dark", or "auto". */
  preference: ThemePreference;
  /** The resolved theme actually applied: "light" or "dark". */
  theme: ResolvedTheme;
  /** Set the theme preference explicitly. */
  setPreference: (pref: ThemePreference) => void;
  /** Legacy toggle: cycles light → dark → auto → light. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Applies the resolved theme class to the <html> element.
 * Adds or removes the "dark" class to enable Tailwind dark: variants.
 *
 * @param theme - The resolved theme to apply ("light" or "dark")
 */
function applyTheme(theme: ResolvedTheme, animate = false): void {
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
 * Returns the system's preferred color scheme.
 *
 * @returns "dark" if the system prefers dark mode, "light" otherwise
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Resolves a theme preference into an actual theme.
 *
 * @param pref - The user's preference ("light", "dark", or "auto")
 * @returns The resolved theme ("light" or "dark")
 */
function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "auto") return getSystemTheme();
  return pref;
}

/**
 * Reads the stored theme preference from localStorage.
 * Falls back to "auto" if no valid preference is stored.
 *
 * @returns The stored preference, defaulting to "auto"
 */
function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "auto";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light" || stored === "auto") return stored;
  } catch {
    // localStorage unavailable
  }
  return "auto";
}

/**
 * Theme provider that manages light/dark/auto mode state.
 * Persists preference in localStorage and applies .dark class to <html>.
 * In "auto" mode, listens for system preference changes and updates accordingly.
 *
 * @param children - App content
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start with "auto" for SSR/hydration consistency.
  // The stored preference is loaded in the mount effect below.
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // On mount, read the stored preference from localStorage and apply it.
  useEffect(() => {
    const stored = getInitialPreference();
    setPreferenceState(stored);
    const theme = resolveTheme(stored);
    setResolved(theme);
    applyTheme(theme);
  }, []);

  // Listen for system preference changes when in "auto" mode
  useEffect(() => {
    if (preference !== "auto") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const next = getSystemTheme();
      setResolved(next);
      applyTheme(next, true);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    const next = resolveTheme(pref);
    setResolved(next);
    applyTheme(next, true);
    try {
      localStorage.setItem(THEME_KEY, pref);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceState((prev) => {
      const next: ThemePreference = prev === "light" ? "dark" : prev === "dark" ? "auto" : "light";
      const nextResolved = resolveTheme(next);
      setResolved(nextResolved);
      applyTheme(nextResolved, true);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, theme: resolved, setPreference, toggleTheme }}>
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
