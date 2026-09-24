"use client";

/**
 * Settings section for toggling visibility of sidebar nav items.
 * Hidden items are removed from both the desktop Sidebar and the
 * MobileTabBar. URLs remain accessible if typed directly.
 *
 * The last visible landing-capable item (Inbox or Calendar) cannot be
 * hidden: with both gone, mobile had no page to land on and the route
 * guards redirected in a loop.
 */

import { NAV_ITEMS } from "@/lib/constants";
import { useHiddenNavItems } from "@/hooks/useHiddenNavItems";
import { canHideNavItem } from "@/lib/landing-path";
import Badge from "@/components/ui/Badge";
import SectionHeading from "@/components/ui/SectionHeading";

export default function NavigationSection() {
  const { hidden, isHidden, toggle } = useHiddenNavItems();

  return (
    <section>
      <SectionHeading
        title="Navigation"
        description="Hide pages you don't use from the sidebar and mobile tab bar. You can still visit them by typing the URL directly."
      />

      <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const itemHidden = isHidden(item.href);
          // Only a visible item can be refused; showing is always allowed.
          const hideCheck = itemHidden ? { allowed: true } : canHideNavItem(item.href, hidden);
          const locked = !hideCheck.allowed;
          return (
            <label
              key={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${locked ? "cursor-not-allowed" : "hover:bg-accent/40 cursor-pointer"}`}
            >
              <Icon size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="flex-1 flex flex-col min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  {item.beta && <Badge variant="beta">Beta</Badge>}
                </span>
                {locked && (
                  <span className="text-xs text-muted-foreground mt-0.5">{hideCheck.reason}</span>
                )}
              </span>
              <span className="text-xs text-muted-foreground mr-2">
                {itemHidden ? "Hidden" : "Visible"}
              </span>
              <input
                type="checkbox"
                checked={!itemHidden}
                disabled={locked}
                onChange={() => {
                  if (locked) return;
                  toggle(item.href);
                }}
                className="w-4 h-4 accent-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`${itemHidden ? "Show" : "Hide"} ${item.label}`}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
