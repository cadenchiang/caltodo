"use client";

import ThemeToggle from "@/components/layout/ThemeToggle";

/**
 * Appearance settings section.
 * Renders the light/dark/auto theme toggle.
 */
export default function AppearanceSection() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Appearance</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Choose your preferred appearance.
      </p>
      <ThemeToggle />
    </section>
  );
}
