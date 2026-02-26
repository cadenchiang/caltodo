"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: boolean;
  /** Optional text badge (e.g. "NEW") shown with colored background. */
  badgeText?: string;
  /** Optional HTML id for tour targeting. */
  id?: string;
  /** Optional image to use instead of the Lucide icon. */
  imageSrc?: string;
  /** CSS class applied to the image (e.g. for invert in light mode). */
  imageClassName?: string;
}

/**
 * A single navigation link in the sidebar.
 * Highlights with an active state when the current route matches.
 * Uses prefetch for instant tab switching.
 *
 * @param label - Display text for the nav item
 * @param href - Route path to link to
 * @param icon - Lucide icon component
 * @param badge - Whether to show a notification dot next to the label
 * @param badgeText - Text for a colored badge (e.g. "NEW")
 * @param imageSrc - Optional image path to replace the Lucide icon
 * @param imageClassName - Optional CSS class for the image element
 */
export default function SidebarNavItem({ label, href, icon: Icon, badge, badgeText, id, imageSrc, imageClassName }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      id={id}
      href={href}
      prefetch={true}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? isMiffy
            ? "bg-[#fce8ef] dark:bg-[rgba(232,114,154,0.12)] text-foreground"
            : "bg-gray-200 dark:bg-zinc-700 text-foreground"
          : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-foreground"
      }`}
    >
      {imageSrc ? (
        <img src={imageSrc} alt="" className={`w-5 h-5 object-contain ${imageClassName ?? ""}`} />
      ) : (
        <Icon key={label} size={16} />
      )}
      <span>{label}</span>
      {badge && (
        <span className="ml-auto w-2.5 h-2.5 rounded-full bg-[#007AFF] shrink-0" />
      )}
      {badgeText && (
        <span className="ml-auto px-1.5 py-0.5 rounded-md bg-[#007AFF] text-white text-[9px] font-bold tracking-wide shrink-0">
          {badgeText}
        </span>
      )}
    </Link>
  );
}
