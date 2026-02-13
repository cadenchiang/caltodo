"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * A single navigation link in the sidebar.
 * Highlights with a frosted active state when the current route matches.
 * Uses prefetch for instant tab switching.
 *
 * @param label - Display text for the nav item
 * @param href - Route path to link to
 * @param icon - Lucide icon component
 */
export default function SidebarNavItem({ label, href, icon: Icon }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      prefetch={true}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? "bg-black/5 text-gray-800"
          : "text-gray-500 hover:bg-black/5 hover:text-gray-800"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  );
}
