"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, Play, LogOut, UserX } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import { createClient } from "@/lib/supabase/client";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import GoogleCalendarSettings from "@/components/settings/GoogleCalendarSettings";
import ThemeToggle from "@/components/layout/ThemeToggle";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Settings page with unified section styling.
 * Sections: Account, Google Calendar, Integrations, Appearance, Advanced.
 * Each section has consistent h2 + subtitle + content layout.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { tasks, deleteAllTasks } = useTaskContext();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRedo, setConfirmRedo] = useState(false);
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

  // Prefetch onboarding route so "Redo Setup Wizard" navigates instantly
  useEffect(() => {
    router.prefetch("/app/onboarding");
  }, [router]);

  /**
   * Generates initials from the user's full name or email.
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

  /**
   * Handles redo setup wizard with double-click confirmation.
   * First click shows confirmation text, second click navigates.
   * Resets after 3 seconds if not confirmed.
   */
  function handleRedoSetup() {
    if (!confirmRedo) {
      setConfirmRedo(true);
      setTimeout(() => setConfirmRedo(false), 3000);
      return;
    }
    setConfirmRedo(false);
    router.push("/app/onboarding");
  }

  /** Restarts the tour immediately — dispatches event, tour handles navigation. */
  function handleRestartTour() {
    try {
      localStorage.removeItem("caltodo_tour_completed");
      localStorage.removeItem("caltodo_tour_pending");
    } catch {
      /* non-critical */
    }
    window.dispatchEvent(new CustomEvent("caltodo-restart-tour"));
  }

  /**
   * Handles delete all tasks with double-click confirmation.
   * First click shows confirmation text, second click executes.
   * Resets after 3 seconds if not confirmed.
   */
  async function handleDeleteAll() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setConfirmDelete(false);
    await deleteAllTasks();
    showToast("All tasks deleted.");
  }

  return (
    <PageTransition>
      <div className="flex h-full -m-4 md:-m-10">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 md:px-8 md:pt-8 md:pb-4 animate-stagger stagger-1">
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
          <div className="flex-1 overflow-auto px-4 md:px-8 pb-8">
            <div className="max-w-xl space-y-10">
              {/* Account */}
              <section id="account" className="animate-stagger stagger-2">
                <h2 className="text-lg font-semibold text-foreground mb-1">Account</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Your profile and account management.
                </p>

                {/* User info row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {userAvatarUrl && !imgError ? (
                      <img
                        src={userAvatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-lg font-medium">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    {userFullName && (
                      <p className="text-sm font-medium text-foreground truncate">{userFullName}</p>
                    )}
                    {userEmail && (
                      <p className="text-xs text-subtle-foreground truncate">{userEmail}</p>
                    )}
                  </div>
                </div>

                {/* Account actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors w-fit text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors w-fit disabled:opacity-40 ${
                      confirmDeleteAccount
                        ? "text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
                        : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
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

              {/* Google Calendar (Real-time) */}
              <section className="pt-6 border-t border-border animate-stagger stagger-3">
                <GoogleCalendarSettings />
              </section>

              {/* Integrations */}
              <section className="pt-6 border-t border-border animate-stagger stagger-3">
                <IntegrationSettings />
              </section>


              {/* Appearance */}
              <section className="pt-6 border-t border-border animate-stagger stagger-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">Appearance</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Choose your preferred appearance.
                </p>
                <ThemeToggle />
              </section>

              {/* Advanced */}
              <section className="pt-6 border-t border-border animate-stagger stagger-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">Advanced</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Data management and setup options.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleRestartTour}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors w-fit text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Play size={15} />
                    Restart Tutorial
                  </button>

                  <button
                    onClick={handleRedoSetup}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors w-fit ${
                      confirmRedo
                        ? "text-amber-600 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <RotateCcw size={15} />
                    {confirmRedo ? "Click again to redo setup" : "Redo Setup Wizard"}
                  </button>

                  <button
                    onClick={handleDeleteAll}
                    disabled={tasks.length === 0}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors w-fit disabled:opacity-40 disabled:cursor-not-allowed ${
                      confirmDelete
                        ? "text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
                        : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    }`}
                  >
                    <Trash2 size={15} />
                    {confirmDelete
                      ? `Click again to delete all ${tasks.length} tasks`
                      : `Delete All Tasks (${tasks.length})`}
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
