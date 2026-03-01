/**
 * Shared curated font options for board title and widget customization.
 * Single source of truth — imported by BoardTitle, WidgetSettingsModal, and FontPicker.
 *
 * Grouped: Sans → Rounded → Serif → (no Mono — removed ugly defaults).
 * Removed: Georgia, Palatino, Menlo, Helvetica Neue.
 * Added: Instrument Serif (Notion-like, loaded via next/font in layout.tsx).
 */

export interface FontOption {
  /** Display label shown in the picker. */
  label: string;
  /** CSS font-family value (empty string = system default). */
  value: string;
  /** Category for grouping in the FontPicker dropdown. */
  category: "sans" | "rounded" | "serif";
}

/** Curated font options grouped by category. */
export const FONT_OPTIONS: FontOption[] = [
  // Sans — clean, modern
  { label: "System Default", value: "var(--font-geist-sans), sans-serif", category: "sans" },
  { label: "Inter", value: "'Inter', sans-serif", category: "sans" },
  { label: "DM Sans", value: "'DM Sans', sans-serif", category: "sans" },
  { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif", category: "sans" },
  { label: "Outfit", value: "'Outfit', sans-serif", category: "sans" },
  { label: "Manrope", value: "'Manrope', sans-serif", category: "sans" },
  { label: "Urbanist", value: "'Urbanist', sans-serif", category: "sans" },
  { label: "Sora", value: "'Sora', sans-serif", category: "sans" },

  // Rounded — friendly, soft
  { label: "Nunito", value: "'Nunito', sans-serif", category: "rounded" },
  { label: "Quicksand", value: "'Quicksand', sans-serif", category: "rounded" },
  { label: "Varela Round", value: "'Varela Round', sans-serif", category: "rounded" },

  // Serif — editorial, Notion-like
  { label: "Instrument Serif", value: "var(--font-instrument-serif), serif", category: "serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif", category: "serif" },
  { label: "DM Serif Display", value: "'DM Serif Display', serif", category: "serif" },
  { label: "Source Serif 4", value: "'Source Serif 4', serif", category: "serif" },
];

/** The CSS value used for "System Default" (Geist Sans from next/font). */
export const SYSTEM_DEFAULT_FONT = "var(--font-geist-sans), sans-serif";

/** Category labels for section headers in the FontPicker. */
export const FONT_CATEGORY_LABELS: Record<FontOption["category"], string> = {
  sans: "Sans",
  rounded: "Rounded",
  serif: "Serif",
};
