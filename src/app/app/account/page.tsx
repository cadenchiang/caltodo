"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserX, ChevronLeft } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { createClient } from "@/lib/supabase/client";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Standalone Account page for profile info and account management.
 * Shows user avatar, name, email, sign out, and delete account.
 * Accessible from the ProfilePopup and the settings page profile row.
 */
export default function AccountPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Hydrate user info from localStorage cache, then fetch fresh from Supabase
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

    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const email = user.email ?? null;
        const fullName = user.user_metadata?.full_name ?? null;
        const avatarUrl = user.user_metadata?.avatar_url ?? null;
        setUserEmail(email);
        setUserFullName(fullName);
        setUserAvatarUrl(avatarUrl);
        try {
          localStorage.setItem("caltodo_user_profile", JSON.stringify({ email, fullName, avatarUrl }));
        } catch { /* ignore */ }
      }
    }
    loadUser();
  }, []);

  /**
   * Generates initials from the user's full name or email.
   *
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
   * Signs the user out by calling the signout route handler.
   */
  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
  }

  /**
   * Handles account deletion with double-click confirmation.
   * First click shows confirmation, second click executes deletion.
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
    <PageTransition>
      <div className="flex h-full -m-4 md:-m-10">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 md:px-8 md:pt-8 md:pb-4 animate-stagger stagger-1">
            <button
              onClick={() => router.push("/app/settings")}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer active:scale-[0.98] mb-3"
            >
              <ChevronLeft size={16} />
              <span>Settings</span>
            </button>
            <h1 className="text-xl font-bold text-foreground">Account</h1>
          </div>
          <div className="flex-1 overflow-auto px-4 md:px-8 pb-8">
            <div className="max-w-xl">
              {/* Profile section */}
              <section className="animate-stagger stagger-2">
                <p className="text-xs text-subtle-foreground mb-4">
                  Your profile and account management.
                </p>

                {/* User info row */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {userAvatarUrl && !imgError ? (
                      <img
                        src={userAvatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xl font-medium">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    {userFullName && (
                      <p className="text-base font-medium text-foreground truncate">{userFullName}</p>
                    )}
                    {userEmail && (
                      <p className="text-sm text-subtle-foreground truncate">{userEmail}</p>
                    )}
                  </div>
                </div>

                {/* Account actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent transition-colors text-foreground"
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
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
