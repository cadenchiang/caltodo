"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Inbox, Sun, CalendarRange, ChevronLeft } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { SETTINGS_SECTIONS, SETTINGS_GROUPS, DEFAULT_SECTION, type SettingsSectionId } from "@/lib/settingsConfig";
import SidebarNavItem from "./SidebarNavItem";
import ProfilePopup from "./ProfilePopup";
import { useTheme } from "@/contexts/ThemeContext";

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
  const searchParams = useSearchParams();
  const { colorTheme, resolvedTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const isDark = resolvedTheme === "dark";
  const isSettings = pathname.startsWith("/app/settings");
  const [inboxFilter, setInboxFilter] = useState<string>("all");

  // Hydrate inbox filter from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inbox-filter");
      if (saved) setInboxFilter(saved);
    } catch { /* ignore */ }
  }, []);
  const [showCalBadge, setShowCalBadge] = useState(false);

  // Derive active settings section directly from URL search params (single source of truth)
  const sectionParam = searchParams.get("section");
  const activeSettingsSection: SettingsSectionId =
    SETTINGS_SECTIONS.some((sec) => sec.id === sectionParam)
      ? (sectionParam as SettingsSectionId)
      : DEFAULT_SECTION;

  // Cache user profile to localStorage so ProfileSection can read it
  useEffect(() => {
    try {
      localStorage.setItem("caltodo_user_profile", JSON.stringify({ email, fullName, avatarUrl }));
    } catch { /* ignore quota errors */ }
  }, [email, fullName, avatarUrl]);

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

  // Listen for gcal_status or banner dismissal changes from other tabs (StorageEvent)
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

  // Listen for same-tab GCal status changes (StorageEvent only fires in other tabs)
  useEffect(() => {
    function handleGcalChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.connected) {
        setShowCalBadge(false);
      }
    }
    window.addEventListener("gcal-status-change", handleGcalChange);
    return () => window.removeEventListener("gcal-status-change", handleGcalChange);
  }, []);

  // Hide navigation during onboarding to prevent users from navigating away
  if (pathname.startsWith("/app/onboarding")) return null;

  const inboxConfig = FILTER_CONFIG[inboxFilter] || FILTER_CONFIG.all;

  return (
    <aside className={`hidden md:flex glass-strong w-52 h-screen flex-col justify-between py-4 px-3 shrink-0 shadow-lg dark:shadow-black/30 ${isMiffy ? "border-r border-[#f9d5e0] dark:border-[#3d2e36]" : ""}`}>
      <div>
        <div className="mb-6 px-3 pt-1">
          {isMiffy ? (
            <img
              src={isDark ? "/logo-miffy-dark.png" : "/logo-miffy.png"}
              alt="caltodo"
              className="h-10 object-contain"
            />
          ) : (
            <img
              src="/logo.png"
              alt="caltodo"
              className="h-10 dark:invert"
            />
          )}
        </div>
        {isSettings ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <button
                onClick={() => router.push("/app/inbox")}
                className="w-7 h-7 rounded-lg border border-border bg-white dark:bg-zinc-800 shadow-sm dark:shadow-none flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer active:scale-[0.95] shrink-0"
                title="Back"
              >
                <ChevronLeft size={16} className="animate-[fadeIn_150ms_ease-out]" />
              </button>
              <span className="text-sm font-medium text-foreground animate-[fadeIn_150ms_ease-out]">Settings</span>
            </div>
            <hr className="border-border my-1" />
            {SETTINGS_GROUPS.map((group) => (
              <div key={group}>
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-foreground/60">
                  {group}
                </p>
                {SETTINGS_SECTIONS.filter((s) => s.group === group).map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSettingsSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        router.push(`/app/settings?section=${section.id}`);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? isMiffy
                            ? "bg-[#fce8ef] dark:bg-[rgba(232,114,154,0.12)] text-foreground"
                            : "bg-gray-200 dark:bg-zinc-700 text-foreground"
                          : "text-foreground hover:bg-gray-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
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
              const isChat = item.href === "/app/discussions";
              return (
                <SidebarNavItem
                  key={item.href}
                  label={isInbox ? inboxConfig.label : item.label}
                  href={item.href}
                  icon={isInbox ? inboxConfig.icon : item.icon}
                  badge={isCalendar && showCalBadge}
                  badgeText={isChat ? "NEW" : undefined}
                  id={`tour-nav-${item.label.toLowerCase()}`}
                  imageSrc={undefined}
                  imageClassName={undefined}
                />
              );
            })}
          </nav>
        )}
      </div>

      <div className="px-2 flex flex-col gap-2">
        {isMiffy && (
          <div className="flex justify-center pointer-events-none select-none">
            <img
              src="/miffy/miffy-flowers.png"
              alt=""
              className="w-20 h-auto opacity-[0.35]"
              draggable={false}
            />
          </div>
        )}
        <ProfilePopup avatarUrl={avatarUrl} fullName={fullName} email={email} />
      </div>
    </aside>
  );
}
