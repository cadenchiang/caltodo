"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { isDarkBySun } from "@/lib/solar";
import { getCachedCoords } from "@/lib/geolocation";

/** localStorage key for persisting theme preference. */
const THEME_KEY = "caltodo_theme";

/** localStorage key for persisting the active color theme (e.g. "miffy"). */
const COLOR_THEME_KEY = "caltodo_color_theme";

/**
 * auth.user_metadata keys mirroring the two localStorage keys above.
 *
 * localStorage alone is not durable on mobile: iOS Safari caps script-writable
 * storage at 7 days of no interaction with the site, so a phone that goes a
 * week between visits comes back with the theme reset to the default — which
 * reads as "themes don't work on mobile". Mirroring into user_metadata (the
 * same trick useHiddenNavItems uses) makes the choice survive eviction and
 * follow the user across devices. localStorage stays the fast path so the
 * pre-paint script in layout.tsx still has something to read.
 */
const META_THEME_KEY = "theme_preference";
const META_COLOR_THEME_KEY = "color_theme";

/**
 * True when a Supabase auth cookie is present. Used to skip the remote sync
 * (and the supabase-js dynamic import behind it) for anonymous visitors on the
 * public landing page, which ThemeProvider also wraps.
 */
function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return /(^|;\s*)sb-[^=]*auth-token/.test(document.cookie);
}

/** User-facing preference: light, dark, or auto (follow sunset/sunrise). */
export type ThemePreference = "light" | "dark" | "auto";

/** The actual applied theme — always light or dark. */
export type ResolvedTheme = "light" | "dark";

/** Available color theme IDs. null means the default (no color theme). */
export type ColorTheme = "miffy" | "forest" | "sunset" | "lavender" | "nord" | "rosewood" | "midnight" | "matcha" | "dracula" | "cyber" | "sandstone" | "tokyo-night" | null;

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
  "theme-forest",
  "theme-sunset",
  "theme-lavender",
  "theme-nord",
  "theme-rosewood",
  "theme-midnight",
  "theme-matcha",
  "theme-dracula",
  "theme-cyber",
  "theme-sandstone",
  "theme-tokyo-night",
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
  "miffy", "forest", "sunset", "lavender", "nord", "rosewood", "midnight",
  "matcha", "dracula", "cyber", "sandstone", "tokyo-night",
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
 * Falls back to "light" if no valid preference is stored (matching the
 * pre-paint inline script in layout.tsx, so there's no first-paint flip).
 *
 * @returns The stored preference, defaulting to "light"
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
  const colorThemeRef = useRef<ColorTheme>(null);

  /**
   * Applies a preference to state + DOM + localStorage. No analytics and no
   * remote write, so it is safe to call when reconciling FROM the server.
   */
  const applyPreferenceLocal = useCallback((pref: ThemePreference, animate = false) => {
    const resolved = resolveTheme(pref);
    setPreferenceState(pref);
    preferenceRef.current = pref;
    setResolvedTheme(resolved);
    applyTheme(resolved, animate);
    try {
      localStorage.setItem(THEME_KEY, pref);
    } catch {
      // localStorage unavailable
    }
  }, []);

  /** Color-theme counterpart of applyPreferenceLocal. */
  const applyColorThemeLocal = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    colorThemeRef.current = theme;
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

  /**
   * Fire-and-forget mirror of a theme choice into auth.user_metadata.
   * supabase-js is imported lazily so the public landing page, which also
   * mounts this provider, doesn't pay for the client bundle.
   */
  const mirrorToRemote = useCallback((data: Record<string, unknown>) => {
    if (!hasAuthCookie()) return;
    import("@/lib/supabase/client")
      .then(({ createClient }) => createClient().auth.updateUser({ data }))
      .catch(() => {
        // Non-critical: localStorage already reflects the change.
      });
  }, []);

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
    colorThemeRef.current = storedColor;
    applyColorTheme(storedColor);
  }, []);

  // Reconcile with the server copy once, after the local read above. Remote
  // wins when the two disagree: the common case is a device whose
  // localStorage was evicted, so the stale value is the local one.
  useEffect(() => {
    if (!hasAuthCookie()) return;
    let cancelled = false;

    (async () => {
      try {
        const { getCurrentUser } = await import("@/lib/supabase/current-user");
        const user = await getCurrentUser();
        if (cancelled || !user) return;
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

        const remotePref = meta[META_THEME_KEY];
        if (
          (remotePref === "light" || remotePref === "dark" || remotePref === "auto") &&
          remotePref !== preferenceRef.current
        ) {
          applyPreferenceLocal(remotePref);
        }

        // A cleared color theme is stored as null, which is meaningful —
        // only skip when the key is absent entirely (never synced).
        if (META_COLOR_THEME_KEY in meta) {
          const raw = meta[META_COLOR_THEME_KEY];
          const remoteColor: ColorTheme =
            typeof raw === "string" && VALID_COLOR_THEMES.has(raw) ? (raw as ColorTheme) : null;
          if (remoteColor !== colorThemeRef.current) {
            applyColorThemeLocal(remoteColor);
          }
        }
      } catch {
        // Signed out mid-flight or offline: the local cache stands.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyPreferenceLocal, applyColorThemeLocal]);

  // When preference is "auto": resolve from cached/default coords, poll solar
  // position every 60s.
  useEffect(() => {
    if (preference !== "auto") return;

    // Resolve immediately from cached (or default) coords. We deliberately do
    // NOT call getUserCoords() here — that would pop the browser's location
    // permission prompt on every page, including the public landing page.
    // Location is only ever requested by the weather widget; if the user
    // grants it there, resolveTheme picks up the cached coords automatically.
    const initial = resolveTheme("auto");
    setResolvedTheme(initial);
    applyTheme(initial);

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
    applyPreferenceLocal(pref, true);
    mirrorToRemote({ [META_THEME_KEY]: pref });
  }, [applyPreferenceLocal, mirrorToRemote]);

  const toggleTheme = useCallback(() => {
    const next = CYCLE[preferenceRef.current];
    trackEvent("theme_changed", { theme: next });
    applyPreferenceLocal(next, true);
    mirrorToRemote({ [META_THEME_KEY]: next });
  }, [applyPreferenceLocal, mirrorToRemote]);

  /**
   * Activate or deactivate a color theme.
   * Persists to localStorage and applies the class on <html>.
   *
   * @param theme - Color theme ID to activate, or null to deactivate
   */
  const setColorTheme = useCallback((theme: ColorTheme) => {
    trackEvent("color_theme_changed", { colorTheme: theme ?? "default" });
    applyColorThemeLocal(theme);
    mirrorToRemote({ [META_COLOR_THEME_KEY]: theme });
  }, [applyColorThemeLocal, mirrorToRemote]);

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
