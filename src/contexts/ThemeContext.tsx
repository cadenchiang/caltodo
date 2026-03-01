"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { isDarkBySun } from "@/lib/solar";
import { getCachedCoords, getUserCoords } from "@/lib/geolocation";

/** localStorage key for persisting theme preference. */
const THEME_KEY = "caltodo_theme";

/** localStorage key for persisting the active color theme (e.g. "miffy"). */
const COLOR_THEME_KEY = "caltodo_color_theme";

/** User-facing preference: light, dark, or auto (follow sunset/sunrise). */
export type ThemePreference = "light" | "dark" | "auto";

/** The actual applied theme — always light or dark. */
export type ResolvedTheme = "light" | "dark";

/** Available color theme IDs. null means the default (no color theme). */
export type ColorTheme = "miffy" | "ocean" | "forest" | "sunset" | "lavender" | "nord" | "rosewood" | "midnight" | null;

interface ThemeContextValue {
  /** The user's preference: "light", "dark", or "auto". */
  preference: ThemePreference;
  /** The resolved theme actually applied to the page ("light" or "dark"). */
  resolvedTheme: ResolvedTheme;
  /** Set the theme preference explicitly. */
  setPreference: (pref: ThemePreference) => void;
  /** Toggle between light → dark → auto → light. */
  toggleTheme: () => void;
  /** The active color theme (e.g. "miffy"), or null for default. */
  colorTheme: ColorTheme;
  /** Activate or deactivate a color theme. Pass null to clear. */
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Determines whether the current time is dark based on sunset/sunrise
 * using cached (or default) coordinates. Synchronous for initial render.
 *
 * @returns "dark" if before sunrise or after sunset, "light" otherwise
 */
function getSolarTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  const { lat, lng } = getCachedCoords();
  return isDarkBySun(lat, lng) ? "dark" : "light";
}

/**
 * Resolves a ThemePreference to an actual applied theme.
 * "auto" delegates to sunset/sunrise calculation.
 *
 * @param pref - The user's preference
 * @returns The resolved theme ("light" or "dark")
 */
export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "auto") return getSolarTheme();
  return pref;
}

/** All known color theme class names for easy removal. */
const COLOR_THEME_CLASSES = [
  "theme-miffy",
  "theme-ocean",
  "theme-forest",
  "theme-sunset",
  "theme-lavender",
  "theme-nord",
  "theme-rosewood",
  "theme-midnight",
] as const;

/**
 * Syncs the browser tab favicon based on the current resolved theme and color theme.
 * Miffy theme uses dedicated Miffy favicons; default uses standard bear icon.
 */
function syncFavicon(): void {
  if (typeof document === "undefined") return;
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (!link) return;
  const isDark = document.documentElement.classList.contains("dark");
  const isMiffy = document.documentElement.classList.contains("theme-miffy");
  if (isMiffy) {
    link.href = isDark ? "/favicon-miffy-dark.png" : "/favicon-miffy.png";
  } else {
    link.href = isDark ? "/icon-dark.png" : "/icon-light.png";
  }
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

  if (!animate) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    syncFavicon();
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
    syncFavicon();
    document.documentElement.style.opacity = "1";
    setTimeout(() => {
      document.documentElement.style.transition = "";
    }, 150);
  }, 150);
}

/**
 * Applies or removes the color theme class on <html>.
 * Removes all known color theme classes first, then adds the active one.
 *
 * @param colorTheme - The color theme ID to apply, or null to clear
 */
function applyColorTheme(colorTheme: ColorTheme): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  COLOR_THEME_CLASSES.forEach((cls) => el.classList.remove(cls));
  if (colorTheme) {
    el.classList.add(`theme-${colorTheme}`);
  }
  syncFavicon();
}

/** Set of all valid color theme IDs for validation. */
const VALID_COLOR_THEMES = new Set<string>([
  "miffy", "ocean", "forest", "sunset", "lavender", "nord", "rosewood", "midnight",
]);

/**
 * Reads the stored color theme from localStorage.
 * Returns null if nothing valid is stored.
 *
 * @returns The stored color theme, or null
 */
function getInitialColorTheme(): ColorTheme {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(COLOR_THEME_KEY);
    if (stored && VALID_COLOR_THEMES.has(stored)) return stored as ColorTheme;
  } catch {
    // localStorage unavailable
  }
  return null;
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
  return "light";
}

/** Cycle order for toggleTheme: light → dark → auto → light. */
const CYCLE: Record<ThemePreference, ThemePreference> = {
  light: "dark",
  dark: "auto",
  auto: "light",
};

/** Interval in ms to re-check solar position when in "auto" mode. */
const SOLAR_CHECK_INTERVAL = 60_000;

/**
 * Theme provider that manages light/dark/auto mode state.
 * Persists preference in localStorage and applies .dark class to <html>.
 * When set to "auto", checks sunset/sunrise every 60 seconds.
 * Defaults to "auto" for new users.
 *
 * @param children - App content
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(null);
  const preferenceRef = useRef<ThemePreference>("auto");

  // On mount, read stored preference and apply the resolved theme + color theme.
  useEffect(() => {
    const stored = getInitialPreference();
    const resolved = resolveTheme(stored);
    setPreferenceState(stored);
    preferenceRef.current = stored;
    setResolvedTheme(resolved);
    applyTheme(resolved);

    const storedColor = getInitialColorTheme();
    setColorThemeState(storedColor);
    applyColorTheme(storedColor);
  }, []);

  // When preference is "auto": fetch fresh coords, poll solar position every 60s.
  useEffect(() => {
    if (preference !== "auto") return;

    // Fetch fresh geolocation (async, updates cache for next check)
    getUserCoords().then(() => {
      // Guard: preference may have changed while coords were loading
      if (preferenceRef.current !== "auto") return;
      const next = resolveTheme("auto");
      setResolvedTheme(next);
      applyTheme(next);
    });

    const interval = setInterval(() => {
      // Only update if still in auto mode
      if (preferenceRef.current !== "auto") return;
      const next = resolveTheme("auto");
      setResolvedTheme((prev) => {
        if (prev !== next) {
          applyTheme(next, true);
        }
        return next;
      });
    }, SOLAR_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    trackEvent("theme_changed", { theme: pref });
    const resolved = resolveTheme(pref);
    setPreferenceState(pref);
    preferenceRef.current = pref;
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
      preferenceRef.current = next;
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

  /**
   * Activate or deactivate a color theme.
   * Persists to localStorage and applies the class on <html>.
   *
   * @param theme - Color theme ID to activate, or null to deactivate
   */
  const setColorTheme = useCallback((theme: ColorTheme) => {
    trackEvent("color_theme_changed", { colorTheme: theme ?? "default" });
    setColorThemeState(theme);
    applyColorTheme(theme);
    try {
      if (theme) {
        localStorage.setItem(COLOR_THEME_KEY, theme);
      } else {
        localStorage.removeItem(COLOR_THEME_KEY);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference, toggleTheme, colorTheme, setColorTheme }}>
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
