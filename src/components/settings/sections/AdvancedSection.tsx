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
import { AUTH } from "@/lib/copy";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SectionHeading from "@/components/ui/SectionHeading";
import DeleteAccountDialog from "@/components/settings/DeleteAccountDialog";

/** Which confirmation is open, if any. */
type PendingAction = "delete-tasks" | "reset-onboarding" | "delete-account" | null;

/** One full-width action row. */
const ROW =
  "w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

/**
 * Advanced settings section.
 * Delete all tasks, reset onboarding, sign out, and delete the account. Every
 * destructive action opens a ConfirmDialog; account deletion also requires the
 * word "delete" to be typed.
 */
export default function AdvancedSection() {
  const router = useRouter();
  const { tasks, deleteAllTasks, error: taskError } = useTaskContext();
  const { showToast } = useToast();
  const [pending, setPending] = useState<PendingAction>(null);
  /**
   * Bumped once each delete-all has settled, so the toast is chosen from the
   * context's post-delete state rather than the stale render closure.
   */
  const [deleteRun, setDeleteRun] = useState(0);
  /** The context error as it was before the delete began. */
  const errorBeforeDeleteRef = useRef<string | null>(null);
  const [deletingTasks, setDeletingTasks] = useState(false);
  /** Spinner state on the sign-out button while the request is in flight. */
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);

  useEffect(() => {
    router.prefetch("/app/inbox");
  }, [router]);

  /** Deletes every task once the dialog is confirmed. */
  async function handleDeleteAll() {
    setDeletingTasks(true);
    errorBeforeDeleteRef.current = taskError;
    try {
      await deleteAllTasks();
    } finally {
      setDeletingTasks(false);
      setPending(null);
      setDeleteRun((n) => n + 1);
    }
  }

  // deleteAllTasks reports failure through the context (it restores the
  // list and sets `error`) rather than by returning it, so the outcome is
  // read from the render that follows the call.
  useEffect(() => {
    if (deleteRun === 0) return;
    const failed = tasks.length > 0 || (taskError !== null && taskError !== errorBeforeDeleteRef.current);
    if (failed) {
      console.error("AdvancedSection: delete all tasks failed", {
        error: taskError,
        remaining: tasks.length,
        impact: "tasks were restored; nothing was deleted",
      });
      showToast(taskError ? `Failed to delete tasks: ${taskError}` : "Failed to delete tasks.", {
        variant: "error",
      });
      return;
    }
    showToast("All tasks deleted.");
  // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per settled delete; tasks/taskError are read, not watched
  }, [deleteRun]);

  /**
   * Signs out immediately. Clears layout cache, posts to /auth/signout, and
   * hard-navigates home so the in-memory Supabase session is dropped along
   * with the cookies.
   */
  async function handleSignOut() {
    setSigningOut(true);
    try {
      clearLayoutCache();
      await fetch("/auth/signout", { method: "POST" });
    } catch (err) {
      console.error("AdvancedSection: sign-out request failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "hard redirect below still drops the user out of the app",
      });
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
      showToast(`Failed to reset onboarding: ${message}`, { variant: "error" });
    } finally {
      setResettingOnboarding(false);
      setPending(null);
    }
  }

  /** Deletes the account once the dialog's typed gate is met. */
  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (res.ok) {
        showToast("Account deleted. Redirecting...");
        router.push("/");
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("AdvancedSection: account deletion refused", {
          status: res.status,
          error: data.error,
          impact: "account and data were left in place",
        });
        showToast(data.error || "Failed to delete account.", { variant: "error" });
      }
    } catch (err) {
      console.error("AdvancedSection: account deletion request failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "account and data were left in place",
      });
      showToast("Failed to delete account.", { variant: "error" });
    } finally {
      setDeletingAccount(false);
      setPending(null);
    }
  }

  const taskCount = tasks.length;

  return (
    <section>
      <SectionHeading title="Advanced" description="Data management and setup options." />
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setPending("delete-tasks")}
          disabled={taskCount === 0 || deletingTasks}
          className={`${ROW} text-muted-foreground hover:text-foreground`}
        >
          <Trash2 size={15} />
          Delete all tasks ({taskCount})
        </button>

        <button
          type="button"
          onClick={() => setPending("reset-onboarding")}
          disabled={resettingOnboarding}
          className={`${ROW} text-muted-foreground hover:text-foreground`}
        >
          <RotateCcw size={15} />
          Reset onboarding
        </button>

        <div className="border-t border-border my-2" />

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={`${ROW} text-foreground`}
        >
          <LogOut size={15} />
          {signingOut ? AUTH.signingOut : AUTH.signOut}
        </button>
        <button
          type="button"
          onClick={() => setPending("delete-account")}
          disabled={deletingAccount}
          className={`${ROW} text-red-500 hover:text-red-600 hover:bg-red-500/10`}
        >
          <UserX size={15} />
          Delete account
        </button>
      </div>

      <ConfirmDialog
        open={pending === "delete-tasks"}
        title={`Delete all ${taskCount} ${taskCount === 1 ? "task" : "tasks"}?`}
        body="Synced tasks come back on the next sync. Tasks you added yourself are gone for good."
        confirmLabel="Delete all tasks"
        destructive
        loading={deletingTasks}
        icon={<Trash2 size={20} strokeWidth={1.8} />}
        onConfirm={handleDeleteAll}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending === "reset-onboarding"}
        title="Reset onboarding?"
        body="Every welcome screen shows again and setup starts from the first step. Your tasks and connections stay."
        confirmLabel="Reset onboarding"
        loading={resettingOnboarding}
        icon={<RotateCcw size={20} strokeWidth={1.8} />}
        onConfirm={handleResetOnboarding}
        onCancel={() => setPending(null)}
      />

      <DeleteAccountDialog
        open={pending === "delete-account"}
        deleting={deletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
