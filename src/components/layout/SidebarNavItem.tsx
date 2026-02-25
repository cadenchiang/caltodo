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
  /** Optional HTML id for tour targeting. */
  id?: string;
}

/**
 * A single navigation link in the sidebar.
 * Highlights with a frosted active state when the current route matches.
 * Uses prefetch for instant tab switching.
 *
 * @param label - Display text for the nav item
 * @param href - Route path to link to
 * @param icon - Lucide icon component
 * @param badge - Whether to show a notification dot next to the label
 */
export default function SidebarNavItem({ label, href, icon: Icon, badge, id }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { colorTheme } = useTheme();
  const isMiffy = colorTheme === "miffy";
  const isActive = pathname === href;

  return (
    <Link
      id={id}
      href={href}
      prefetch={true}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? isMiffy
            ? "bg-[#fce8ef] dark:bg-[rgba(232,114,154,0.12)] text-foreground"
            : "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <Icon key={label} size={16} className="animate-[fadeIn_150ms_ease-out]" />
      <span key={`label-${label}`} className="animate-[fadeIn_150ms_ease-out]">{label}</span>
      {badge && (
        <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          1
        </span>
      )}
    </Link>
  );
}
