"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import type { IntegrationCredentials, AdditionalCanvasAccount } from "@/lib/types";

interface AdditionalCanvasCardProps {
  account: AdditionalCanvasAccount;
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
}

/**
 * Settings card for a single additional Canvas account.
 * Follows the same Connected/Disconnect hover pattern as CanvasSettings.
 * Shows token expiration status and disconnect confirmation modal.
 *
 * @param account - The additional Canvas account to display
 * @param credentials - Full credentials object (needed to update the array on disconnect)
 * @param onUpdate - Callback with updated credentials after changes
 */
export default function AdditionalCanvasCard({ account, credentials, onUpdate }: AdditionalCanvasCardProps) {
  const { showToast } = useToast();
  const { deleteTasksByExternalIdPrefix } = useTaskContext();
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Check if token has expired (120-day lifetime)
  const isExpired = (() => {
    if (!account.token_created_at) return false;
    const createdAt = new Date(account.token_created_at).getTime();
    const days120 = 120 * 24 * 60 * 60 * 1000;
    return Date.now() - createdAt > days120;
  })();

  /**
   * Disconnects this additional Canvas account by removing it from the JSONB array.
   * Also deletes all tasks synced from this account (matched by external_id prefix).
   */
  async function handleDisconnect() {
    setShowConfirm(false);
    setDisconnecting(true);
    try {
      const updatedAccounts = (credentials.additional_canvas_accounts ?? []).filter(
        (a) => a.id !== account.id
      );
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additional_canvas_accounts: updatedAccounts }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to disconnect");
      }
      const updated: IntegrationCredentials = await res.json();
      onUpdate(updated);
      // Clean up tasks from this account using the namespaced external_id prefix
      await deleteTasksByExternalIdPrefix(`${account.id}:`);
      showToast(`${account.label} disconnected.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <img src="/canvas-logo.png" alt="" className="w-7 h-7 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{account.label}</p>
          <p className="text-xs text-muted-foreground truncate">{account.base_url}</p>
        </div>
        {isExpired ? (
          <button
            onClick={() => handleDisconnect()}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shrink-0 cursor-pointer"
          >
            Expired — Remove
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={disconnecting}
            aria-label={`Disconnect ${account.label}`}
            className="group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg shrink-0 border transition-colors cursor-pointer disabled:opacity-60
              text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30
              hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
          >
            <span className="group-hover:hidden">{disconnecting ? "..." : "Connected"}</span>
            <span className="hidden group-hover:inline">Disconnect</span>
          </button>
        )}
      </div>

      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-sm mx-4 p-6 animate-modal-in">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Disconnect {account.label}?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                This will remove all synced tasks from {account.label}. You can re-add this account later.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer"
                >
                  Disconnect
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
