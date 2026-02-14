"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ICON_MAP = { light: Sun, dark: Moon, auto: Monitor } as const;
const LABEL_MAP = { light: "Light mode", dark: "Dark mode", auto: "System mode" } as const;

/**
 * Theme toggle button for the sidebar.
 * Cycles through light → dark → auto with matching icon and label.
 */
export default function ThemeToggle() {
  const { preference, toggleTheme } = useTheme();
  const Icon = ICON_MAP[preference];

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      aria-label={`Current: ${LABEL_MAP[preference]}. Click to switch.`}
    >
      <Icon size={16} />
      <span>{LABEL_MAP[preference]}</span>
    </button>
  );
}
