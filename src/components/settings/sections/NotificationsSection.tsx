"use client";

import { useState } from "react";
import { Mail, Clock, Loader2 } from "lucide-react";
import { useCredentials } from "@/components/settings/IntegrationSettings";
import { useToast } from "@/contexts/ToastContext";

/** Time options for the digest email (UTC hours mapped to PST labels). */
const TIME_OPTIONS = [
  { utc: 13, label: "5:00 AM" },
  { utc: 14, label: "6:00 AM" },
  { utc: 15, label: "7:00 AM" },
  { utc: 16, label: "8:00 AM" },
  { utc: 17, label: "9:00 AM" },
  { utc: 18, label: "10:00 AM" },
  { utc: 19, label: "11:00 AM" },
  { utc: 20, label: "12:00 PM" },
];

/**
 * Notifications settings section.
 * Allows users to toggle the daily email digest, choose send time, and set recipient email.
 */
export default function NotificationsSection() {
  const { credentials, handleUpdate } = useCredentials();
  const { showToast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const digestEnabled = credentials?.email_digest_enabled ?? true;
  const digestHour = credentials?.email_digest_hour ?? 15;
  const digestAddress = credentials?.email_digest_address ?? "";

  /** Saves a partial credentials update to the server. */
  async function save(field: string, payload: Record<string, unknown>) {
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
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update preference");
    } finally {
      setSaving(null);
    }
  }

  /** Toggles the email digest on/off. */
  function handleToggle() {
    save("toggle", { email_digest_enabled: !digestEnabled });
  }

  /** Updates the preferred send time. */
  function handleTimeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    save("time", { email_digest_hour: Number(e.target.value) });
  }

  /** Saves the custom email address on blur. */
  function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    const current = credentials?.email_digest_address ?? "";
    if (value !== current) {
      save("email", { email_digest_address: value || null });
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Notifications</h2>
      <p className="text-xs text-subtle-foreground mb-6">
        Control how caltodo keeps you updated.
      </p>

      <div className="space-y-3">
        {/* Toggle */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <Mail size={18} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Daily email digest</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive a morning email with your overdue, today, and tomorrow assignments.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                disabled={saving === "toggle"}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-60 ${
                  digestEnabled ? "bg-blue-500" : "bg-muted-foreground/30"
                }`}
                aria-label={digestEnabled ? "Disable daily digest" : "Enable daily digest"}
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
              </button>
            </div>
          </div>
        </div>

        {/* Time & Email (only shown when digest is enabled) */}
        {digestEnabled && (
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-purple-500" />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              {/* Time selector */}
              <div>
                <label className="text-sm font-medium text-foreground">Send time</label>
                <select
                  value={digestHour}
                  onChange={handleTimeChange}
                  disabled={saving === "time"}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.utc} value={opt.utc}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Email address */}
              <div>
                <label className="text-sm font-medium text-foreground">Send to</label>
                <input
                  type="email"
                  defaultValue={digestAddress}
                  onBlur={handleEmailBlur}
                  placeholder="Default: your account email"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
