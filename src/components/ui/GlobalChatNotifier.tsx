"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureRealtimeAuth } from "@/lib/supabase/realtime-auth";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { playMessageReceived } from "@/lib/sounds";
import { updateBoardCacheTimestamp } from "@/lib/calchat-cache";
import { MessageCircle, X } from "lucide-react";

/** SessionStorage key shared with useDiscussionBoards for board cache. */
const CACHE_KEY = "discussion_boards_cache_v2";
/** localStorage prefix for per-course mute state. */
const MUTE_KEY_PREFIX = "calchat_muted_";
/** localStorage prefix for last-sent timestamp (set by useCourseChat). */
const SENT_KEY_PREFIX = "calchat_last_sent_";
/** Window in ms to suppress notifications after the user sends a message. */
const SELF_SEND_COOLDOWN_MS = 5000;
/** How long the banner stays visible before auto-dismissing (ms). */
const BANNER_DURATION = 4000;

interface CachedBoard {
  course: { id: string; name: string };
}

/** Data for a single in-app notification banner. */
interface ChatNotification {
  id: number;
  senderName: string;
  courseName: string;
  courseId: string;
  body: string;
  exiting: boolean;
}

/**
 * Reads the user's enrolled course IDs from the discussion boards sessionStorage cache.
 *
 * @returns Array of cached board objects with course info
 */
function getCourseIdsFromCache(): CachedBoard[] {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const entry = JSON.parse(raw);
    return entry.boards ?? [];
  } catch {
    return [];
  }
}

let notifIdCounter = 0;

/**
 * Global component that subscribes to Supabase Realtime for chat messages
 * across ALL the user's courses. Shows an in-app notification banner and
 * plays a receive sound when a new message arrives from another user,
 * unless the user is currently viewing that specific chat.
 *
 * Mounts in the app layout so it persists across page navigation.
 * Skips notifications for muted courses.
 */
export default function GlobalChatNotifier() {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const channelsRef = useRef<RealtimeChannel[]>([]);
  const subscribedIdsRef = useRef<Set<string>>(new Set());
  const userIdRef = useRef<string | null>(null);

  const [notifications, setNotifications] = useState<ChatNotification[]>([]);

  /**
   * Shows an in-app notification banner for an incoming chat message.
   * Auto-dismisses after BANNER_DURATION ms with an exit animation.
   *
   * @param senderName - Display name of the message sender
   * @param courseName - Name of the course/chat
   * @param courseId - Course UUID for navigation
   * @param body - Message body text
   */
  const showNotification = useCallback(
    (senderName: string, courseName: string, courseId: string, body: string) => {
      const id = ++notifIdCounter;
      const truncatedBody = body.length > 80 ? body.slice(0, 80) + "..." : body;

      setNotifications((prev) => [
        ...prev,
        { id, senderName, courseName, courseId, body: truncatedBody, exiting: false },
      ]);

      // Auto-dismiss after duration
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, exiting: true } : n))
        );
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 300);
      }, BANNER_DURATION);
    },
    []
  );

  /**
   * Manually dismisses a notification banner with exit animation.
   *
   * @param id - Notification ID to dismiss
   */
  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, exiting: true } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  }, []);

  /**
   * Navigates to the chat for a notification and dismisses it.
   *
   * @param notif - The notification to act on
   */
  const handleNotificationClick = useCallback(
    (notif: ChatNotification) => {
      dismissNotification(notif.id);
      router.push(
        `/app/discussions/${notif.courseId}?name=${encodeURIComponent(notif.courseName)}`
      );
    },
    [dismissNotification, router]
  );

  /**
   * Subscribes to realtime INSERT events for a set of course IDs.
   * Only creates new subscriptions for courses not already subscribed.
   *
   * @param boards - Array of cached board objects with course info
   * @param supabase - Supabase client instance
   */
  const subscribeToBoards = useCallback(
    async (boards: CachedBoard[], supabase: ReturnType<typeof createClient>) => {
      // Ensure Realtime carries the user's JWT before subscribing,
      // otherwise RLS blocks all postgres_changes events.
      await ensureRealtimeAuth(supabase);

      for (const board of boards) {
        const courseId = board.course.id;
        if (subscribedIdsRef.current.has(courseId)) continue;

        const channel = supabase.channel(`global-notif:${courseId}`);
        channel.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `course_id=eq.${courseId}`,
          },
          (payload) => {
            const msg = payload.new as {
              author_id: string;
              author_name: string | null;
              body: string;
              course_id: string;
            };

            // Skip if user ID not yet resolved (defense-in-depth against race)
            if (!userIdRef.current) return;

            // Skip own messages
            if (msg.author_id === userIdRef.current) return;

            // Secondary defense: skip if user recently sent a message to this
            // course. Covers the edge case where the Realtime event arrives
            // after a quick page navigation changes the pathname but before
            // the author_id filter can catch it (e.g. latency / anonymous ID).
            try {
              const lastSent = parseInt(
                localStorage.getItem(SENT_KEY_PREFIX + courseId) || "0",
              );
              if (Date.now() - lastSent < SELF_SEND_COOLDOWN_MS) return;
            } catch {
              /* localStorage unavailable */
            }

            // Skip if currently viewing this specific chat
            if (pathnameRef.current.includes(courseId)) return;

            // Skip if muted
            try {
              if (localStorage.getItem(MUTE_KEY_PREFIX + courseId) === "true") return;
            } catch { /* localStorage unavailable */ }

            // Update board cache so unread badge increments immediately
            updateBoardCacheTimestamp(courseId, CACHE_KEY);

            // Play receive sound
            playMessageReceived();

            // Show in-app notification banner
            const senderLabel = msg.author_name ?? "Anonymous";
            const courseName = board.course.name ?? "Chat";
            showNotification(senderLabel, courseName, courseId, msg.body);
          }
        );
        channel.subscribe();
        channelsRef.current.push(channel);
        subscribedIdsRef.current.add(courseId);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    const supabase = createClient();

    // Get current user ID before subscribing — prevents race condition where
    // Realtime events arrive before userIdRef is set, causing own messages
    // to trigger notification banners.
    supabase.auth.getUser().then(({ data }) => {
      userIdRef.current = data.user?.id ?? null;
      const boards = getCourseIdsFromCache();
      if (boards.length > 0) {
        subscribeToBoards(boards, supabase);
      }
    });

    // Re-check cache periodically for newly joined courses. 60s is rare enough
    // to be invisible in CPU profiles but still picks up new courses within a
    // minute of joining without needing a manual refresh.
    const interval = setInterval(() => {
      const latest = getCourseIdsFromCache();
      if (latest.length > subscribedIdsRef.current.size) {
        subscribeToBoards(latest, supabase);
      }
    }, 60_000);

    return () => {
      clearInterval(interval);
      channelsRef.current.forEach((ch) => ch.unsubscribe());
      channelsRef.current = [];
      subscribedIdsRef.current.clear();
    };
  }, [subscribeToBoards]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[10002] flex flex-col gap-2 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`pointer-events-auto max-w-sm w-80 rounded-2xl shadow-lg border border-border bg-popover backdrop-blur-sm cursor-pointer transition-all duration-300 ${
            notif.exiting
              ? "opacity-0 -translate-y-2 scale-95"
              : "opacity-100 translate-y-0 scale-100 animate-chat-notif-in"
          }`}
          onClick={() => handleNotificationClick(notif)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNotificationClick(notif);
          }}
        >
          <div className="flex items-start gap-3 p-3.5">
            {/* Icon */}
            <div className="w-9 h-9 rounded-full bg-green-500/15 dark:bg-green-400/15 flex items-center justify-center shrink-0 mt-0.5">
              <MessageCircle size={18} className="text-green-500 dark:text-green-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground truncate">
                  {notif.senderName}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  now
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {notif.courseName}
              </p>
              <p className="text-xs text-secondary-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {notif.body}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(notif.id);
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
