"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, LogOut, UserX, RotateCcw } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import { clearLayoutCache } from "@/lib/board-layout-cache";
import { KEY_MAP as DISMISSED_MODAL_KEYS } from "@/hooks/useDismissedModals";
import { invalidateCredentials } from "@/lib/credentials-client";
import { clearProgress } from "@/lib/onboarding-progress";

/**
 * Advanced settings section.
 * Provides delete-all-tasks, log out, and delete account actions with
 * double-click confirmation on destructive ones.
 */
export default function AdvancedSection() {
  const router = useRouter();
  const { tasks, deleteAllTasks, error: taskError } = useTaskContext();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  /**
   * Bumped once each delete-all has settled, so the toast is chosen from the
   * context's post-delete state rather than the stale render closure.
   */
  const [deleteRun, setDeleteRun] = useState(0);
  /** The context error as it was before the delete began. */
  const errorBeforeDeleteRef = useRef<string | null>(null);
  /** Spinner state on the log-out button while the request is in flight. */
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
    errorBeforeDeleteRef.current = taskError;
    await deleteAllTasks();
    setDeleteRun((n) => n + 1);
  }

  // deleteAllTasks reports failure through the context (it restores the
  // list and sets `error`) rather than by returning it, so the outcome is
  // read from the render that follows the call. The previous code toasted
  // "All tasks deleted." unconditionally, including when nothing was.
  useEffect(() => {
    if (deleteRun === 0) return;
    const failed = tasks.length > 0 || (taskError !== null && taskError !== errorBeforeDeleteRef.current);
    if (failed) {
      console.error("AdvancedSection: delete all tasks failed", {
        error: taskError,
        remaining: tasks.length,
        impact: "tasks were restored; nothing was deleted",
      });
      showToast(taskError ? `Failed to delete tasks: ${taskError}` : "Failed to delete tasks.");
      return;
    }
    showToast("All tasks deleted.");
  // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per settled delete; tasks/taskError are read, not watched
  }, [deleteRun]);

  /**
   * Performs log-out immediately. Clears layout cache, posts to /auth/signout,
   * and hard-navigates home so the in-memory Supabase session is dropped along
   * with the cookies.
   */
  async function handleLogOut() {
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
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissed_modals: {} }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Reset failed: ${res.status}`);
      }
      // Every local "seen" flag, not just the chat one; the server row alone
      // is not what the modals read first.
      for (const lsKey of Object.values(DISMISSED_MODAL_KEYS)) {
        localStorage.removeItem(lsKey);
      }
      // Mounted useDismissedModals consumers drop their module-level cache.
      window.dispatchEvent(new CustomEvent("caltodo-reset-modals"));
      // The shared credentials cache still holds the old dismissed_modals.
      invalidateCredentials();
      // A saved flow position would resume mid-flow instead of from the start.
      clearProgress();
      router.push("/app/onboarding");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("AdvancedSection: reset onboarding failed", {
        error: message,
        impact: "dismissed modals and saved progress were left as they were",
      });
      showToast(`Failed to reset onboarding: ${message}`);
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
          onClick={handleLogOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-colors disabled:opacity-60"
        >
          <LogOut size={15} />
          {signingOut ? "Logging out..." : "Log Out"}
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
