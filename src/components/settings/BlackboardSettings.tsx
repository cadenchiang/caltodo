"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import type { IntegrationCredentials } from "@/lib/types";

interface BlackboardSettingsProps {
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
  syncing?: boolean;
  lastSyncedAt?: string | null;
  syncedCount?: number;
}

/**
 * Blackboard Learn integration row card. Mirrors BlackboardSettings: logo tile +
 * title + description + connect/disconnect. Blackboard connects via an iCal
 * feed URL entered in the standalone ?setup=blackboard flow.
 *
 * @param credentials - Current integration credentials from parent
 * @param onUpdate - Callback with updated credentials after disconnect
 */
export default function BlackboardSettings({ credentials, onUpdate }: BlackboardSettingsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { tasks, deleteTasksBySource } = useTaskContext();
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isConnected = Boolean(credentials.blackboard_calendar_url);
  const sourceTaskCount = tasks.filter((t) => t.source === "blackboard").length;

  /** Disconnects Blackboard by clearing the calendar URL via API. */
  async function handleDisconnect() {
    setShowConfirm(false);
    setDisconnecting(true);
    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blackboard_calendar_url: null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to disconnect");
      }
      const updated: IntegrationCredentials = await res.json();
      onUpdate(updated);
      await deleteTasksBySource("blackboard");
      showToast("Blackboard disconnected.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* No white plate here, unlike Brightspace: the Blackboard mark is
            already a dark rounded tile, so plating it would box it twice. */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/blackboard-logo.svg" alt="" className="w-6 h-6 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Blackboard</p>
          <p className="text-xs text-muted-foreground truncate">Assignments from your Blackboard calendar</p>
        </div>
        {isConnected ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={disconnecting}
            aria-label="Disconnect Blackboard"
            className="group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg shrink-0 border transition-colors cursor-pointer disabled:opacity-60
              text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30
              hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
          >
            <span className="group-hover:hidden">{disconnecting ? "..." : "Connected"}</span>
            <span className="hidden group-hover:inline">Disconnect</span>
          </button>
        ) : (
          <button
            onClick={() => router.push("/app/onboarding?setup=blackboard")}
            className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer"
          >
            Connect
          </button>
        )}
      </div>

      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Disconnect Blackboard?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {sourceTaskCount > 0
                  ? `This will remove ${sourceTaskCount === 1 ? "1 synced task" : `${sourceTaskCount} synced tasks`} from Blackboard. You can reconnect later to sync them again.`
                  : "No synced tasks to remove. You can reconnect later to sync again."}
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
