"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Inbox, CalendarDays, MessageCircle, Settings, Sun, CalendarRange, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useHiddenNavItems } from "@/hooks/useHiddenNavItems";
import { useCalChatUnread } from "@/hooks/useCalChatUnread";

/** Event the inbox listens for to open its add-task dialog. */
export const ADD_TASK_EVENT = "caltodo-add-task";

interface Tab {
  label: string;
  href: string;
  icon: typeof Inbox;
  /** Unread count shown as a badge; omitted or 0 renders nothing. */
  badgeCount?: number;
}

/**
 * Fixed bottom tab bar for mobile navigation (visible below md breakpoint).
 * Contains Inbox, Calendar, a labelled Add button, Chat (with its unread
 * count), and Settings, with active state highlighting and aria-current.
 * Includes safe-area padding for the iPhone home indicator.
 *
 * Home (the widget board) is intentionally absent: it is a desktop-only
 * surface, and the proxy and MobileRouteGuard bounce direct visits so the
 * tab bar and the reachable routes agree. The bar hides inside an open
 * chat room, which has its own back button to the room list.
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [inboxFilter, setInboxFilter] = useState<string>("all");
  useOnboardingStatus();
  const chatUnread = useCalChatUnread();
  const { isHidden: isNavItemHidden } = useHiddenNavItems();

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
    return () => window.removeEventListener("inbox-filter-change", handleFilterChange);
  }, []);

  // Hide navigation during onboarding, settings, and inside a specific chat
  if (pathname.startsWith("/app/onboarding") || pathname.startsWith("/app/settings")) return null;
  if (pathname.match(/^\/app\/discussions\/[^/]+$/)) return null;

  const inboxTab: Tab =
    inboxFilter === "today"
      ? { label: "Today", href: "/app/inbox", icon: Sun }
      : inboxFilter === "7days"
        ? { label: "7 days", href: "/app/inbox", icon: CalendarRange }
        : { label: "Inbox", href: "/app/inbox", icon: Inbox };
  const calendarTab: Tab = { label: "Calendar", href: "/app/calendar", icon: CalendarDays };
  const chatTab: Tab = { label: "Chat", href: "/app/discussions", icon: MessageCircle, badgeCount: chatUnread };
  const settingsTab: Tab = { label: "Settings", href: "/app/settings", icon: Settings };

  /** Opens the add-task dialog: in place on the inbox, via ?add=1 elsewhere. */
  function handleAdd() {
    if (pathname.startsWith("/app/inbox")) {
      window.dispatchEvent(new CustomEvent(ADD_TASK_EVENT));
    } else {
      router.push("/app/inbox?add=1");
    }
  }

  /** One tab link with active styling and aria-current. */
  function renderTab(tab: Tab) {
    const isActive = pathname.startsWith(tab.href);
    const Icon = tab.icon;
    return (
      <Link
        key={tab.href}
        href={tab.href}
        prefetch
        data-nav-href={tab.href}
        aria-current={isActive ? "page" : undefined}
        className={`flex flex-col items-center justify-center min-h-11 min-w-11 flex-1 py-2 transition-colors relative ${
          isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon size={20} aria-hidden="true" />
        {tab.badgeCount ? (
          <span
            className="absolute top-1.5 right-[calc(50%-18px)] min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-3xs font-bold flex items-center justify-center"
            aria-label={`${tab.badgeCount} unread`}
          >
            {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
          </span>
        ) : null}
        <span className="text-3xs mt-0.5 font-medium">{tab.label}</span>
      </Link>
    );
  }

  return (
    <nav aria-label="Main" className="fixed bottom-0 left-0 right-0 z-sticky md:hidden glass-strong border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.08)] dark:shadow-black/30">
      <div className="flex items-center justify-around" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {[inboxTab, calendarTab].filter((tab) => !isNavItemHidden(tab.href)).map(renderTab)}
        <button
          type="button"
          onClick={handleAdd}
          aria-label="Add task"
          className="flex flex-col items-center justify-center min-h-11 min-w-11 flex-1 py-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="text-3xs mt-0.5 font-medium">Add</span>
        </button>
        {!isNavItemHidden(chatTab.href) && renderTab(chatTab)}
        {renderTab(settingsTab)}
      </div>
    </nav>
  );
}
