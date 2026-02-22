"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Inbox, CalendarDays, Settings, Sun, CalendarRange } from "lucide-react";
import { useState, useEffect } from "react";

/** localStorage keys for GCal status. */
const GCAL_CACHE_KEY = "gcal_status";
const GCAL_BANNER_DISMISSED_KEY = "gcal_banner_dismissed";

/**
 * Fixed bottom tab bar for mobile navigation (visible below md breakpoint).
 * Contains Inbox, Calendar, and Settings tabs with active state highlighting.
 * Shows a red badge on Calendar when GCal is not connected.
 * Includes safe-area padding for iPhone home indicator.
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  const [showCalBadge, setShowCalBadge] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<string>(() => {
    try {
      return localStorage.getItem("inbox-filter") || "all";
    } catch {
      return "all";
    }
  });

  // Listen for filter changes dispatched by InboxPage
  useEffect(() => {
    function handleFilterChange(e: Event) {
      setInboxFilter((e as CustomEvent).detail as string);
    }
    window.addEventListener("inbox-filter-change", handleFilterChange);
    return () =>
      window.removeEventListener("inbox-filter-change", handleFilterChange);
  }, []);

  // Check if GCal is connected — show badge on Calendar tab if not
  useEffect(() => {
    try {
      if (localStorage.getItem(GCAL_BANNER_DISMISSED_KEY) === "true") return;
      const cached = localStorage.getItem(GCAL_CACHE_KEY);
      if (cached && JSON.parse(cached).connected === true) return;
    } catch {
      /* ignore */
    }

    fetch("/api/credentials")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const isConnected = !!data.google_calendar_id;
        setShowCalBadge(!isConnected);
        // Write cache so other components stay in sync
        try {
          localStorage.setItem(GCAL_CACHE_KEY, JSON.stringify({
            connected: isConnected,
            calendarId: data.google_calendar_id ?? null,
            email: data.google_email ?? null,
            photoUrl: data.google_photo_url ?? null,
          }));
        } catch { /* ignore */ }
      })
      .catch(() => {});
  }, []);

  // Listen for gcal_status or banner dismissal changes from other components
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === GCAL_BANNER_DISMISSED_KEY && e.newValue === "true") {
        setShowCalBadge(false);
      }
      if (e.key === GCAL_CACHE_KEY && e.newValue) {
        try {
          if (JSON.parse(e.newValue).connected === true) {
            setShowCalBadge(false);
          }
        } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Hide navigation during onboarding and settings
  if (pathname.startsWith("/app/onboarding") || pathname.startsWith("/app/settings")) return null;

  /** Returns the appropriate inbox icon based on the active filter. */
  function getInboxIcon() {
    switch (inboxFilter) {
      case "today":
        return Sun;
      case "7days":
        return CalendarRange;
      default:
        return Inbox;
    }
  }

  /** Returns the inbox label based on the active filter. */
  function getInboxLabel() {
    switch (inboxFilter) {
      case "today":
        return "Today";
      case "7days":
        return "7 Days";
      default:
        return "Inbox";
    }
  }

  const InboxIcon = getInboxIcon();

  const tabs = [
    {
      label: getInboxLabel(),
      href: "/app/inbox",
      icon: InboxIcon,
      badge: false,
    },
    {
      label: "Calendar",
      href: "/app/calendar",
      icon: CalendarDays,
      badge: showCalBadge,
    },
    {
      label: "Settings",
      href: "/app/settings",
      icon: Settings,
      badge: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.08)] dark:shadow-black/30">
      <div
        className="flex items-center justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] flex-1 py-2 transition-colors relative ${
                isActive
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
