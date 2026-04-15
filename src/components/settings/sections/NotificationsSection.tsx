"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Bell, Clock, Plus, Smartphone, X } from "lucide-react";
import {
  getDeviceState,
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
  type DeviceState,
} from "@/lib/push/client";
import { type NotificationRule, type CreateRuleInput } from "@/lib/notifications/types";

/** A preset option rendered as a toggle row. */
interface Preset {
  label: string;
  minutes?: number;
  time?: string;
}

const BEFORE_PRESETS: Preset[] = [
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour",     minutes: 60 },
  { label: "3 hours",    minutes: 180 },
  { label: "1 day",      minutes: 1440 },
  { label: "1 week",     minutes: 10080 },
];

const DIGEST_PRESETS: Preset[] = [
  { label: "8:00 AM",  time: "08:00" },
  { label: "12:00 PM", time: "12:00" },
  { label: "6:00 PM",  time: "18:00" },
  { label: "9:00 PM",  time: "21:00" },
];

/** localStorage key for the last-known rules snapshot — stale-while-revalidate. */
const RULES_CACHE_KEY = "caltodo_notification_rules_cache";

/** Reads the cached rules snapshot synchronously on first render. */
function readCachedRules(): NotificationRule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RULES_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NotificationRule[]) : [];
  } catch { return []; }
}

/** Persists the latest rules snapshot so the next mount can paint instantly. */
function writeCachedRules(rules: NotificationRule[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(RULES_CACHE_KEY, JSON.stringify(rules)); } catch {}
}

/**
 * Notifications settings — notification-center-style grouped lists.
 *
 * Two cards ("Deadline reminders" + "Daily summary") with toggle rows.
 * Custom rules appear as additional rows. The "Custom…" row at the bottom
 * opens a Google-Calendar-style modal for entering a custom value.
 */
/**
 * True if the browser reports this is an iPhone or iPad. Uses both UA and
 * maxTouchPoints because iPadOS 13+ masks itself as Mac.
 */
function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return (
    ua.includes("Macintosh") &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
}

/** True if the page is running as a standalone PWA (added to Home Screen). */
function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari exposes a legacy boolean instead of the display-mode media query.
  const nav = navigator as unknown as { standalone?: boolean };
  return nav.standalone === true;
}

export default function NotificationsSection() {
  const [device, setDevice] = useState<DeviceState | "loading">("loading");
  // Seed from localStorage so toggles paint with the correct state on first
  // render. Server fetch runs in parallel and reconciles if anything changed.
  const [rules, setRules] = useState<NotificationRule[]>(() => readCachedRules());
  const [rulesHydrated, setRulesHydrated] = useState(() => readCachedRules().length > 0);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [customKind, setCustomKind] = useState<"before_deadline" | "daily_digest" | null>(null);
  const [iosNotInstalled, setIosNotInstalled] = useState(false);
  /**
   * Temp IDs whose user canceled (tapped off) before the POST returned. When
   * the POST finally lands, we fire a matching DELETE for the real row so
   * server state reconciles with the UI.
   */
  const canceledCreatesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function recheck() {
      setIosNotInstalled(isIOSDevice() && !isStandalonePWA());
    }
    recheck();
    // Re-check whenever the tab regains focus — handles the case where the
    // user installs caltodo in another tab or on home screen and then comes
    // back to this page.
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    const mql = window.matchMedia?.("(display-mode: standalone)");
    mql?.addEventListener?.("change", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
      mql?.removeEventListener?.("change", recheck);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [state] = await Promise.all([
        getDeviceState(),
        fetch("/api/notifications/rules").then(async (r) => {
          if (!r.ok) return;
          const { rules } = (await r.json()) as { rules: NotificationRule[] };
          if (!cancelled) {
            setRules(rules);
            writeCachedRules(rules);
          }
        }),
      ]);
      if (!cancelled) { setDevice(state); setRulesHydrated(true); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Keep the cache in sync with every local rules mutation so future mounts
  // start from the latest state even before the server responds.
  useEffect(() => {
    if (rulesHydrated) writeCachedRules(rules);
  }, [rules, rulesHydrated]);

  async function ensureSubscribed(): Promise<boolean> {
    if (device === "subscribed") return true;
    if (device === "denied" || device === "unsupported" || device === "no-sw") return false;
    const key = await getVapidPublicKey();
    if (!key) return false;
    const result = await subscribeToPush(key);
    if (result.status === "subscribed") { setDevice("subscribed"); return true; }
    if (result.status === "denied") setDevice("denied");
    if (result.status === "unsupported") setDevice("unsupported");
    return false;
  }

  function findRule(preset: Preset): NotificationRule | undefined {
    return rules.find((r) =>
      preset.minutes !== undefined
        ? r.kind === "before_deadline" && r.minutes_before === preset.minutes
        : r.kind === "daily_digest" && r.time_of_day === preset.time
    );
  }

  /**
   * Optimistically inserts a rule, then reconciles with the server response.
   * If the user canceled the creation (toggled back off) before the POST
   * landed, we fire a follow-up DELETE so the server doesn't keep an
   * orphan rule the UI doesn't show.
   */
  async function createRule(input: CreateRuleInput): Promise<NotificationRule | null> {
    const tempId = `tmp-${Math.random().toString(36).slice(2)}`;
    const optimistic: NotificationRule = {
      id: tempId,
      user_id: "",
      kind: input.kind,
      minutes_before: input.minutes_before ?? null,
      time_of_day: input.time_of_day ?? null,
      timezone: input.timezone ?? "UTC",
      enabled: true,
      created_at: new Date().toISOString(),
    };
    setRules((rs) => [...rs, optimistic]);

    const res = await fetch("/api/notifications/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      setRules((rs) => rs.filter((r) => r.id !== tempId));
      canceledCreatesRef.current.delete(tempId);
      return null;
    }
    const { rule } = (await res.json()) as { rule: NotificationRule };

    if (canceledCreatesRef.current.has(tempId)) {
      // User toggled off before POST landed — reconcile by deleting the
      // real server row. UI already reflects "off".
      canceledCreatesRef.current.delete(tempId);
      void fetch(`/api/notifications/rules/${rule.id}`, { method: "DELETE" });
      return null;
    }
    setRules((rs) => rs.map((r) => (r.id === tempId ? rule : r)));
    return rule;
  }

  /**
   * Optimistically removes a rule. If the row is still a temp placeholder,
   * record the tempId so the pending create will self-delete once it lands.
   */
  async function deleteRule(rule: NotificationRule) {
    const prev = rules;
    setRules((rs) => rs.filter((r) => r.id !== rule.id));
    if (rule.id.startsWith("tmp-")) {
      canceledCreatesRef.current.add(rule.id);
      return;
    }
    const res = await fetch(`/api/notifications/rules/${rule.id}`, { method: "DELETE" });
    if (!res.ok) setRules(prev);
  }

  /**
   * Toggles a preset with instant UI feedback and never blocks subsequent
   * taps. Rapid on/off/on sequences are safe because:
   *   - Optimistic state + DB unique index handle duplicate creates.
   *   - Temp-row DELETE is queued via `canceledCreatesRef` for later.
   */
  function togglePreset(preset: Preset) {
    const existing = findRule(preset);
    if (existing) { void deleteRule(existing); return; }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const input: CreateRuleInput =
      preset.minutes !== undefined
        ? { kind: "before_deadline", minutes_before: preset.minutes, timezone: tz }
        : { kind: "daily_digest", time_of_day: preset.time, timezone: tz };
    void createRule(input);
    void ensureSubscribed();
  }

  /**
   * Shows a test notification reliably across desktop + Android. Prefers
   * `ServiceWorkerRegistration.showNotification` (required on Android,
   * recommended everywhere), falls back to `new Notification(...)` only
   * when no service worker is registered (dev mode).
   */
  async function sendTest() {
    setTestStatus(null);
    if (typeof Notification === "undefined") {
      setTestStatus("This browser doesn't support notifications.");
      return;
    }
    if (Notification.permission === "denied") {
      setTestStatus("Blocked by browser. Allow notifications in site settings.");
      return;
    }

    setBusy(true);
    try {
      if (Notification.permission === "default") {
        const p = await Notification.requestPermission();
        if (p !== "granted") { setTestStatus("Permission not granted."); return; }
      }

      const options: NotificationOptions = {
        body: "Test notification.",
        icon: "/pwa-icon-192.png",
        badge: "/pwa-icon-192.png",
      };

      let reg: ServiceWorkerRegistration | undefined;
      try { reg = await navigator.serviceWorker?.getRegistration(); } catch {}

      let shown = false;
      if (reg) {
        try { await reg.showNotification("caltodo", { ...options, tag: "caltodo-test" }); shown = true; } catch {}
      }
      if (!shown) {
        try { new Notification("caltodo", options); shown = true; } catch {}
      }

      // Verify the OS actually surfaced the notification. If the browser
      // silently suppressed it (focused tab on some browsers, macOS Focus
      // Mode, etc.), `getNotifications()` comes back empty and we tell the
      // user something actionable instead of a false-positive "Sent.".
      let verified = false;
      if (reg) {
        for (let i = 0; i < 6 && !verified; i++) {
          await new Promise((r) => setTimeout(r, 50));
          const active = await reg.getNotifications({ tag: "caltodo-test" });
          if (active.length > 0) verified = true;
        }
      } else {
        verified = shown; // no SW = we can't introspect; trust the constructor.
      }

      if (verified) {
        setTestStatus("Sent.");
      } else if (shown) {
        setTestStatus("API accepted it but no banner appeared — check macOS Focus / DND.");
      } else {
        setTestStatus("Couldn't show notification.");
      }

      // Fan out to other subscribed devices in the background.
      void (async () => {
        void ensureSubscribed();
        try { await fetch("/api/push/test", { method: "POST" }); } catch {}
      })();
    } finally { setBusy(false); }
  }

  // Auto-clear test status after a few seconds so it doesn't linger.
  useEffect(() => {
    if (!testStatus) return;
    const t = setTimeout(() => setTestStatus(null), 4000);
    return () => clearTimeout(t);
  }, [testStatus]);

  const customBefore = useMemo(() => {
    const preset = new Set(BEFORE_PRESETS.map((c) => c.minutes));
    return rules.filter((r) => r.kind === "before_deadline" && !preset.has(r.minutes_before ?? -1));
  }, [rules]);

  const customDigest = useMemo(() => {
    const preset = new Set(DIGEST_PRESETS.map((c) => c.time));
    return rules.filter((r) => r.kind === "daily_digest" && !preset.has(r.time_of_day ?? ""));
  }, [rules]);

  if (iosNotInstalled) {
    return (
      <div className="flex flex-col gap-4 max-w-sm">
        <div>
          <h1 className="text-base font-semibold text-foreground">Notifications</h1>
          <p className="text-xs text-foreground/70 mt-1">Pick when you want to be reminded.</p>
        </div>
        <IOSInstallGate />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-sm">
      <div>
        <h1 className="text-base font-semibold text-foreground">Notifications</h1>
        <p className="text-xs text-foreground/70 mt-1">Pick when you want to be reminded.</p>
      </div>

      <DeviceHint state={device} />

      <GroupCard title="Deadline reminders">
        {BEFORE_PRESETS.map((p) => (
          <ToggleRow
            key={p.label}
            label={p.label}
            enabled={!!findRule(p)}
            onToggle={() => togglePreset(p)}
          />
        ))}
        {customBefore.map((rule) => (
          <CustomRuleRow
            key={rule.id}
            label={formatBeforeLabel(rule.minutes_before ?? 0)}
            onDelete={() => deleteRule(rule)}
          />
        ))}
        <AddCustomButton onClick={() => setCustomKind("before_deadline")} />
      </GroupCard>

      <GroupCard title="Daily summary">
        {DIGEST_PRESETS.map((p) => (
          <ToggleRow
            key={p.label}
            label={p.label}
            enabled={!!findRule(p)}
            onToggle={() => togglePreset(p)}
          />
        ))}
        {customDigest.map((rule) => (
          <CustomRuleRow
            key={rule.id}
            label={formatTimeLabel(rule.time_of_day ?? "")}
            onDelete={() => deleteRule(rule)}
          />
        ))}
        <AddCustomButton onClick={() => setCustomKind("daily_digest")} />
      </GroupCard>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={sendTest}
          disabled={busy}
          className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-500 text-white transition-transform duration-150 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {busy ? "Sending…" : "Send a test"}
        </button>
        {device === "subscribed" && (
          <button
            type="button"
            onClick={async () => { const ok = await unsubscribeFromPush(); if (ok) setDevice("not-subscribed"); }}
            className="px-3 py-2 text-sm rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            Turn off on this device
          </button>
        )}
        {testStatus && <span className="text-xs text-foreground">{testStatus}</span>}
      </div>

      {isIOSDevice() && (
        <p className="text-xs text-foreground/70 flex items-start gap-2 mt-1">
          <Smartphone size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>On iPhone and iPad, add caltodo to your home screen first (iOS 16.4+).</span>
        </p>
      )}

      {customKind && (
        <CustomRuleModal
          kind={customKind}
          onClose={() => setCustomKind(null)}
          onSubmit={async (input) => {
            await ensureSubscribed();
            const r = await createRule(input);
            if (r) setCustomKind(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Full-bleed install instructions shown when caltodo is opened in Safari on
 * iOS/iPadOS (not running as a home-screen PWA). Apple only delivers Web
 * Push inside installed PWAs on iOS 16.4+, so we block the whole
 * notifications UI until the user completes these steps. A "Check again"
 * button re-runs the detection in case the user installs in a second tab.
 */
function IOSInstallGate() {
  return (
    <div className="bg-gray-100 dark:bg-gray-800/60 border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-foreground">
        <AlertCircle size={16} aria-hidden className="shrink-0 text-blue-500" />
        <h2 className="text-sm font-semibold">Add caltodo to your home screen first</h2>
      </div>
      <p className="text-xs text-foreground/80">
        Apple only delivers push notifications inside installed PWAs. You&apos;ll need to finish
        this one-time setup before you can choose reminders.
      </p>
      <ol className="list-decimal pl-5 space-y-1.5 text-xs text-foreground">
        <li>Open caltodo in <strong>Safari</strong> (not Chrome or any other browser).</li>
        <li>
          Tap the <strong>Share</strong> button
          <span aria-hidden> (the square with an up-arrow at the bottom of the screen)</span>.
        </li>
        <li>Scroll down and tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li>
        <li>Close Safari and open caltodo from your <strong>home screen</strong>.</li>
        <li>Sign in, return to this page, and your reminder options will appear here.</li>
      </ol>
      <p className="text-[11px] text-foreground/60">
        Requires iOS / iPadOS 16.4 or later.
      </p>
      <div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-500 text-white transition-transform duration-150 hover:scale-105 active:scale-100"
        >
          I&apos;ve installed it — check again
        </button>
      </div>
    </div>
  );
}

interface DeviceHintProps { state: DeviceState | "loading"; }

/** Inline hint shown only when the device can't receive pushes. */
function DeviceHint({ state }: DeviceHintProps) {
  if (state === "subscribed" || state === "not-subscribed" || state === "loading" || state === "no-sw") {
    return null;
  }
  const msg = state === "denied"
    ? "Notifications are blocked in your browser. Allow them in site settings, then refresh."
    : "This browser doesn't support push notifications.";
  return (
    <div className="bg-gray-100 dark:bg-gray-800/60 border border-border rounded-2xl p-3 text-xs text-foreground">
      {msg}
    </div>
  );
}

interface GroupCardProps { title: string; children: React.ReactNode; }

/** Card wrapper with a small label above a divided list of rows. */
function GroupCard({ title, children }: GroupCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-foreground px-1">{title}</h2>
      <div className="bg-gray-100 dark:bg-gray-800/60 border border-border rounded-2xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );
}

interface ToggleRowProps { label: string; enabled: boolean; disabled?: boolean; onToggle: () => void; }

/** A single settings row — label left, iOS-style toggle right. */
function ToggleRow({ label, enabled, disabled, onToggle }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-muted/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-pressed={enabled}
    >
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <span
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
          enabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

interface CustomRuleRowProps { label: string; onDelete: () => void; }

function CustomRuleRow({ label, onDelete }: CustomRuleRowProps) {
  return (
    <div className="w-full px-3 py-2 flex items-center gap-3">
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Remove"
        className="p-1 rounded-lg text-foreground hover:bg-muted transition-colors"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}

interface AddCustomButtonProps { onClick: () => void; }

/** Bottom row of each card — opens the custom-rule modal on click. */
function AddCustomButton({ onClick }: AddCustomButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
    >
      <Plus size={14} aria-hidden />
      Custom…
    </button>
  );
}

interface CustomRuleModalProps {
  kind: "before_deadline" | "daily_digest";
  onClose: () => void;
  onSubmit: (input: CreateRuleInput) => Promise<void>;
}

/**
 * Modal matching the GCalEventCreateModal visual language: ~18vh top
 * offset, w-[420px], bg-card, rounded-2xl, hover:bg-gray-100 rows,
 * full-width submit button.
 */
function CustomRuleModal({ kind, onClose, onSubmit }: CustomRuleModalProps) {
  const [minutes, setMinutes] = useState<number>(45);
  const [unit, setUnit] = useState<"minutes" | "hours" | "days">("minutes");
  const [time, setTime] = useState<string>("07:30");
  const [saving, setSaving] = useState(false);
  const [animState, setAnimState] = useState<"entering" | "visible" | "exiting">("entering");
  const firstInputRef = useRef<HTMLInputElement>(null);

  /** Closes with exit animation. */
  const handleClose = useCallback(() => {
    setAnimState("exiting");
    setTimeout(onClose, 100);
  }, [onClose]);

  useEffect(() => {
    // Flip to "visible" on the next frame so the CSS transition kicks in
    // immediately rather than after a perceptible delay.
    const raf = requestAnimationFrame(() => setAnimState("visible"));
    firstInputRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Escape key closes the modal (common a11y expectation).
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") handleClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /** Normalizes minutes+unit → total minutes. */
  function totalMinutes(): number {
    if (unit === "minutes") return Math.max(1, minutes);
    if (unit === "hours") return Math.max(1, minutes) * 60;
    return Math.max(1, minutes) * 1440;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      if (kind === "before_deadline") {
        await onSubmit({ kind, minutes_before: totalMinutes(), timezone: tz });
      } else {
        await onSubmit({ kind, time_of_day: time, timezone: tz });
      }
    } finally { setSaving(false); }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-100 ${
        animState === "visible" ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-card rounded-2xl border border-border shadow-2xl w-[420px] max-w-[92vw] overflow-hidden transition-all duration-100 ${
          animState === "visible" ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors duration-150 cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit} className="pt-5 pb-4">
          <div className="px-6 pb-4">
            <h2 className="text-[18px] font-semibold text-foreground">
              {kind === "before_deadline" ? "Custom reminder" : "Custom daily summary"}
            </h2>
            <p className="text-xs text-foreground/70 mt-1">
              {kind === "before_deadline"
                ? "Notify me a specific amount of time before each deadline."
                : "Send a daily push at this time."}
            </p>
          </div>

          <div className="px-2">
            {kind === "before_deadline" ? (
              <div className="flex items-center gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Bell size={20} className="shrink-0 text-foreground" aria-hidden />
                <input
                  ref={firstInputRef}
                  type="number"
                  min={1}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as "minutes" | "hours" | "days")}
                  className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none"
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
                <span className="text-sm text-foreground/70">before deadline</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Clock size={20} className="shrink-0 text-foreground" aria-hidden />
                <input
                  ref={firstInputRef}
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border-none outline-none [&::-webkit-calendar-picker-indicator]:opacity-60"
                />
                <span className="text-sm text-foreground/70">daily</span>
              </div>
            )}
          </div>

          <div className="px-6 pt-4 pb-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors duration-150 active:scale-[0.97] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97] cursor-pointer"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/** "45 minutes", "2 hours", "3 days" — matches preset label style. */
function formatBeforeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) { const h = Math.round(minutes / 60); return `${h} ${h === 1 ? "hour" : "hours"}`; }
  if (minutes < 10080) { const d = Math.round(minutes / 1440); return `${d} ${d === 1 ? "day" : "days"}`; }
  const w = Math.round(minutes / 10080);
  return `${w} ${w === 1 ? "week" : "weeks"}`;
}

/** "7:30 AM" style label — matches preset style. */
function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}
