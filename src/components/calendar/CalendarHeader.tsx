"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Unlink, XCircle, Check } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useToast } from "@/contexts/ToastContext";

/** localStorage key matching GoogleCalendarSettings cache. */
const GCAL_CACHE_KEY = "gcal_status";

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

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

/**
 * Calendar header with month/year display, navigation controls,
 * and a GCal sync status tag when connected.
 * The tag opens a popover with a disconnect option.
 * Reads cached GCal status from localStorage for instant render.
 *
 * @param currentMonth - The currently displayed month
 * @param onPrevMonth - Navigate to previous month
 * @param onNextMonth - Navigate to next month
 * @param onToday - Navigate to current month
 */
export default function CalendarHeader({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const { showToast } = useToast();

  // null = unknown (loading), true/false = resolved status
  const [gcalConnected, setGcalConnected] = useState<boolean | null>(null);
  const [gcalEmail, setGcalEmail] = useState<string | null>(null);
  const [gcalPhotoUrl, setGcalPhotoUrl] = useState<string | null>(null);

  // Hydrate from localStorage cache on mount (client-only) for instant render
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
    // No cache — leave as null until API responds
  }, []);

  const [showPopover, setShowPopover] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  /**
   * Fetches GCal connection status on mount to confirm cache.
   */
  const checkGcalStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data = await res.json();
        const isConnected = !!data.google_calendar_id;
        setGcalConnected(isConnected);
        setGcalEmail(data.google_email ?? null);
        setGcalPhotoUrl(data.google_photo_url ?? null);

        // Write cache so next load hydrates instantly
        try {
          localStorage.setItem(GCAL_CACHE_KEY, JSON.stringify({
            connected: isConnected,
            calendarId: data.google_calendar_id ?? null,
            email: data.google_email ?? null,
            photoUrl: data.google_photo_url ?? null,
          }));
        } catch { /* ignore */ }
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    checkGcalStatus();
  }, [checkGcalStatus]);

  /**
   * Closes the popover when clicking outside.
   */
  useEffect(() => {
    if (!showPopover) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setShowPopover(false);
        setConfirmDisconnect(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

  /**
   * Disconnects Google Calendar with double-click confirmation.
   */
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

  /**
   * Compute popover position anchored directly below the Synced button.
   * Uses pre-calculated left offset instead of CSS transform to avoid
   * a visual glitch where the popover briefly renders off-center.
   */
  function getPopoverStyle(): React.CSSProperties {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 220;
    return {
      position: "fixed",
      top: rect.bottom + 8,
      left: Math.max(8, rect.left + rect.width / 2 - popoverWidth / 2),
    };
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-3 md:mb-5">
      {/* Row 1: title + nav buttons */}
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-2 shrink-0">
            <CalendarDays size={18} className="md:w-[22px] md:h-[22px]" />
            <span className="md:hidden">{format(currentMonth, "MMM yyyy")}</span>
            <span className="hidden md:inline">{format(currentMonth, "MMMM yyyy")}</span>
          </h1>

          {/* GCal synced tag — inline next to title */}
          {gcalConnected && (
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setShowPopover(!showPopover)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              >
                <GCalIcon size={12} />
                Synced
              </button>

              {/* Disconnect popover — rendered via portal to escape glass stacking context */}
              {showPopover && createPortal(
                <div
                  ref={popoverRef}
                  style={getPopoverStyle()}
                  className="z-[9999] bg-white dark:bg-neutral-800 border border-border rounded-xl shadow-xl dark:shadow-black/40 p-3.5 min-w-[220px] animate-popover-in"
                >
                  {/* Account info */}
                  {gcalEmail && (
                    <div className="flex items-center gap-2.5 mb-3">
                      {gcalPhotoUrl ? (
                        <img
                          src={gcalPhotoUrl}
                          alt=""
                          width={28}
                          height={28}
                          className="rounded-full shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
                          {gcalEmail[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-foreground font-medium truncate">{gcalEmail}</span>
                      <Check size={14} className="text-emerald-500 shrink-0" />
                    </div>
                  )}
                  <p className="text-xs text-subtle-foreground mb-3">
                    Tasks are synced to Google Calendar in real time.
                  </p>
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
                    {confirmDisconnect
                      ? "Click again to confirm"
                      : disconnecting
                        ? "Disconnecting..."
                        : "Disconnect"}
                  </button>
                </div>,
                document.body
              )}
            </div>
          )}

          {/* GCal CTA — inline next to title when not connected */}
          {gcalConnected === false && (
            <a href="/app/settings" title="Connect Google Calendar in Settings" className="relative group/sync">
              <ShimmerButton
                shimmerColor="#b45309"
                shimmerSize="0.05em"
                shimmerDuration="3s"
                background="rgba(0, 0, 0, 0.9)"
                className="px-3 py-1.5 text-xs hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <GCalIcon size={16} />
                <span className="ml-1.5 font-medium text-amber-500 dark:text-amber-400">
                  <span className="md:hidden">Sync GCal</span>
                  <span className="hidden md:inline">Sync Google Calendar</span>
                </span>
              </ShimmerButton>
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium leading-none">
                1
              </span>
            </a>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-xs md:text-sm font-medium text-foreground rounded-lg md:rounded-xl bg-transparent border border-input-border hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-150"
          >
            Today
          </button>
          <button
            onClick={onPrevMonth}
            className="p-2 text-subtle-foreground hover:text-secondary-foreground rounded-xl hover:bg-accent transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 text-subtle-foreground hover:text-secondary-foreground rounded-xl hover:bg-accent transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
