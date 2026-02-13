"use client";

import { NAV_ITEMS } from "@/lib/constants";
import SidebarNavItem from "./SidebarNavItem";
import ProfilePopup from "./ProfilePopup";

interface SidebarProps {
  avatarUrl: string | null;
  fullName: string | null;
  email: string | null;
}

/**
 * Left navigation sidebar with nav links and profile popup.
 * Glassy frosted-glass aesthetic. Branding uses "toodoocal" with gradient.
 *
 * @param avatarUrl - Google avatar URL or null
 * @param fullName - User's full name
 * @param email - User's email
 */
export default function Sidebar({ avatarUrl, fullName, email }: SidebarProps) {
  return (
    <aside className="glass-strong w-60 h-screen flex flex-col justify-between py-4 px-3 shrink-0 shadow-lg">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-3 pt-1 tracking-tight">
          <span className="text-gray-800 font-bold">toodoo</span><span className="brand-gradient font-black">cal</span>
        </h2>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.href}
              label={item.label}
              href={item.href}
              icon={item.icon}
            />
          ))}
        </nav>
      </div>

      <div className="px-2">
        <ProfilePopup avatarUrl={avatarUrl} fullName={fullName} email={email} />
      </div>
    </aside>
  );
}
