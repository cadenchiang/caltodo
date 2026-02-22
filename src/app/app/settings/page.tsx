"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, Play, ChevronRight, ChevronLeft } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import IntegrationSettings, { IntegrationProvider, IntegrationClasses } from "@/components/settings/IntegrationSettings";
import GoogleCalendarSettings from "@/components/settings/GoogleCalendarSettings";
import ThemeToggle from "@/components/layout/ThemeToggle";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Settings page with unified section styling.
 * Sections: Profile link, Google Calendar, Integrations, Appearance, Advanced.
 * Account management has been moved to /app/account.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { tasks, deleteAllTasks } = useTaskContext();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRedo, setConfirmRedo] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Hydrate user info from localStorage cache for the profile row
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

  // Prefetch routes for instant navigation
  useEffect(() => {
    router.prefetch("/app/onboarding");
    router.prefetch("/app/account");
  }, [router]);

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
          {/* Mobile header — back + Settings on same line */}
          <div className="px-4 pt-4 pb-2 md:hidden animate-stagger stagger-1">
            <button
              onClick={() => router.push("/app/inbox")}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer active:scale-[0.98]"
            >
              <ChevronLeft size={16} />
              <span>Settings</span>
            </button>
          </div>
          <div className="flex-1 overflow-auto px-4 pt-2 md:px-8 md:pt-8 pb-8">
            <div className="max-w-xl space-y-10">
              {/* Account section */}
              <section className="animate-stagger stagger-2">
                <h2 className="text-lg font-semibold text-foreground mb-1">Account</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Your profile and account settings.
                </p>
                <button
                  onClick={() => router.push("/app/account")}
                  className="w-full flex items-center gap-3.5 p-3 -mx-3 rounded-xl hover:bg-accent transition-colors cursor-pointer"
                >
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  {userAvatarUrl && !imgError ? (
                    <img
                      src={userAvatarUrl}
                      alt="Profile"
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
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </button>
              </section>

              <hr className="border-border" />

              <IntegrationProvider>
                {/* Integrations */}
                <section className="animate-stagger stagger-3">
                  <h2 className="text-lg font-semibold text-foreground mb-1">Integrations</h2>
                  <p className="text-xs text-subtle-foreground mb-4">
                    Connect your accounts to sync assignments and events.
                  </p>
                  <div className="space-y-3">
                    <GoogleCalendarSettings />
                    <IntegrationSettings />
                  </div>
                </section>

                <hr className="border-border" />

                {/* Classes */}
                <section className="animate-stagger stagger-3">
                  <h2 className="text-lg font-semibold text-foreground mb-1">Classes</h2>
                  <p className="text-xs text-subtle-foreground mb-4">
                    Choose which classes to sync assignments from.
                  </p>
                  <IntegrationClasses />
                </section>
              </IntegrationProvider>

              <hr className="border-border" />

              {/* Appearance */}
              <section className="animate-stagger stagger-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">Appearance</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Choose your preferred appearance.
                </p>
                <ThemeToggle />
              </section>

              <hr className="border-border" />

              {/* Advanced */}
              <section className="animate-stagger stagger-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">Advanced</h2>
                <p className="text-xs text-subtle-foreground mb-4">
                  Data management and setup options.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleRestartTour}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent transition-colors text-foreground"
                  >
                    <Play size={15} />
                    Restart Tutorial
                  </button>

                  <button
                    onClick={handleRedoSetup}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors ${
                      confirmRedo
                        ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        : "border-border bg-card hover:bg-accent text-foreground"
                    }`}
                  >
                    <RotateCcw size={15} />
                    {confirmRedo ? "Click again to redo setup" : "Redo Setup Wizard"}
                  </button>

                  <button
                    onClick={handleDeleteAll}
                    disabled={tasks.length === 0}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      confirmDelete
                        ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                        : "border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
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
