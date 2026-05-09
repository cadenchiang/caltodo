"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, LogOut, UserX } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import { clearLayoutCache } from "@/lib/board-layout-cache";

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
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
    clearLayoutCache();
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

        {/* Divider */}
        <div className="border-t border-border my-2" />

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
