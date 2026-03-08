"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { AppNotification, NotificationType } from "@/lib/types";
import {
  generateNotificationId,
  isDuplicateNotification,
} from "@/lib/notification-helpers";
import { trackEvent } from "@/lib/analytics";

/** localStorage key for notification persistence. */
const STORAGE_KEY = "caltodo_notifications";
const STORAGE_VERSION = 1;
const MAX_NOTIFICATIONS = 50;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoredNotifications {
  version: number;
  items: AppNotification[];
}

/**
 * Reads notifications from localStorage.
 * Returns empty array if missing, corrupt, or version-mismatched.
 */
function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: StoredNotifications = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION) return [];
    return parsed.items;
  } catch {
    return [];
  }
}

/**
 * Writes notifications to localStorage.
 * Silently fails if storage is unavailable.
 */
function saveNotifications(items: AppNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    const data: StoredNotifications = { version: STORAGE_VERSION, items };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      console.warn("[NotificationContext] localStorage quota exceeded — notifications not persisted");
    }
  }
}

/**
 * Prunes expired notifications (older than TTL) and trims to max count.
 *
 * @param items - Notifications to prune
 * @returns Pruned array, newest first
 */
function pruneNotifications(items: AppNotification[]): AppNotification[] {
  const cutoff = Date.now() - TTL_MS;
  return items
    .filter((n) => new Date(n.createdAt).getTime() > cutoff)
    .slice(0, MAX_NOTIFICATIONS);
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  pendingInviteCount: number;
  setPendingInviteCount: (count: number) => void;
  addNotification: (
    type: NotificationType,
    title: string,
    description?: string | null,
    taskId?: string | null,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/**
 * Provides notification state with localStorage persistence.
 * Prunes expired/overflow notifications on mount.
 * Must be rendered outside TaskProvider so TaskProvider can call addNotification.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);

  // Load + prune on mount
  useEffect(() => {
    const loaded = pruneNotifications(loadNotifications());
    setNotifications(loaded);
    saveNotifications(loaded);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length + pendingInviteCount;

  const addNotification = useCallback(
    (
      type: NotificationType,
      title: string,
      description: string | null = null,
      taskId: string | null = null,
    ) => {
      setNotifications((prev) => {
        if (isDuplicateNotification(prev, type, taskId)) return prev;

        const notification: AppNotification = {
          id: generateNotificationId(),
          type,
          title,
          description,
          taskId,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updated = pruneNotifications([notification, ...prev]);
        saveNotifications(updated);
        trackEvent("notification_created", { type });
        return updated;
      });
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      saveNotifications(updated);
      trackEvent("notification_clicked", { notification_id: id });
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      trackEvent("notifications_marked_read", { count: prev.filter((n) => !n.read).length });
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
    trackEvent("notifications_cleared");
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        pendingInviteCount,
        setPendingInviteCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access the notification context.
 * Must be used within a NotificationProvider.
 *
 * @returns NotificationContextValue with notifications list and action methods
 */
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}
