"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Unlink, XCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/**
 * Inline Google Calendar logo SVG (compact version for the tag).
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
  const [gcalConnected, setGcalConnected] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  /**
   * Fetches GCal connection status on mount.
   */
  const checkGcalStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data = await res.json();
        setGcalConnected(!!data.google_calendar_id);
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
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
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

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays size={22} />
          {format(currentMonth, "MMMM yyyy")}
        </h1>

        {/* GCal synced tag */}
        {gcalConnected && (
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowPopover(!showPopover)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              <GCalIcon size={12} />
              Synced
            </button>

            {/* Disconnect popover */}
            {showPopover && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-popover border border-border rounded-xl shadow-xl dark:shadow-black/40 p-3.5 min-w-[220px]">
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
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-medium text-foreground rounded-xl bg-transparent border border-input-border hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-150"
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
  );
}
