"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  BEFORE_DEADLINE_PRESETS,
  type CreateRuleInput,
  type NotificationRule,
  type NotificationKind,
} from "@/lib/notifications/types";

interface AddRuleModalProps {
  /** Called when the user closes the modal without saving. */
  onClose: () => void;
  /** Called with the newly created rule on successful POST. */
  onCreated: (rule: NotificationRule) => void;
}

/**
 * Modal for creating a notification rule.
 *
 * Two kinds:
 *  - before_deadline: pick from common presets or enter a custom minutes value.
 *  - daily_digest:    pick a time (HH:MM, browser TZ).
 *
 * Submits POST /api/notifications/rules and bubbles the created rule up.
 * Renders into document.body via createPortal per UI guide.
 */
export default function AddRuleModal({ onClose, onCreated }: AddRuleModalProps) {
  const [mounted, setMounted] = useState(false);
  const [kind, setKind] = useState<NotificationKind>("before_deadline");
  const [minutes, setMinutes] = useState<number>(60);
  const [time, setTime] = useState<string>("08:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  /** Submits the rule to the server. */
  async function handleSave() {
    setSubmitting(true); setError(null);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const body: CreateRuleInput =
      kind === "before_deadline"
        ? { kind, minutes_before: minutes, timezone: tz }
        : { kind, time_of_day: time, timezone: tz };
    try {
      const res = await fetch("/api/notifications/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error || `Server error ${res.status}`);
        return;
      }
      const { rule } = (await res.json()) as { rule: NotificationRule };
      onCreated(rule);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-popover border border-border rounded-2xl max-w-md mx-4 w-full animate-announce-card-in flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="text-base font-semibold text-foreground">New notification rule</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <KindPill
              active={kind === "before_deadline"}
              label="Before deadline"
              onClick={() => setKind("before_deadline")}
            />
            <KindPill
              active={kind === "daily_digest"}
              label="Daily summary"
              onClick={() => setKind("daily_digest")}
            />
          </div>

          {kind === "before_deadline" ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">When</label>
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-popover border border-input-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BEFORE_DEADLINE_PRESETS.map((p) => (
                  <option key={p.minutes} value={p.minutes}>{p.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                You&apos;ll get a push this far before each task&apos;s due time.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Time of day</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-popover border border-input-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-muted-foreground">
                A summary of today&apos;s tasks will arrive at this time, in your current timezone
                ({Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"}).
              </p>
            </div>
          )}

          {error && <div className="text-xs text-red-500">{error}</div>}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save rule"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface KindPillProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

/** Small segmented-control pill used to choose the rule kind. */
function KindPill({ active, label, onClick }: KindPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
        active
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-popover text-muted-foreground border-border hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}
