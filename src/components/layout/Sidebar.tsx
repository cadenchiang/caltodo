"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Inbox, Sun, CalendarRange, ChevronLeft } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { SETTINGS_SECTIONS, SETTINGS_GROUPS, DEFAULT_SECTION, type SettingsSectionId } from "@/lib/settingsConfig";
import SidebarNavItem, { navItemClasses } from "./SidebarNavItem";
import ProfilePopup from "./ProfilePopup";
import { useTheme } from "@/contexts/ThemeContext";
import { useCalChatUnread } from "@/hooks/useCalChatUnread";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useDismissedModals } from "@/hooks/useDismissedModals";
import { useHiddenNavItems } from "@/hooks/useHiddenNavItems";


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

  // Local avatar/name state for reactive updates from profile changes
  const [localAvatarUrl, setLocalAvatarUrl] = useState(avatarUrl);
  const [localFullName, setLocalFullName] = useState(fullName);

  // Hydrate inbox filter from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inbox-filter");
      if (saved) setInboxFilter(saved);
    } catch { /* ignore */ }
  }, []);

  // Listen for profile updates dispatched from ProfileSection
  useEffect(() => {
    function handleProfileUpdate(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.avatarUrl !== undefined) setLocalAvatarUrl(detail.avatarUrl);
      if (detail?.fullName !== undefined) setLocalFullName(detail.fullName);
    }
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);
  const hasCalChatUnread = useCalChatUnread();
  useOnboardingStatus();
  const { isHidden: isNavItemHidden } = useHiddenNavItems();

  // Track whether user has dismissed the notes welcome — server-persisted per account.
  // Only show "NEW" badge until the account has seen/dismissed the notes welcome modal.
  const { isDismissed: isModalDismissed, dismiss: dismissModal, loaded: modalsLoaded } = useDismissedModals();
  const notesIsNew = modalsLoaded && !isModalDismissed("notes_welcome");

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

  // Hide navigation during onboarding to prevent users from navigating away
  if (pathname.startsWith("/app/onboarding")) return null;

  const inboxConfig = FILTER_CONFIG[inboxFilter] || FILTER_CONFIG.all;

  return (
    <aside
      className="hidden md:flex glass-strong w-52 h-screen flex-col justify-between py-4 px-3 shrink-0 shadow-lg dark:shadow-black/30"
      style={{ borderRight: colorTheme ? `1px solid var(--sidebar-border-color)` : undefined }}
    >
      <div>
        <div className="mb-6 px-3 pt-1">
          <a href="/?landing=1" className="block hover:opacity-80 transition-opacity">
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
          </a>
        </div>
        {isSettings ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <button
                onClick={() => router.push("/app/inbox")}
                className="w-7 h-7 rounded-lg border border-border bg-white dark:bg-zinc-800 shadow-sm dark:shadow-none flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer active:scale-[0.95] shrink-0"
                title="Back"
                aria-label="Back"
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
                        router.replace(`/app/settings?section=${section.id}`, { scroll: false });
                      }}
                      className={`w-full cursor-pointer ${navItemClasses(isActive, isMiffy)}`}
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
            {NAV_ITEMS.filter((item) => !isNavItemHidden(item.href)).map((item) => {
              const isInbox = item.href === "/app/inbox";
              const isCalendar = item.href === "/app/calendar";
              const isChat = item.href === "/app/discussions";
              const isNotes = item.href === "/app/notes";
              return (
                <SidebarNavItem
                  key={item.href}
                  label={isInbox ? inboxConfig.label : item.label}
                  href={item.href}
                  icon={isInbox ? inboxConfig.icon : item.icon}
                  badge={false}
                  badgeCount={isChat ? hasCalChatUnread : undefined}
                  badgeText={isNotes && notesIsNew ? "NEW" : undefined}
                  id={`tour-nav-${item.label.toLowerCase()}`}
                  imageSrc={undefined}
                  imageClassName={undefined}
                  onClick={isNotes && notesIsNew ? () => {
                    dismissModal("notes_welcome");
                  } : undefined}
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
        <ProfilePopup avatarUrl={localAvatarUrl} fullName={localFullName} email={email} />
      </div>
    </aside>
  );
}
