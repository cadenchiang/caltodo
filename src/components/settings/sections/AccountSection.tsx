"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, UserX } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/**
 * Account settings section.
 * Displays user profile (avatar, name, email) and provides
 * sign-out and delete-account actions with double-click confirmation.
 */
export default function AccountSection() {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

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
   * Signs the user out with double-click confirmation.
   * First click shows confirmation, second click executes.
   * Resets after 3 seconds if not confirmed.
   */
  async function handleSignOut() {
    if (!confirmSignOut) {
      setConfirmSignOut(true);
      setTimeout(() => setConfirmSignOut(false), 3000);
      return;
    }
    setConfirmSignOut(false);
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
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
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0">
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
        </div>
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
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors ${
            confirmSignOut
              ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
              : "border-border bg-card hover:bg-accent text-foreground"
          }`}
        >
          <LogOut size={15} />
          {confirmSignOut ? "Click again to sign out" : "Sign Out"}
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
    </section>
  );
}
