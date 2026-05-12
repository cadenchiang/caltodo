/**
 * Hook returning theme-aware colors for recharts components.
 * Reads the current theme from the document and returns appropriate
 * color values for chart elements.
 */

"use client";

import { useState, useEffect } from "react";

interface ChartColors {
  /** Primary chart color (area fills, main bars) */
  primary: string;
  /** Secondary chart color (secondary data series) */
  secondary: string;
  /** Tertiary chart color (third data series) */
  tertiary: string;
  /** Quaternary chart color (fourth data series) */
  quaternary: string;
  /** Grid line color */
  grid: string;
  /** Axis text color */
  text: string;
  /** Tooltip background color */
  tooltipBg: string;
  /** Tooltip border color */
  tooltipBorder: string;
}

/**
 * Returns a set of colors that adapt to the current light/dark theme.
 * Listens for theme changes via a MutationObserver on the <html> class.
 *
 * @returns ChartColors object with hex values for chart elements
 */
export function useChartColors(): ChartColors {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (isDark) {
    return {
      primary: "#60a5fa", // blue-400
      secondary: "#34d399", // emerald-400
      tertiary: "#fbbf24", // amber-400
      quaternary: "#a78bfa", // violet-400
      grid: "#374151", // gray-700
      text: "#9ca3af", // gray-400
      tooltipBg: "#1f2937", // gray-800
      tooltipBorder: "#374151", // gray-700
    };
  }

  return {
    primary: "#0e89d6", // blue-500
    secondary: "#10b981", // emerald-500
    tertiary: "#f59e0b", // amber-500
    quaternary: "#8b5cf6", // violet-500
    grid: "#f3f4f6", // gray-100
    text: "#6b7280", // gray-500
    tooltipBg: "#ffffff",
    tooltipBorder: "#e5e7eb", // gray-200
  };
}
