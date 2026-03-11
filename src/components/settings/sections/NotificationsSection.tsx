"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCredentials } from "@/components/settings/IntegrationSettings";
import { useToast } from "@/contexts/ToastContext";

/**
 * Notifications settings section.
 * Toggle for daily email digest, with inline time and email editing.
 */
export default function NotificationsSection() {
  const { credentials, handleUpdate } = useCredentials();
  const { showToast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const digestEnabled = credentials?.email_digest_enabled ?? true;

  /** Saves a partial credentials update. */
  async function save(field: string, payload: Record<string, unknown>, toast?: string) {
    setSaving(field);
    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated = await res.json();
      handleUpdate(updated);
      if (toast) showToast(toast);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Notifications</h2>
      <p className="text-xs text-subtle-foreground mb-6">
        Control how caltodo keeps you updated.
      </p>

      <div className="flex flex-col gap-2">
        {/* Toggle row */}
        <button
          type="button"
          onClick={() =>
            save(
              "toggle",
              { email_digest_enabled: !digestEnabled },
              !digestEnabled ? "Daily digest enabled." : "Daily digest disabled."
            )
          }
          disabled={saving === "toggle"}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent transition-colors text-foreground cursor-pointer disabled:opacity-60"
        >
          <div className="text-left">
            <p className="font-medium">Daily email digest</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receive a daily email at 7:00 AM with your upcoming assignments.
            </p>
          </div>
          <div
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
              digestEnabled ? "bg-blue-500" : "bg-muted-foreground/30"
            }`}
          >
            {saving === "toggle" ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-white" />
              </div>
            ) : (
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  digestEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            )}
          </div>
        </button>

      </div>
    </section>
  );
}
