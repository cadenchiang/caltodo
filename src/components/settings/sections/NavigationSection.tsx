"use client";

/**
 * Settings section for toggling visibility of sidebar nav items.
 * Hidden items are removed from both the desktop Sidebar and the
 * MobileTabBar. URLs remain accessible if typed directly.
 */

import { useEffect, useState } from "react";
import { NAV_ITEMS, isNotesAllowed } from "@/lib/constants";
import { useHiddenNavItems } from "@/hooks/useHiddenNavItems";

/**
 * Reads the cached user email from the profile cache the Sidebar writes
 * on mount. Same pattern as AccountSection / ProfileSection so we don't
 * have to refetch the auth user just to gate one nav row.
 */
function readCachedEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("caltodo_user_profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: string | null };
    return parsed.email ?? null;
  } catch {
    return null;
  }
}

export default function NavigationSection() {
  const { isHidden, toggle } = useHiddenNavItems();
  const [email, setEmail] = useState<string | null>(null);

  // Hydrate the email after mount so SSR doesn't render the Notes row
  // for everyone and then flicker it away. The cache is populated by
  // the Sidebar on first paint, so reading it here is reliable.
  useEffect(() => {
    setEmail(readCachedEmail());
  }, []);

  const notesAllowed = isNotesAllowed(email);
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.href !== "/app/notes" || notesAllowed,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Navigation</h1>
        <p className="text-sm text-muted-foreground">
          Hide pages you don&apos;t use from the sidebar and mobile tab bar. You can still
          visit them by typing the URL directly.
        </p>
      </div>

      <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const hidden = isHidden(item.href);
          return (
            <label
              key={item.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors cursor-pointer"
            >
              <Icon size={16} className="text-foreground/70 shrink-0" />
              <span className="flex-1 text-sm font-medium text-foreground">
                {item.label}
              </span>
              <span className="text-xs text-muted-foreground mr-2">
                {hidden ? "Hidden" : "Visible"}
              </span>
              <input
                type="checkbox"
                checked={!hidden}
                onChange={() => toggle(item.href)}
                className="w-4 h-4 accent-foreground cursor-pointer"
                aria-label={`${hidden ? "Show" : "Hide"} ${item.label}`}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
