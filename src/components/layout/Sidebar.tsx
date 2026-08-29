"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Inbox, Sun, CalendarRange, ChevronLeft } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { getSettingsReturnPath } from "@/lib/settings-return";
import { SETTINGS_SECTIONS, SETTINGS_GROUPS, DEFAULT_SECTION, type SettingsSectionId } from "@/lib/settingsConfig";
import SidebarNavItem, { navItemClasses, SidebarActivePill } from "./SidebarNavItem";
import ProfilePopup from "./ProfilePopup";
import { useTheme } from "@/contexts/ThemeContext";
// useCalChatUnread import removed — CalChat is no longer in the sidebar.
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
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
  // CalChat removed — no unread badge to compute.
  useOnboardingStatus();
  const { isHidden: isNavItemHidden } = useHiddenNavItems();
  // Active settings section: URL is the source of truth, but we keep an
  // optimistic local override that updates synchronously on click. Without
  // this, the active pill would wait for the SettingsContent re-render to
  // commit (since Next.js bundles all useSearchParams consumers in one
  // pass), which feels laggy on click — a few hundred ms on slow tabs.
  const sectionParam = searchParams.get("section");
  const activeFromUrl: SettingsSectionId =
    SETTINGS_SECTIONS.some((sec) => sec.id === sectionParam)
      ? (sectionParam as SettingsSectionId)
      : DEFAULT_SECTION;
  const [optimisticSection, setOptimisticSection] = useState<SettingsSectionId | null>(null);
  const [, startSectionTransition] = useTransition();
  // Once the URL catches up to our optimistic value, drop the override.
  useEffect(() => {
    if (optimisticSection && optimisticSection === activeFromUrl) {
      setOptimisticSection(null);
    }
  }, [activeFromUrl, optimisticSection]);
  const activeSettingsSection: SettingsSectionId = optimisticSection ?? activeFromUrl;

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

  // Sidebar is always expanded — collapse feature was removed.
  return (
    <aside className="hidden md:flex glass-strong w-52 h-screen flex-col justify-between pb-4 px-3 shrink-0 shadow-lg dark:shadow-black/30">
      <div>
        {/* Header: logo + name on the left, collapse button on the right.
            px-3 aligns the logo's left edge with nav item icons below. */}
        <div className="mb-4 pt-6 pb-2 px-3 flex items-center justify-between">
          {/* Link, not a raw <a>: the anchor forced a full document reload out
              of the app on every logo click, discarding the loaded bundle and
              all in-memory state. ?landing=1 still opts out of the middleware
              redirect that would otherwise bounce a signed-in user back. */}
          {/* prefetch={false}: Next was prefetching the full marketing page
              (six RSC requests in one trace) while the user sat in the app,
              competing with the API calls that gate first render. Nobody
              navigates here often enough to justify that. */}
          <Link href="/?landing=1" prefetch={false} className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
            <img
              src={isMiffy ? (isDark ? "/logo-miffy-dark.png" : "/logo-miffy.png") : "/logo.png"}
              alt="caltodo"
              className={`h-8 object-contain shrink-0 ${isMiffy ? "" : "dark:invert"}`}
            />
          </Link>
        </div>
        {isSettings ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <button
                onClick={() => router.push(getSettingsReturnPath())}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-[0.95] shrink-0"
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
                        // Move the pill synchronously (no waiting on URL),
                        // then schedule the URL update + SettingsContent
                        // re-render as a non-urgent transition.
                        setOptimisticSection(section.id);
                        startSectionTransition(() => {
                          router.replace(`/app/settings?section=${section.id}`, { scroll: false });
                        });
                      }}
                      className={`w-full cursor-pointer ${navItemClasses(isActive, isMiffy)}`}
                    >
                      {isActive && <SidebarActivePill />}
                      <Icon size={16} className="relative z-10 shrink-0" />
                      <span className="relative z-10">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <nav id="tour-sidebar-nav" className="flex flex-col gap-1">
            {NAV_ITEMS
              .filter((item) => !isNavItemHidden(item.href))
              .map((item) => {
              const isInbox = item.href === "/app/inbox";
              return (
                <SidebarNavItem
                  key={item.href}
                  label={isInbox ? inboxConfig.label : item.label}
                  href={item.href}
                  icon={isInbox ? inboxConfig.icon : item.icon}
                  badge={false}
                  badgeCount={undefined}
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
        <ProfilePopup avatarUrl={localAvatarUrl} fullName={localFullName} email={email} />
      </div>
    </aside>
  );
}
