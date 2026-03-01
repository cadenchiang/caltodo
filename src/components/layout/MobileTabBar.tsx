"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Inbox, CalendarDays, Settings, Sun, CalendarRange, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useCalChatUnread } from "@/hooks/useCalChatUnread";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

/**
 * Fixed bottom tab bar for mobile navigation (visible below md breakpoint).
 * Contains Inbox, Calendar, and Settings tabs with active state highlighting.
 * Shows a red badge on Calendar when GCal is not connected.
 * Includes safe-area padding for iPhone home indicator.
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  const [inboxFilter, setInboxFilter] = useState<string>("all");
  const calChatUnreadCount = useCalChatUnread();
  useOnboardingStatus();

  // Hydrate inbox filter from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inbox-filter");
      if (saved) setInboxFilter(saved);
    } catch { /* ignore */ }
  }, []);

  // Listen for filter changes dispatched by InboxPage
  useEffect(() => {
    function handleFilterChange(e: Event) {
      setInboxFilter((e as CustomEvent).detail as string);
    }
    window.addEventListener("inbox-filter-change", handleFilterChange);
    return () =>
      window.removeEventListener("inbox-filter-change", handleFilterChange);
  }, []);

  // Hide navigation during onboarding, settings, and inside a specific chat
  if (pathname.startsWith("/app/onboarding") || pathname.startsWith("/app/settings")) return null;
  if (pathname.match(/^\/app\/discussions\/[^/]+$/)) return null;

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

  const tabs: Array<{
    label: string;
    href: string;
    icon: typeof Inbox;
    badge: boolean;
    badgeCount?: number;
  }> = [
    {
      label: "Home",
      href: "/app/home",
      icon: Home,
      badge: false,
    },
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
      badge: false,
    },
    {
      label: "CalChat",
      href: "/app/discussions",
      icon: MessageSquare,
      badge: false,
      badgeCount: calChatUnreadCount,
    },
    {
      label: "Settings",
      href: "/app/settings",
      icon: Settings,
      badge: false,
    },
  ];

  return (
    <>
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.08)] dark:shadow-black/30">
      <div
        className="flex items-center justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          const isChat = tab.href === "/app/discussions";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={undefined}
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
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                    {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                  </span>
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
    </>
  );
}
