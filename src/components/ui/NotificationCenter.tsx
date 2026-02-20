"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  Repeat,
  CheckCircle2,
  X,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatShortDate } from "@/lib/notification-helpers";
import { trackEvent } from "@/lib/analytics";
import type { AppNotification, NotificationType } from "@/lib/types";

/**
 * Returns the appropriate icon for a notification type.
 *
 * @param type - The notification type
 * @returns Lucide icon component sized at 16px
 */
function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "new_assignment":
      return <BookOpen size={16} className="text-blue-500 shrink-0" />;
    case "assignment_updated":
      return <RefreshCw size={16} className="text-amber-500 shrink-0" />;
    case "auto_completed":
      return <CheckCircle2 size={16} className="text-green-500 shrink-0" />;
    case "repeat_spawned":
      return <Repeat size={16} className="text-purple-500 shrink-0" />;
    case "sync_error":
      return <AlertTriangle size={16} className="text-red-500 shrink-0" />;
  }
}

/**
 * Single notification row with step number, timestamp on left, icon, title, description.
 * Clicking navigates to the related task if taskId exists.
 *
 * @param notification - The notification data
 * @param index - 0-based index for step numbering
 * @param onRead - Callback to mark notification as read
 * @param onNavigate - Callback to navigate to the related task
 */
function NotificationRow({
  notification,
  index,
  onRead,
  onNavigate,
}: {
  notification: AppNotification;
  index: number;
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
      className={`w-full text-left px-3 py-3 flex items-start gap-3 transition-colors hover:bg-muted/50 ${
        !notification.read ? "bg-blue-500/5" : ""
      }`}
    >
      {/* Step number */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            !notification.read
              ? "bg-blue-500 text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {index + 1}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Timestamp on left */}
        <p className="text-[10px] text-muted-foreground/70 mb-0.5">
          {formatShortDate(notification.createdAt)}
        </p>

        <div className="flex items-center gap-2">
          <NotificationIcon type={notification.type} />
          <p
            className={`text-sm truncate ${
              !notification.read
                ? "font-semibold text-foreground"
                : "text-foreground"
            }`}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          )}
        </div>

        {notification.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {notification.description}
          </p>
        )}
      </div>
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
 * and an animated slide-up panel. Shows step-numbered notifications
 * with timestamps on the left.
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
  const [tab, setTab] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unread = notifications.filter((n) => !n.read);
  const displayItems = tab === "all" ? notifications : unread;

  /**
   * Opens the notification panel with entry animation.
   */
  const openPanel = useCallback(() => {
    setIsVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsOpen(true));
    });
    trackEvent("notification_center_opened", { unread_count: unreadCount });
  }, [unreadCount]);

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

  // Hide during onboarding
  if (pathname?.startsWith("/app/onboarding")) return null;

  return (
    <>
      {/* Floating circular bell button — fixed bottom-right */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className={`fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 md:bottom-8 md:right-8 ${
          isOpen
            ? "bg-blue-500 text-white shadow-blue-500/30 scale-95"
            : "bg-card text-foreground border border-border hover:bg-accent hover:shadow-xl hover:scale-105"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
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
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Mark all as read"
                  title="Mark all read"
                >
                  <CheckCheck size={14} />
                </button>
              )}
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
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-border shrink-0">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === "all"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTab("unread")}
              className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                tab === "unread"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-muted text-foreground text-[10px] font-semibold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {displayItems.length === 0 ? (
              <EmptyState
                message={
                  tab === "all" ? "No notifications yet" : "All caught up!"
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {displayItems.map((n, i) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    index={i}
                    onRead={markAsRead}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
