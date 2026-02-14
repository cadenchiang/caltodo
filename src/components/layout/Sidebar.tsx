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
 * Left navigation sidebar with nav links, theme toggle, and profile popup.
 * Glassy frosted-glass aesthetic. Branding uses "caltodo" with gradient.
 *
 * @param avatarUrl - Google avatar URL or null
 * @param fullName - User's full name
 * @param email - User's email
 */
export default function Sidebar({ avatarUrl, fullName, email }: SidebarProps) {
  return (
    <aside className="glass-strong w-60 h-screen flex flex-col justify-between py-4 px-3 shrink-0 shadow-lg dark:shadow-black/30">
      <div>
        <div className="mb-6 px-3 pt-1">
          <img
            src="/logo.png"
            alt="caltodo"
            className="h-10 dark:invert"
          />
        </div>
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
