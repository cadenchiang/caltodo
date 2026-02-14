"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";

interface ProfilePopupProps {
  avatarUrl: string | null;
  fullName: string | null;
  email: string | null;
}

/**
 * Avatar button that opens an animated popup with user info,
 * Settings link, and Sign Out button (double-click to confirm).
 * Closes on outside click.
 *
 * @param avatarUrl - Google avatar URL or null for initials fallback
 * @param fullName - User's full name from Google metadata
 * @param email - User's email address
 */
export default function ProfilePopup({ avatarUrl, fullName, email }: ProfilePopupProps) {
  const [open, setOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmSignOut(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Reset confirm state when popup closes
  useEffect(() => {
    if (!open) setConfirmSignOut(false);
  }, [open]);

  /**
   * Generates initials from the user's full name.
   * Falls back to first letter of email or "?" if neither available.
   */
  function getInitials(): string {
    if (fullName) {
      const parts = fullName.split(" ").filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts.length === 1) return parts[0][0].toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return "?";
  }

  async function handleSignOutClick() {
    if (!confirmSignOut) {
      setConfirmSignOut(true);
      return;
    }
    // Second click confirms
    setOpen(false);
    setConfirmSignOut(false);
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
  }

  return (
    <div ref={popupRef} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all hover:ring-2 hover:ring-ring"
        aria-label="Profile menu"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {getInitials()}
          </div>
        )}
      </button>

      {/* Popup */}
      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-64 bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-border">
            {fullName && (
              <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
            )}
            {email && (
              <p className="text-xs text-subtle-foreground truncate">{email}</p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/app/settings");
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-secondary-foreground hover:bg-accent transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>
            <button
              onClick={handleSignOutClick}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                confirmSignOut
                  ? "text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
                  : "text-secondary-foreground hover:bg-accent"
              }`}
            >
              <LogOut size={16} />
              {confirmSignOut ? "Click again to confirm" : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
