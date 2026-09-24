/**
 * Hook returning theme-aware colors for recharts components.
 *
 * Recharts takes literal color strings, so the theme's CSS variables are
 * read from the document at runtime and re-read whenever the html class
 * list changes (dark mode, color theme). Every value has a fallback for
 * environments with no computed styles (SSR, tests).
 */

"use client";

import { useState, useEffect } from "react";

export interface ChartColors {
  /** Primary chart color (area fills, main bars): the theme accent. */
  primary: string;
  /** Secondary series: the success token. */
  secondary: string;
  /** Tertiary series: the warning token. */
  tertiary: string;
  /** Quaternary series: violet, which has no token. */
  quaternary: string;
  /** Grid line color: the border token. */
  grid: string;
  /** Axis text color: the muted-foreground token. */
  text: string;
  /** Tooltip background: the popover token. */
  tooltipBg: string;
  /** Tooltip border: the border token. */
  tooltipBorder: string;
}

/** CSS variable each color reads, with the fallback used when it is unset. */
export const CHART_COLOR_VARS: Record<keyof ChartColors, { variable: string; light: string; dark: string }> = {
  primary: { variable: "--color-blue-500", light: "#0e89d6", dark: "#60a5fa" },
  secondary: { variable: "--success", light: "#10b981", dark: "#34d399" },
  tertiary: { variable: "--warning", light: "#f59e0b", dark: "#fbbf24" },
  quaternary: { variable: "--chart-quaternary", light: "#8b5cf6", dark: "#a78bfa" },
  grid: { variable: "--border", light: "#f3f4f6", dark: "#404040" },
  text: { variable: "--muted-foreground", light: "#6b7280", dark: "#9ca3af" },
  tooltipBg: { variable: "--popover", light: "#ffffff", dark: "#262626" },
  tooltipBorder: { variable: "--border", light: "#e5e7eb", dark: "#404040" },
};

/**
 * Resolves the chart colors from a set of computed CSS variables.
 *
 * @param read - Returns the trimmed value of a CSS variable, or "" when unset
 * @param isDark - Picks the dark fallback when a variable is unset
 * @returns Every chart color, from the theme where it defines one
 */
export function resolveChartColors(read: (variable: string) => string, isDark: boolean): ChartColors {
  const out = {} as ChartColors;
  for (const key of Object.keys(CHART_COLOR_VARS) as Array<keyof ChartColors>) {
    const { variable, light, dark } = CHART_COLOR_VARS[key];
    out[key] = read(variable) || (isDark ? dark : light);
  }
  return out;
}

/**
 * Returns chart colors that follow the active theme.
 * Listens for theme changes via a MutationObserver on the html class.
 *
 * @returns ChartColors resolved from the document's CSS variables
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(() => resolveChartColors(() => "", false));

  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      setColors(resolveChartColors((v) => styles.getPropertyValue(v).trim(), root.classList.contains("dark")));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}
