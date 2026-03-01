"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, X, Trash2, ChevronDown } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatShortDate } from "@/lib/notification-helpers";
import { trackEvent } from "@/lib/analytics";
import { GETTING_STARTED_COMPLETE_EVENT } from "./GettingStartedWidget";
import type { AppNotification } from "@/lib/types";

/** localStorage key used by GettingStartedWidget to track visibility. */
const GETTING_STARTED_VISIBLE_KEY = "caltodo_getting_started_visible";

/**
 * Simplified notification row — title on left, short date on right.
 * Clicking navigates to the related task if taskId exists.
 *
 * @param notification - The notification data
 * @param onRead - Callback to mark notification as read
 * @param onNavigate - Callback to navigate to the related task
 */
function NotificationRow({
  notification,
  onRead,
  onNavigate,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onNavigate: (taskId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onRead(notification.id);
        if (notification.taskId) {
          onNavigate(notification.taskId);
        }
      }}
      className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-muted/50"
    >
      <p className="text-sm text-foreground truncate flex-1 min-w-0 mr-3">
        {notification.title}
      </p>
      <span className="text-[11px] text-muted-foreground shrink-0">
        {formatShortDate(notification.createdAt)}
      </span>
    </button>
  );
}

/**
 * Empty state displayed when there are no notifications.
 *
 * @param message - Text to display
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Bell size={28} className="mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/**
 * Floating notification center with circular bell button (bottom-right)
 * and an animated slide-up panel. Shows simplified notification rows
 * with title and timestamp only.
 *
 * Renders as a fixed-position overlay — should be placed once in the app layout.
 */
export default function NotificationCenter() {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [earlierExpanded, setEarlierExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const newThisSessionRef = useRef<Set<string>>(new Set());

  // Hidden while Getting Started widget is active
  const [hiddenByWidget, setHiddenByWidget] = useState(true);
  const [bellEntered, setBellEntered] = useState(false);

  // Check localStorage on mount to see if Getting Started is still visible
  useEffect(() => {
    try {
      const widgetVisible = localStorage.getItem(GETTING_STARTED_VISIBLE_KEY) === "true";
      setHiddenByWidget(widgetVisible);
      if (!widgetVisible) {
        // Widget already gone — show bell immediately
        setBellEntered(true);
      }
    } catch {
      setHiddenByWidget(false);
      setBellEntered(true);
    }
  }, []);

  // Listen for Getting Started completion event to reveal bell with animation
  useEffect(() => {
    function handleComplete() {
      setHiddenByWidget(false);
      // Animate in after a brief delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setBellEntered(true));
      });
    }
    window.addEventListener(GETTING_STARTED_COMPLETE_EVENT, handleComplete);
    return () => window.removeEventListener(GETTING_STARTED_COMPLETE_EVENT, handleComplete);
  }, []);

  const hideOnChat = pathname.startsWith("/app/discussions");

  /**
   * Opens the notification panel with entry animation.
   * Snapshots unread IDs as "new this session", then marks all as read.
   */
  const openPanel = useCallback(() => {
    const unreadIds = new Set(
      notifications.filter((n) => !n.read).map((n) => n.id),
    );
    newThisSessionRef.current = unreadIds;
    setEarlierExpanded(false);

    setIsVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsOpen(true));
    });
    trackEvent("notification_center_opened", { unread_count: unreadCount });
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, [unreadCount, markAllAsRead, notifications]);

  /**
   * Closes the notification panel with exit animation.
   */
  const closePanel = useCallback(() => {
    setIsOpen(false);
    const timer = setTimeout(() => setIsVisible(false), 200);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Navigates to the inbox with the given task selected, then closes the panel.
   *
   * @param taskId - The task ID to navigate to
   */
  const handleNavigate = useCallback((taskId: string) => {
    closePanel();
    router.push(`/app/inbox?task=${taskId}`);
  }, [closePanel, router]);

  /**
   * Toggles the notification panel open/closed.
   */
  function handleToggle() {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  // Close panel on outside click
  useEffect(() => {
    if (!isVisible) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closePanel();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, closePanel]);

  // Close panel on Escape key
  useEffect(() => {
    if (!isVisible) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isVisible, closePanel]);

  // Split notifications into earlier (already read) and new (unread this session)
  const newNotifications = notifications.filter((n) =>
    newThisSessionRef.current.has(n.id),
  );
  const earlierNotifications = notifications.filter(
    (n) => !newThisSessionRef.current.has(n.id),
  );

  // Hide during onboarding, CalChat, or while Getting Started widget is active
  if (pathname?.startsWith("/app/onboarding") || hideOnChat || hiddenByWidget) return null;

  return (
    <>
      {/* Floating circular bell button — fixed bottom-right */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className={`fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 md:bottom-8 md:right-8 ${
          isOpen
            ? "bg-blue-500 text-white shadow-blue-500/30 scale-95"
            : "bg-card text-foreground border border-border hover:bg-accent hover:shadow-xl hover:scale-105"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          opacity: bellEntered ? 1 : 0,
          transform: bellEntered
            ? isOpen ? "scale(0.95)" : "scale(1)"
            : "scale(0.8) translateY(8px)",
        }}
      >
        {isOpen ? <X size={20} /> : <Bell size={20} />}
        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification panel */}
      {isVisible && (
        <div
          ref={panelRef}
          className={`fixed bottom-34 right-4 z-50 w-[calc(100vw-32px)] md:w-80 max-h-[70vh] rounded-2xl border border-border bg-popover shadow-2xl flex flex-col overflow-hidden md:bottom-[88px] md:right-8 transition-all duration-200 ease-out origin-bottom-right ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <h3 className="text-sm font-semibold text-foreground">
              Notifications
            </h3>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors"
                aria-label="Clear all notifications"
                title="Clear all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState message="No notifications yet" />
            ) : (
              <div>
                {/* New notifications — full opacity, always visible at top */}
                {newNotifications.length > 0 && (
                  <div className="divide-y divide-border">
                    {newNotifications.map((n) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        onRead={markAsRead}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                )}

                {/* "No new" empty state when only earlier exist */}
                {newNotifications.length === 0 && earlierNotifications.length > 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Bell size={24} className="mb-2 opacity-30" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}

                {/* Earlier section — collapsed by default */}
                {earlierNotifications.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setEarlierExpanded((prev) => !prev)}
                      className="w-full flex items-center gap-2 px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${earlierExpanded ? "rotate-180" : ""}`}
                      />
                      {earlierNotifications.length} earlier
                    </button>

                    {earlierExpanded && (
                      <div className="divide-y divide-border opacity-60">
                        {earlierNotifications.map((n) => (
                          <NotificationRow
                            key={n.id}
                            notification={n}
                            onRead={markAsRead}
                            onNavigate={handleNavigate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
