"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

/** Shared layoutId so the active pill animates between any two nav items. */
export const SIDEBAR_PILL_LAYOUT_ID = "caltodo-sidebar-active-pill";

/**
 * Tween used by the active pill. A short ease-out feels instant — spring
 * configurations were adding visible motion lag on tab switches.
 */
export const SIDEBAR_PILL_TRANSITION = { type: "tween" as const, ease: "easeOut" as const, duration: 0.18 };

/**
 * Animated background pill for the active sidebar item. Shares a layoutId
 * across all nav items so framer-motion morphs the pill between them when
 * the active item changes, instead of jumping. Render this as a child of
 * the active item; sibling items render nothing.
 */
export function SidebarActivePill() {
  // The pill is `z-0` (not `-z-10`) so it sits in the same stacking context
  // as the link content. The link's icon + label use `relative z-10` to
  // paint above it. Negative z-index pushed the pill behind the sidebar's
  // glass-strong background, making the active state invisible.
  return (
    <motion.span
      layoutId={SIDEBAR_PILL_LAYOUT_ID}
      transition={SIDEBAR_PILL_TRANSITION}
      className="absolute inset-0 z-0 rounded-xl"
      style={{ backgroundColor: "var(--nav-active-bg)" }}
      aria-hidden
    />
  );
}

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: boolean;
  /** Numeric unread count displayed as a red circle badge. */
  badgeCount?: number;
  /** Optional text badge (e.g. "NEW") shown with colored background. */
  badgeText?: string;
  /** Optional HTML id for tour targeting. */
  id?: string;
  /** Optional image to use instead of the Lucide icon. */
  imageSrc?: string;
  /** CSS class applied to the image (e.g. for invert in light mode). */
  imageClassName?: string;
  /** Optional click handler. Parent can call e.preventDefault() to block navigation. */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Override active state externally (e.g. for query-param-based sections). */
  active?: boolean;
}

/**
 * Shared active/hover class string for sidebar nav items.
 * Used by both link-based nav and button-based settings nav to stay in sync.
 * Active background uses --nav-active-bg CSS variable defined per theme.
 *
 * @param isActive - Whether the item is currently selected
 * @param _isMiffy - Deprecated, kept for call-site compatibility
 * @returns Tailwind class string for active/hover state
 */
export function navItemClasses(isActive: boolean, _isMiffy?: boolean): string {
  // `relative` is required so the absolutely-positioned <SidebarActivePill>
  // child can fill the item. We no longer apply `nav-item-active` because
  // the pill paints the background instead — animating between items via
  // framer-motion's shared layoutId.
  const base = "nav-item relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors";
  if (isActive) {
    return `${base} text-foreground`;
  }
  return `${base} text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]`;
}

/**
 * A single navigation link in the sidebar.
 * Highlights with an active state when the current route matches,
 * or when the `active` prop is explicitly set.
 * Uses prefetch for instant tab switching.
 *
 * @param label - Display text for the nav item
 * @param href - Route path to link to
 * @param icon - Lucide icon component
 * @param badge - Whether to show a notification dot next to the label
 * @param badgeCount - Numeric count for a red circle badge
 * @param badgeText - Text for a colored badge (e.g. "NEW")
 * @param imageSrc - Optional image path to replace the Lucide icon
 * @param imageClassName - Optional CSS class for the image element
 * @param onClick - Optional click handler; call e.preventDefault() to block navigation
 * @param active - Override active state; when undefined, derives from pathname
 */
export default function SidebarNavItem({ label, href, icon: Icon, badge, badgeCount, badgeText, id, imageSrc, imageClassName, onClick, active }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  // The /app/calendar route is conceptually a tab inside the Inbox view,
  // so the Inbox sidebar item should stay highlighted while the user is
  // on the calendar page.
  const inboxOwnsCalendar = href === "/app/inbox" && (pathname === "/app/calendar" || pathname.startsWith("/app/calendar/"));
  const isActive = active ?? (pathname === href || pathname.startsWith(href + "/") || inboxOwnsCalendar);

  return (
    <Link
      id={id}
      href={href}
      prefetch={true}
      onClick={onClick}
      data-nav-href={href}
      className={navItemClasses(isActive, isMiffy)}
    >
      {isActive && <SidebarActivePill />}
      {imageSrc ? (
        <img src={imageSrc} alt="" className={`relative z-10 w-5 h-5 object-contain ${imageClassName ?? ""}`} />
      ) : (
        <Icon key={label} size={16} className="relative z-10" />
      )}
      <span className="relative z-10">{label}</span>
      {badge && (
        <span className="relative z-10 ml-auto w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
      )}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="relative z-10 ml-auto min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shrink-0">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
      {badgeText && (
        <span className="relative z-10 ml-auto px-1.5 py-0.5 rounded-md bg-[#0e89d6] text-white text-[9px] font-bold tracking-wide shrink-0">
          {badgeText}
        </span>
      )}
    </Link>
  );
}
