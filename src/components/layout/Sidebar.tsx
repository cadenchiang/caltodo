"use client";

import { useState, useEffect } from "react";
import { Inbox, Sun, CalendarRange } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import SidebarNavItem from "./SidebarNavItem";
import ProfilePopup from "./ProfilePopup";

/** localStorage keys for GCal status. */
const GCAL_CACHE_KEY = "gcal_status";
const GCAL_BANNER_DISMISSED_KEY = "gcal_banner_dismissed";

/** Filter configuration mapping for dynamic sidebar label. */
const FILTER_CONFIG: Record<string, { label: string; icon: typeof Inbox }> = {
  all: { label: "Inbox", icon: Inbox },
  today: { label: "Today", icon: Sun },
  "7days": { label: "Next 7 Days", icon: CalendarRange },
};

interface SidebarProps {
  avatarUrl: string | null;
  fullName: string | null;
  email: string | null;
}

/**
 * Left navigation sidebar with nav links, theme toggle, and profile popup.
 * Glassy frosted-glass aesthetic. Branding uses "caltodo" with gradient.
 * The Inbox nav item dynamically updates its label/icon based on the active filter.
 *
 * @param avatarUrl - Google avatar URL or null
 * @param fullName - User's full name
 * @param email - User's email
 */
export default function Sidebar({ avatarUrl, fullName, email }: SidebarProps) {
  const [inboxFilter, setInboxFilter] = useState<string>(() => {
    try { return localStorage.getItem("inbox-filter") || "all"; }
    catch { return "all"; }
  });
  const [showCalBadge, setShowCalBadge] = useState(false);

  // Listen for filter changes dispatched by InboxPage
  useEffect(() => {
    function handleFilterChange(e: Event) {
      setInboxFilter((e as CustomEvent).detail as string);
    }
    window.addEventListener("inbox-filter-change", handleFilterChange);
    return () => window.removeEventListener("inbox-filter-change", handleFilterChange);
  }, []);

  // Check if GCal is connected — show badge on Calendar nav if not
  useEffect(() => {
    try {
      if (localStorage.getItem(GCAL_BANNER_DISMISSED_KEY) === "true") return;
      const cached = localStorage.getItem(GCAL_CACHE_KEY);
      if (cached && JSON.parse(cached).connected === true) return;
    } catch { /* ignore */ }

    fetch("/api/credentials")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && !data.google_calendar_id) {
          setShowCalBadge(true);
        }
      })
      .catch(() => {});
  }, []);

  // Listen for banner dismissal to hide the badge
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === GCAL_BANNER_DISMISSED_KEY && e.newValue === "true") {
        setShowCalBadge(false);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const inboxConfig = FILTER_CONFIG[inboxFilter] || FILTER_CONFIG.all;

  return (
    <aside className="hidden md:flex glass-strong w-60 h-screen flex-col justify-between py-4 px-3 shrink-0 shadow-lg dark:shadow-black/30">
      <div>
        <div className="mb-6 px-3 pt-1">
          <img
            src="/logo.png"
            alt="caltodo"
            className="h-10 dark:invert"
          />
        </div>
        <nav id="tour-sidebar-nav" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isInbox = item.href === "/app/inbox";
            const isCalendar = item.href === "/app/calendar";
            return (
              <SidebarNavItem
                key={item.href}
                label={isInbox ? inboxConfig.label : item.label}
                href={item.href}
                icon={isInbox ? inboxConfig.icon : item.icon}
                badge={isCalendar && showCalBadge}
                id={`tour-nav-${item.label.toLowerCase()}`}
              />
            );
          })}
        </nav>
      </div>

      <div className="px-2">
        <ProfilePopup avatarUrl={avatarUrl} fullName={fullName} email={email} />
      </div>
    </aside>
  );
}
