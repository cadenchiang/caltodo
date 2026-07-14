"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Settings, MessageCircle, Check } from "lucide-react";
import ContactModal from "@/components/ui/ContactModal";
import EditProfileModal from "@/components/ui/EditProfileModal";
import SignOutConfirmModal from "@/components/ui/SignOutConfirmModal";
import { clearLayoutCache } from "@/lib/board-layout-cache";
import { clearSWRCache } from "@/components/SWRProvider";

interface ProfilePopupProps {
  avatarUrl: string | null;
  fullName: string | null;
  email: string | null;
}

/**
 * Avatar button that opens an animated popup with user info,
 * Settings link, and Log Out button. Closes on outside click.
 *
 * @param avatarUrl - Google avatar URL or null for initials fallback
 * @param fullName - User's full name from Google metadata
 * @param email - User's email address
 */
export default function ProfilePopup({ avatarUrl, fullName, email }: ProfilePopupProps) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const [signingOut, setSigningOut] = useState(false);

  /**
   * Performs log-out immediately on click.
   *
   * Three things have to happen for log-out to actually stick:
   *   1. Clear the local board-layout cache so the next user sees their own data.
   *   2. POST /auth/signout, clears the Supabase auth cookies on the server.
   *   3. Hard-navigate to "/", router.push keeps client state in memory, so
   *      the SSR'd page (and middleware) needs a fresh request to forget the
   *      old session. Using window.location forces that.
   */
  async function handleLogOut() {
    setOpen(false);
    setSigningOut(true);
    try {
      clearLayoutCache();
      clearSWRCache();
      await fetch("/auth/signout", { method: "POST" });
    } catch {
      /* even if the server roundtrip fails we still want to drop the user
         out of the app, the hard redirect below clears the in-memory state */
    }
    window.location.href = "/";
  }

  return (
    <div ref={popupRef} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all hover:ring-2 hover:ring-ring"
        aria-label="Profile menu"
      >
        {avatarUrl && !imgError ? (
          <Image
            src={avatarUrl}
            alt="Profile"
            width={36}
            height={36}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {getInitials()}
          </div>
        )}
      </button>

      {/* Contact modal */}
      <ContactModal
        open={showContact}
        onClose={() => setShowContact(false)}
        userName={fullName}
        userEmail={email}
      />

      {/* Edit profile modal */}
      <EditProfileModal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        avatarUrl={avatarUrl}
        fullName={fullName}
        email={email}
      />

      {/* Sign out confirmation modal — opens when user clicks "Log out" */}
      <SignOutConfirmModal
        open={showSignOutConfirm}
        onConfirm={handleLogOut}
        onCancel={() => setShowSignOutConfirm(false)}
        signingOut={signingOut}
      />

      {/* Popup — Notion-style two-section layout: workspace card on top,
          account row in the middle, hover-only Log out row at the bottom.
          Sizing: 288px gives Settings + Contact buttons room to sit side by
          side without truncating either label. */}
      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 z-50 w-[min(288px,calc(100vw-16px))] bg-popover text-foreground rounded-xl shadow-2xl border border-border overflow-hidden animate-in"
        >
          {/* Top: workspace-style header card */}
          <div className="p-3">
            <div className="flex items-center gap-3 px-1 pt-1 pb-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl && !imgError ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-base font-semibold text-foreground">{getInitials()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {fullName && (
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {fullName}
                  </p>
                )}
                {email && (
                  <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                    {email}
                  </p>
                )}
              </div>
            </div>

            {/* Settings + Contact button row */}
            <div className="flex gap-2">
              <Link
                href="/app/settings"
                prefetch={true}
                onClick={() => setOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground border border-border rounded-md hover:bg-accent transition-colors"
              >
                <Settings size={13} strokeWidth={2} />
                Settings
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  setShowContact(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground border border-border rounded-md hover:bg-accent transition-colors cursor-pointer"
              >
                <MessageCircle size={13} strokeWidth={2} />
                Contact
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Account row — current user (Notion shows the email here) */}
          {email && (
            <div className="p-2">
              <div className="flex items-center gap-3 px-2 py-2 rounded-md">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {avatarUrl && !imgError ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[10px] font-semibold text-foreground">{getInitials()}</span>
                  )}
                </div>
                <p className="text-sm text-foreground truncate flex-1 min-w-0">{email}</p>
                <Check size={14} strokeWidth={2.5} className="text-foreground shrink-0" />
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Bottom rows — hover-only highlight, no full-width buttons */}
          <div className="p-2">
            <button
              onClick={() => {
                setOpen(false);
                setShowSignOutConfirm(true);
              }}
              disabled={signingOut}
              className="w-full text-left px-2 py-2 text-sm text-foreground rounded-md hover:bg-accent transition-colors disabled:opacity-60 cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
