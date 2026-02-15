"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: boolean;
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
export default function SidebarNavItem({ label, href, icon: Icon, badge }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      prefetch={true}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {badge && (
        <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          1
        </span>
      )}
    </Link>
  );
}
