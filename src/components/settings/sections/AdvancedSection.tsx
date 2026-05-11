"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, LogOut, UserX, RotateCcw } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import { clearLayoutCache } from "@/lib/board-layout-cache";
import SignOutConfirmModal from "@/components/ui/SignOutConfirmModal";

/**
 * Advanced settings section.
 * Provides delete-all-tasks, sign out, and delete account actions with
 * double-click confirmation on destructive ones.
 */
export default function AdvancedSection() {
  const router = useRouter();
  const { tasks, deleteAllTasks } = useTaskContext();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  /** Controls the centered "Sign out?" confirmation modal. */
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  /** Spinner state on the modal's confirm button while the sign-out request is in flight. */
  const [signingOut, setSigningOut] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);

  useEffect(() => {
    router.prefetch("/app/inbox");
  }, [router]);

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

  /**
   * Opens the centered confirmation modal — actual sign-out happens in confirmSignOut().
   */
  function handleSignOut() {
    setShowSignOutModal(true);
  }

  /**
   * Performs the sign-out after the user has confirmed in the modal.
   * Clears layout cache, posts to /auth/signout, and hard-navigates home so
   * the in-memory Supabase session is dropped along with the cookies.
   */
  async function confirmSignOut() {
    setSigningOut(true);
    try {
      clearLayoutCache();
      await fetch("/auth/signout", { method: "POST" });
    } catch {
      /* hard redirect below still drops the user out of the app */
    }
    window.location.href = "/";
  }

  /**
   * Resets the onboarding flow so all welcome modals reappear and
   * the user is sent back through /app/onboarding.
   * Clears server-side dismissed_modals and local "seen" flags.
   */
  async function handleResetOnboarding() {
    setResettingOnboarding(true);
    try {
      await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissed_modals: {} }),
      });
      localStorage.removeItem("caltodo_notes_welcome_seen");
      localStorage.removeItem("caltodo_integrations_welcome_seen");
      localStorage.removeItem("calchat_welcome_accepted");
      router.push("/app/onboarding");
    } catch {
      showToast("Failed to reset onboarding.");
    } finally {
      setResettingOnboarding(false);
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
      <h2 className="text-lg font-semibold text-foreground mb-1">Advanced</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Data management and setup options.
      </p>
      <div className="flex flex-col gap-2">
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

        <button
          onClick={handleResetOnboarding}
          disabled={resettingOnboarding}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={15} />
          {resettingOnboarding ? "Resetting..." : "Reset Onboarding"}
        </button>

        {/* Divider */}
        <div className="border-t border-border my-2" />

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
