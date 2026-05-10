"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Settings, LogOut, MessageCircle, User } from "lucide-react";
import ContactModal from "@/components/ui/ContactModal";
import EditProfileModal from "@/components/ui/EditProfileModal";
import SignOutConfirmModal from "@/components/ui/SignOutConfirmModal";
import { clearLayoutCache } from "@/lib/board-layout-cache";

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
  /** Controls the centered "Sign out?" confirm modal. */
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
   * Opens the centered confirmation modal. Actual sign-out happens in
   * confirmSignOut() once the user clicks the modal's Sign out button.
   */
  function handleSignOutClick() {
    setOpen(false);
    setShowSignOutModal(true);
  }

  /**
   * Performs the sign-out after the user has confirmed in the modal.
   * Clears the local board layout cache, hits /auth/signout, redirects home.
   */
  async function confirmSignOut() {
    setSigningOut(true);
    try {
      clearLayoutCache();
      const res = await fetch("/auth/signout", { method: "POST" });
      if (!res.ok) {
        throw new Error(`Sign out failed (${res.status})`);
      }
      setShowSignOutModal(false);
      router.push("/");
    } catch {
      setSigningOut(false);
      setShowSignOutModal(false);
      alert("Failed to sign out. Please try again.");
    }
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

      {/* Popup */}
      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 z-50 w-[min(256px,calc(100vw-16px))] bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in"
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
          <div>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/app/profile");
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-secondary-foreground hover:bg-accent transition-colors"
            >
              <User size={16} />
              Profile
            </button>
            <Link
              href="/app/settings"
              prefetch={true}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-secondary-foreground hover:bg-accent transition-colors"
            >
              <Settings size={16} />
              Settings
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                setShowContact(true);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-secondary-foreground hover:bg-accent transition-colors"
            >
              <MessageCircle size={16} />
              Contact
            </button>
            <button
              onClick={handleSignOutClick}
              disabled={signingOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-b-xl transition-colors disabled:opacity-60 text-secondary-foreground hover:bg-accent"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Confirm sign-out modal (centered, portaled) */}
      <SignOutConfirmModal
        open={showSignOutModal}
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
        signingOut={signingOut}
      />
    </div>
  );
}
