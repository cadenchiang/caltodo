"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

/** localStorage key for persisting theme preference. */
const THEME_KEY = "caltodo_theme";

/** User-facing preference: light, dark, or auto (follow OS). */
export type ThemePreference = "light" | "dark" | "auto";

/** The actual applied theme — always light or dark. */
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  /** The user's preference: "light", "dark", or "auto". */
  preference: ThemePreference;
  /** The resolved theme actually applied to the page ("light" or "dark"). */
  resolvedTheme: ResolvedTheme;
  /** Set the theme preference explicitly. */
  setPreference: (pref: ThemePreference) => void;
  /** Toggle between light → dark → auto → light. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Reads the OS color-scheme preference via matchMedia.
 *
 * @returns "dark" if OS prefers dark mode, "light" otherwise
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Resolves a ThemePreference to an actual applied theme.
 * "auto" delegates to the OS preference.
 *
 * @param pref - The user's preference
 * @returns The resolved theme ("light" or "dark")
 */
export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "auto") return getSystemTheme();
  return pref;
}

/**
 * Applies the theme class to the <html> element.
 * Adds or removes the "dark" class to enable Tailwind dark: variants.
 *
 * @param theme - The resolved theme to apply ("light" or "dark")
 * @param animate - Whether to add a subtle opacity transition
 */
function applyTheme(theme: ResolvedTheme, animate = false): void {
  if (typeof document === "undefined") return;

  // Sync favicon with theme
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (link) {
    link.href = theme === "dark" ? "/icon-dark.png" : "/icon-light.png";
  }

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

/** Cycle order for toggleTheme: light → dark → auto → light. */
const CYCLE: Record<ThemePreference, ThemePreference> = {
  light: "dark",
  dark: "auto",
  auto: "light",
};

/**
 * Theme provider that manages light/dark/auto mode state.
 * Persists preference in localStorage and applies .dark class to <html>.
 * When set to "auto", listens for OS theme changes.
 * Defaults to "auto" for new users.
 *
 * @param children - App content
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // On mount, read stored preference and apply the resolved theme.
  useEffect(() => {
    const stored = getInitialPreference();
    const resolved = resolveTheme(stored);
    setPreferenceState(stored);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for OS theme changes when preference is "auto".
  useEffect(() => {
    if (preference !== "auto") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e: MediaQueryListEvent) => {
      const next: ResolvedTheme = e.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyTheme(next, true);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    trackEvent("theme_changed", { theme: pref });
    const resolved = resolveTheme(pref);
    setPreferenceState(pref);
    setResolvedTheme(resolved);
    applyTheme(resolved, true);
    try {
      localStorage.setItem(THEME_KEY, pref);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceState((prev) => {
      const next = CYCLE[prev];
      trackEvent("theme_changed", { theme: next });
      const resolved = resolveTheme(next);
      setResolvedTheme(resolved);
      applyTheme(resolved, true);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the theme context.
 * Must be used within a ThemeProvider.
 *
 * @returns ThemeContextValue with current preference, resolvedTheme, setPreference, and toggleTheme
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
