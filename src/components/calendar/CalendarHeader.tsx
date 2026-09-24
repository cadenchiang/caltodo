"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Popover from "@/components/ui/Popover";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { ChevronLeft, ChevronRight, Unlink, XCircle, Check, Plus } from "lucide-react";
import CalendarSettingsPopover from "./CalendarSettingsPopover";
import SyncClassesModal from "./SyncClassesModal";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

/** localStorage key matching GoogleCalendarSettings cache. */
const GCAL_CACHE_KEY = "gcal_status";

/** localStorage key to persist dismissal of the "Sync classes" badge. */
const SYNC_BADGE_DISMISSED_KEY = "caltodo_sync_badge_dismissed";

export type CalendarViewMode = "month" | "week" | "day";

/**
 * Inline Google Calendar logo SVG with "31" date for brand recognition.
 *
 * @param size - Icon dimensions in pixels (default 12)
 */
function GCalIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 122.88" className="shrink-0">
      <polygon points="93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78" fill="#fff" />
      <polygon points="93.78,122.88 122.88,93.78 93.78,93.78" fill="#EA4335" />
      <polygon points="122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78" fill="#FBBC04" />
      <polygon points="93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88" fill="#34A853" />
      <path d="M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z" fill="#188038" />
      <path d="M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z" fill="#1967D2" />
      <path d="M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z" fill="#4285F4" />
      <path d="M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49C47.41,81.72,44.79,80.91,42.37,79.27z" fill="#1A73E8" />
      <path d="M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05V51.43z" fill="#1A73E8" />
    </svg>
  );
}

export type CalendarMode = "assignments" | "calendar";

interface CalendarHeaderProps {
  currentMonth: Date;
  /** Title text to display (e.g. "February 2026", "Feb 8 - Feb 14, 2026"). */
  title: string;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  /** Toggle between simple assignment view and full calendar view. */
  calendarMode?: CalendarMode;
  onCalendarModeChange?: (mode: CalendarMode) => void;
  onCalendarsChange?: () => void;
  /** Callback when the "+" add button is clicked. */
  onAddClick?: () => void;
}

/**
 * Calendar header with navigation, view toggle, and GCal sync status.
 * Layout: [Today] [<] [>] Title ... [GCal badge] [Month|Week|Day]
 */
export default function CalendarHeader({
  currentMonth,
  title,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  calendarMode = "calendar",
  onCalendarModeChange,
  onCalendarsChange,
  onAddClick,
}: CalendarHeaderProps) {
  const { showToast } = useToast();
  const { hasCompletedOnboarding } = useOnboardingStatus();
  const { tasks } = useTaskContext();
  /**
   * Whether anything is already synced. The onboarding flag alone was not
   * enough: someone who connected a platform without finishing the wizard kept
   * being told to "Sync Classes" while their classes sat on the calendar
   * behind the badge.
   */
  const hasSyncedClasses = tasks.some((t) => t.source && !t.dismissed_at);
  // Read dismissal flags synchronously on first render (from localStorage) so
  // the Sync Classes / GCal badges appear immediately with the page instead of
  // popping in after a mount effect flips them.
  const [syncBadgeDismissed, setSyncBadgeDismissed] = useState(() => {
    try { return localStorage.getItem(SYNC_BADGE_DISMISSED_KEY) === "true"; } catch { return false; }
  });
  const [showSyncClassesModal, setShowSyncClassesModal] = useState(false);
  const [gcalConnected, setGcalConnected] = useState<boolean | null>(null);
  const [gcalEmail, setGcalEmail] = useState<string | null>(null);
  const [gcalPhotoUrl, setGcalPhotoUrl] = useState<string | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GCAL_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        setGcalConnected(cached.connected === true);
        setGcalEmail(cached.email ?? null);
        setGcalPhotoUrl(cached.photoUrl ?? null);
        return;
      }
    } catch { /* ignore */ }
  }, []);

  const checkGcalStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data = await res.json();
        const isConnected = !!data.google_calendar_id;
        setGcalConnected(isConnected);
        setGcalEmail(data.google_email ?? null);
        setGcalPhotoUrl(data.google_photo_url ?? null);
        try {
          localStorage.setItem(GCAL_CACHE_KEY, JSON.stringify({
            connected: isConnected,
            calendarId: data.google_calendar_id ?? null,
            email: data.google_email ?? null,
            photoUrl: data.google_photo_url ?? null,
          }));
        } catch { /* ignore */ }
      }
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { checkGcalStatus(); }, [checkGcalStatus]);

  async function handleDisconnect() {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true);
      setTimeout(() => setConfirmDisconnect(false), 3000);
      return;
    }
    setConfirmDisconnect(false);
    setDisconnecting(true);
    try {
      const res = await fetch("/api/gcal/disconnect", { method: "POST" });
      if (res.ok) {
        setGcalConnected(false);
        setShowPopover(false);
        try { localStorage.removeItem(GCAL_CACHE_KEY); } catch { /* ignore */ }
        showToast("Google Calendar disconnected.");
      } else {
        showToast("Failed to disconnect. Please try again.");
      }
    } catch {
      showToast("Failed to disconnect. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  }

  const VIEW_MODES: CalendarViewMode[] = ["month", "week", "day"];

  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-1">
      {/* Left: Add + Today + nav + title + GCal */}
      <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
        {/* Add task/event button — white circle */}
        {onAddClick && (
          <IconButton variant="inverted" aria-label="Add task" title="Add task" onClick={onAddClick}>
            <Plus size={16} strokeWidth={2.5} />
          </IconButton>
        )}
        <Button variant="secondary" size="sm" onClick={onToday} className="shrink-0">
          Today
        </Button>
        <IconButton aria-label="Previous" onClick={onPrev}>
          <ChevronLeft size={18} />
        </IconButton>
        <IconButton aria-label="Next" onClick={onNext}>
          <ChevronRight size={18} />
        </IconButton>
        <h1 className="text-base md:text-xl font-bold text-foreground truncate ml-0.5 md:ml-1">{title}</h1>

        {/* "Sync classes" badge for unonboarded users — hidden on mobile.
            Not gated on onboardingLoading: unonboarded users never get a cached
            status, so gating made the badge wait on a fetch every time. The
            onboarding hook seeds `completed` from cache, so onboarded users
            still don't see it flash on repeat visits. */}
        {!hasCompletedOnboarding && !hasSyncedClasses && !syncBadgeDismissed && (
          <div className="relative shrink-0 hidden md:flex items-center group/sync ml-2">
            <button
              type="button"
              onClick={() => setShowSyncClassesModal(true)}
              title="Connect your class platforms"
              className="active:scale-95 transition-all relative"
            >
              <div className="rounded-full bg-blue-500 pl-2.5 pr-3 py-1.5 flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <span className="text-xs font-semibold text-white">Sync classes</span>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSyncBadgeDismissed(true);
                try { localStorage.setItem(SYNC_BADGE_DISMISSED_KEY, "true"); } catch { /* ignore */ }
              }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-muted text-foreground flex items-center justify-center opacity-0 group-hover/sync:opacity-100 group-focus-within/sync:opacity-100 transition-opacity hover:bg-accent after:absolute after:content-[''] after:-inset-3"
              aria-label="Dismiss"
              title="Dismiss"
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Google Calendar connection indicator. The calendar only pushes
            tasks to Google (calendarMode is hardcoded to assignments and the
            event overlay never mounts), so the copy says "connected", never
            "synced" or "viewing events". Hidden on mobile. */}
        {gcalConnected && (
          <div className="relative shrink-0 hidden md:block ml-2">
            <button
              ref={buttonRef}
              onClick={() => setShowPopover(!showPopover)}
              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-foreground/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Google Calendar connected"
              aria-haspopup="dialog"
              aria-expanded={showPopover}
              title="Google Calendar connected"
            >
              <GCalIcon size={14} />
              <Check size={12} strokeWidth={2.75} className="text-success" />
            </button>
            <Popover
              open={showPopover}
              onClose={() => { setShowPopover(false); setConfirmDisconnect(false); }}
              anchorRef={buttonRef}
              triggerRef={buttonRef}
              aria-label="Google Calendar"
              className="p-3.5 min-w-[220px]"
            >
              <div>
                {gcalEmail && (
                  <div className="flex items-center gap-2.5 mb-3">
                    {gcalPhotoUrl ? (
                      <img src={gcalPhotoUrl} alt="" width={28} height={28} className="rounded-full shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
                        {gcalEmail[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs text-foreground font-medium truncate">{gcalEmail}</span>
                    <Check size={14} className="text-success shrink-0" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mb-3">Your tasks are added to this Google Calendar.</p>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all disabled:opacity-60 ${
                    confirmDisconnect
                      ? "bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20"
                      : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-border"
                  }`}
                >
                  {confirmDisconnect ? <XCircle size={12} /> : <Unlink size={12} />}
                  {confirmDisconnect ? "Click again to confirm" : disconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            </Popover>
          </div>
        )}
        {/* "Connect Google Calendar" badge was removed at the user's
            request — when GCal isn't connected, the header shows
            nothing in this slot instead of nagging. Connecting still
            happens from /app/settings. */}
      </div>

      {/* Right: Add + View mode (settings gear / view-mode toggle removed —
          assignments mode is the only supported view). */}
      <div className="flex items-center gap-2 shrink-0">

        <SyncClassesModal open={showSyncClassesModal} onClose={() => setShowSyncClassesModal(false)} />

        {/* View mode: Month / Week / Day */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60" role="group" aria-label="Calendar view">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              aria-pressed={viewMode === mode}
              className={`px-2.5 py-1 md:px-4 md:py-1.5 min-h-8 text-xs md:text-sm font-medium capitalize rounded-lg transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                viewMode === mode
                  ? "bg-foreground text-background shadow-sm dark:shadow-none"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}