"use client";

/**
 * Settings section for toggling visibility of sidebar nav items.
 * Hidden items are removed from both the desktop Sidebar and the
 * MobileTabBar. URLs remain accessible if typed directly.
 */

import { NAV_ITEMS } from "@/lib/constants";
import { useHiddenNavItems } from "@/hooks/useHiddenNavItems";

export default function NavigationSection() {
  const { isHidden, toggle } = useHiddenNavItems();

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
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hidden = isHidden(item.href);
          return (
            <label
              key={item.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors cursor-pointer"
            >
              <Icon size={16} className="text-foreground/70 shrink-0" />
              <span className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                {item.beta && (
                  <span className="text-[9px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 rounded-full leading-none shrink-0">
                    Beta
                  </span>
                )}
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
