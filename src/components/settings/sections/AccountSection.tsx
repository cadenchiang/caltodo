"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, UserX, Camera } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { clearLayoutCache } from "@/lib/board-layout-cache";
import SignOutConfirmModal from "@/components/ui/SignOutConfirmModal";

/**
 * Account settings section.
 * Displays user profile (avatar, name, email) and provides
 * sign-out and delete-account actions with double-click confirmation.
 */
export default function AccountSection() {
  const router = useRouter();
  const { showToast } = useToast();
  /** Controls the centered "Sign out?" confirm modal. */
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  /** Spinner state on the modal's confirm button while the sign-out request is in flight. */
  const [signingOut, setSigningOut] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("caltodo_user_profile");
      if (cached) {
        const { email, fullName, avatarUrl } = JSON.parse(cached);
        setUserEmail(email);
        setUserFullName(fullName);
        setUserAvatarUrl(avatarUrl);
      }
    } catch { /* ignore */ }
  }, []);

  /**
   * Generates initials from the user's full name or email.
   * @returns 1-2 character uppercase initials string
   */
  function getInitials(): string {
    if (userFullName) {
      const parts = userFullName.split(" ").filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts.length === 1) return parts[0][0].toUpperCase();
    }
    if (userEmail) return userEmail[0].toUpperCase();
    return "?";
  }

  /**
   * Handles avatar file selection. Uploads to /api/account/avatar,
   * updates local state and localStorage cache on success.
   */
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("File too large. Max 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to upload photo.");
        return;
      }

      const { avatar_url } = await res.json();
      setUserAvatarUrl(avatar_url);
      setImgError(false);

      // Update localStorage cache so sidebar/header reflect the change
      try {
        const cached = localStorage.getItem("caltodo_user_profile");
        if (cached) {
          const profile = JSON.parse(cached);
          profile.avatarUrl = avatar_url;
          localStorage.setItem("caltodo_user_profile", JSON.stringify(profile));
        }
      } catch { /* ignore */ }

      showToast("Profile photo updated.");
    } catch {
      showToast("Failed to upload photo.");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /**
   * Opens the centered confirmation modal — the actual sign-out happens in confirmSignOut().
   */
  function handleSignOut() {
    setShowSignOutModal(true);
  }

  /**
   * Performs the sign-out after the user confirms in the modal.
   * Clears layout cache, hits /auth/signout, redirects home.
   */
  async function confirmSignOut() {
    setSigningOut(true);
    try {
      clearLayoutCache();
      const res = await fetch("/auth/signout", { method: "POST" });
      if (!res.ok) throw new Error(`Sign out failed (${res.status})`);
      setShowSignOutModal(false);
      router.push("/");
    } catch {
      setSigningOut(false);
      setShowSignOutModal(false);
      showToast("Failed to sign out. Please try again.");
    }
  }

  /**
   * Handles account deletion with double-click confirmation.
   * First click shows confirmation, second click executes.
   * Resets after 3 seconds if not confirmed.
   */
  async function handleDeleteAccount() {
    if (!confirmDeleteAccount) {
      setConfirmDeleteAccount(true);
      setTimeout(() => setConfirmDeleteAccount(false), 3000);
      return;
    }
    setConfirmDeleteAccount(false);
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (res.ok) {
        showToast("Account deleted. Redirecting...");
        router.push("/");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to delete account.");
      }
    } catch {
      showToast("Failed to delete account.");
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Account</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Your profile and account settings.
      </p>
      <div className="flex items-center gap-3.5 p-3 -mx-3">
        {/* Clickable avatar with camera overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer disabled:cursor-wait"
          title="Change profile photo"
        >
          {userAvatarUrl && !imgError ? (
            <Image
              src={userAvatarUrl}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {getInitials()}
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera size={14} className="text-white" />
            )}
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <div className="min-w-0 flex-1 text-left">
          {userFullName && (
            <p className="text-sm font-medium text-foreground truncate">{userFullName}</p>
          )}
          {userEmail && (
            <p className="text-xs text-subtle-foreground truncate">{userEmail}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors disabled:opacity-40 ${
            confirmDeleteAccount
              ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
              : "border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserX size={15} />
          {deletingAccount
            ? "Deleting..."
            : confirmDeleteAccount
              ? "Click again to permanently delete your account"
              : "Delete Account"}
        </button>
      </div>

      {/* Centered confirm modal — replaces the old click-twice pattern */}
      <SignOutConfirmModal
        open={showSignOutModal}
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
        signingOut={signingOut}
      />
    </section>
  );
}
