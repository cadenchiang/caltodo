"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Inbox, Sun, CalendarRange, ChevronLeft } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { SETTINGS_SECTIONS, SETTINGS_GROUPS, DEFAULT_SECTION, type SettingsSectionId } from "@/lib/settingsConfig";
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
  const pathname = usePathname();
  const router = useRouter();
  const isSettings = pathname.startsWith("/app/settings");
  const [inboxFilter, setInboxFilter] = useState<string>(() => {
    try { return localStorage.getItem("inbox-filter") || "all"; }
    catch { return "all"; }
  });
  const [showCalBadge, setShowCalBadge] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSectionId>(() => {
    if (typeof window === "undefined") return DEFAULT_SECTION;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("section");
    return SETTINGS_SECTIONS.some((sec) => sec.id === s) ? (s as SettingsSectionId) : DEFAULT_SECTION;
  });

  // Sync active section on browser back/forward
  useEffect(() => {
    if (!isSettings) return;
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("section");
      const valid = SETTINGS_SECTIONS.some((sec) => sec.id === s);
      setActiveSettingsSection(valid ? (s as SettingsSectionId) : DEFAULT_SECTION);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isSettings]);

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

  // Hide navigation during onboarding to prevent users from navigating away
  if (pathname.startsWith("/app/onboarding")) return null;

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
        {isSettings ? (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => router.push("/app/inbox")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-foreground hover:bg-accent cursor-pointer active:scale-[0.98]"
            >
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 shadow-sm dark:shadow-none border border-border/50 flex items-center justify-center shrink-0">
                <ChevronLeft size={14} className="animate-[fadeIn_150ms_ease-out]" />
              </div>
              <span className="animate-[fadeIn_150ms_ease-out]">Settings</span>
            </button>
            <hr className="border-border my-1" />
            {SETTINGS_GROUPS.map((group) => (
              <div key={group}>
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                {SETTINGS_SECTIONS.filter((s) => s.group === group).map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSettingsSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSettingsSection(section.id);
                        router.push(`/app/settings?section=${section.id}`);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 shadow-sm dark:shadow-none border border-border/50 flex items-center justify-center shrink-0">
                        <Icon size={14} />
                      </div>
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>

      <div className="px-2 flex flex-col gap-2">
        <ProfilePopup avatarUrl={avatarUrl} fullName={fullName} email={email} />
      </div>
    </aside>
  );
}
