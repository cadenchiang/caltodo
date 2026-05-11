"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Lock } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import type { ColorTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useEntitlement } from "@/hooks/useEntitlement";
import UpgradeModal from "@/components/ui/UpgradeModal";

/**
 * Theme option metadata for rendering in the picker grid.
 *
 * @param id - Color theme identifier
 * @param name - Display name
 * @param description - Short description
 * @param locked - Whether the theme is Pro-gated
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
    id: "matcha",
    name: "Matcha",
    description: "Warm sage green",
    locked: false,
    swatches: ["#7C9A6E", "#D4C5A0", "#F7F5F0", "#1A2118"],
  },
  {
    id: "dracula",
    name: "Dracula",
    description: "Bold gothic purple",
    locked: false,
    swatches: ["#BD93F9", "#FF79C6", "#F8F8F2", "#282A36"],
  },
  {
    id: "cyber",
    name: "Cyber",
    description: "Neon cyberpunk glow",
    locked: false,
    swatches: ["#0ABDC6", "#EA00D9", "#E8F4F5", "#0B0C10"],
  },
  {
    id: "sandstone",
    name: "Sandstone",
    description: "Warm elevated neutrals",
    locked: false,
    swatches: ["#C4956A", "#A68B6B", "#FAF6F1", "#1F1A15"],
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    description: "Deep city blues",
    locked: false,
    swatches: ["#7AA2F7", "#BB9AF7", "#D5D6DB", "#1A1B26"],
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
 * Appearance settings section.
 * Renders the light/dark/auto theme toggle and a grid of theme cards.
 * Miffy is the only Pro-gated theme; everything else is free.
 */
export default function AppearanceSection() {
  const { colorTheme, setColorTheme } = useTheme();
  const { isPro } = useEntitlement();
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Miffy is the only Pro-gated theme. If a free user somehow has it active
  // (e.g. trial expired), reset to default. Other themes apply freely.
  useEffect(() => {
    if (!isPro && colorTheme === "miffy") {
      setColorTheme(null);
    }
  }, [isPro, colorTheme, setColorTheme]);

  /**
   * Handles clicking a theme card. Toggles active theme, or shows the upgrade
   * modal when a free user clicks the Miffy theme (the only Pro-gated theme).
   *
   * @param theme - The theme option that was clicked
   */
  const handleThemeClick = useCallback((theme: ThemeOption) => {
    if (theme.locked && !isPro) {
      setShowUpgrade(true);
      return;
    }
    const next: ColorTheme = colorTheme === theme.id ? null : theme.id;
    setColorTheme(next);
  }, [colorTheme, setColorTheme, isPro]);

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
            // Only Miffy is Pro-gated. Other themes are free for everyone.
            // Pro users who haven't entered the code still see the lock UI for
            // Miffy (the code is a separate unlock layer on top of Pro).
            const gated = theme.locked && !isPro;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeClick(theme)}
                aria-label={
                  gated
                    ? `${theme.name} theme — Pro required`
                    : isActive
                      ? `Deactivate ${theme.name} theme`
                      : `Activate ${theme.name} theme`
                }
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-xl border p-3 transition-all duration-200 cursor-pointer text-left",
                  "hover:border-input-border",
                  isActive
                    ? "border-ring bg-accent ring-1 ring-ring"
                    : "border-border bg-card",
                )}
              >
                <div className={cn("flex items-center gap-1.5", gated && "opacity-60")}>
                  {theme.swatches.map((color, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className={cn("min-w-0", gated && "opacity-70")}>
                  <span className="text-xs font-medium text-foreground">{theme.name}</span>
                  <p className="text-[10px] text-muted-foreground leading-tight">{theme.description}</p>
                </div>
                {isActive && !gated && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ring flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                {gated && (
                  <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0071E3] text-white text-[9px] font-semibold tracking-wide">
                    <Lock size={9} strokeWidth={3} />
                    PRO
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="themes"
      />
    </section>
  );
}
