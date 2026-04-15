"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { ChatMessage } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { useCourseChat } from "@/hooks/useCourseChat";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { usePresence } from "@/contexts/PresenceContext";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useChatMembers } from "@/hooks/useChatMembers";
import ChatView from "@/components/discussions/ChatView";
import ChatSidebar from "@/components/discussions/ChatSidebar";
import ChatDetailsSidebar from "@/components/discussions/ChatDetailsSidebar";
import { createClient } from "@/lib/supabase/client";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import CalChatWelcomeModal from "@/components/discussions/CalChatWelcomeModal";
import CalChatLockedModal from "@/components/ui/CalChatLockedModal";
import PageTransition from "@/components/ui/PageTransition";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { stripParentheses, getInitials } from "@/lib/chat-utils";
import GroupAvatar from "@/components/discussions/GroupAvatar";
import { NAME_KEY_PREFIX, MUTE_KEY_PREFIX } from "@/lib/chat-actions";
import { isAdmin as checkIsAdmin } from "@/lib/admin";
import { playMessageReceived } from "@/lib/sounds";

const LAST_CHAT_KEY = "calchat_last_course";


/**
 * Course group chat page with three-column layout.
 * Uses absolute positioning to fill the entire main area edge-to-edge.
 * Manages the active chat as client state so switching is instant.
 */
interface ChatPageClientProps {
  initialCourseId: string;
  /** Latest messages pre-fetched server-side for instant bottom-anchored paint. */
  initialMessages: ChatMessage[];
}

export default function ChatPageClient({ initialCourseId, initialMessages }: ChatPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboardingStatus();
  const initialName = searchParams.get("name") || "Chat";

  // Active chat managed as client state for instant switching
  const [activeCourseId, setActiveCourseId] = useState(initialCourseId);
  const [activeCourseName, setActiveCourseName] = useState(initialName);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const displayName = nameOverride || stripParentheses(activeCourseName);

  const supabaseRef = useRef(createClient());
  /** Tracks message count to detect genuinely new messages (vs initial load). */
  const notifBaselineRef = useRef<number | null>(null);
  const { boards } = useDiscussionBoards();
  const activeBoard = boards.find((b) => b.course.id === activeCourseId);
  const activeMemberCount = activeBoard?.member_count ?? 0;
  const isSystemCourse = activeBoard?.course.source === "system";

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const {
    messages,
    loading,
    hasMore,
    initialFetchDone,
    sending,
    error,
    sendMessage,
    deleteMessage,
    loadMore,
  } = useCourseChat(activeCourseId, {
    isSystemCourse,
    isAdmin,
    // Seed only applies while the user is on the initial SSR room; clearing
    // it on room-switch forces the hook back through sessionStorage/API path.
    initialMessages: activeCourseId === initialCourseId ? initialMessages : undefined,
  });

  const { onlineUserIds } = usePresence();
  const { members: chatMembers } = useChatMembers(activeCourseId);
  const { reactionsMap, toggleReaction } = useMessageReactions(activeCourseId);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(activeCourseId, currentUserId);

  // Per-chat online count: only count members of THIS chat who are online
  const chatOnlineCount = useMemo(() => {
    if (onlineUserIds.size === 0 || chatMembers.length === 0) return 0;
    return chatMembers.filter((m) => onlineUserIds.has(m.user_id)).length;
  }, [onlineUserIds, chatMembers]);

  // Get current user ID and admin status — only once
  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        // UI hint only — server enforces admin in /api/discussions/admin/reveal
        setIsAdmin(checkIsAdmin(user.email));
      }
      setReady(true);
    });
  }, []);

  // Load persisted name override, mute state, and save last-viewed chat
  useEffect(() => {
    try {
      const savedName = localStorage.getItem(NAME_KEY_PREFIX + activeCourseId);
      setNameOverride(savedName);
      const savedMute = localStorage.getItem(MUTE_KEY_PREFIX + activeCourseId);
      setIsMuted(savedMute === "true");
      // Remember this chat for next visit
      localStorage.setItem(LAST_CHAT_KEY, activeCourseId);
    } catch {
      // localStorage unavailable
    }
  }, [activeCourseId]);

  /**
   * Switches to a different chat without full page navigation.
   * Updates state immediately and silently updates the URL bar.
   */
  const handleChatSelect = useCallback(
    (courseId: string, courseName: string) => {
      if (courseId === activeCourseId) return;
      setActiveCourseId(courseId);
      setActiveCourseName(courseName);
      notifBaselineRef.current = null; // Reset so first load of new chat doesn't notify
      const url = `/app/discussions/${courseId}?name=${encodeURIComponent(courseName)}`;
      window.history.replaceState(null, "", url);
    },
    [activeCourseId]
  );

  // Request desktop notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Desktop notifications for new messages from others (suppressed when muted).
  // Gated on initialFetchDone so pre-existing messages never trigger notifications.
  /** Tracks whether notification baseline has been initialized after initial fetch. */
  const notifInitializedRef = useRef(false);
  /** Tracks the timestamp of the last desktop notification for throttling (max 1 per 5s). */
  const lastNotifTimeRef = useRef<number>(0);

  // Reset notification baseline when switching chats
  useEffect(() => {
    notifBaselineRef.current = null;
    notifInitializedRef.current = false;
  }, [activeCourseId]);

  useEffect(() => {
    // Wait for initial fetch to complete before monitoring
    if (!initialFetchDone || messages.length === 0) return;

    // First run after fetch: snapshot baseline without notifying
    if (!notifInitializedRef.current) {
      notifInitializedRef.current = true;
      notifBaselineRef.current = messages.length;
      return;
    }

    // Only notify when messages actually increased beyond baseline
    if (
      notifBaselineRef.current !== null &&
      messages.length <= notifBaselineRef.current
    ) {
      notifBaselineRef.current = messages.length;
      return;
    }

    notifBaselineRef.current = messages.length;

    if (
      isMuted ||
      !currentUserId ||
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      !document.hidden
    ) {
      return;
    }

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.author_id === currentUserId || lastMsg._systemText) return;

    const senderLabel = lastMsg.author_name ?? "Anonymous";
    // Summarize message body: replace image URLs with friendly label
    const imageExt = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    const lines = lastMsg.body.split("\n");
    const textLines = lines.filter((l) => {
      const t = l.trim();
      if (!t.startsWith("http://") && !t.startsWith("https://")) return true;
      try { return !imageExt.test(new URL(t).pathname); } catch { return true; }
    });
    const imageCount = lines.length - textLines.length;
    const textPart = textLines.join(" ").trim();
    let notifBody: string;
    if (textPart && imageCount > 0) {
      notifBody = `${textPart.slice(0, 80)} · ${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
    } else if (imageCount > 0) {
      notifBody = `${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
    } else {
      notifBody = textPart.slice(0, 100);
    }

    // Throttle: max 1 desktop notification per 5 seconds
    const notifNow = Date.now();
    if (notifNow - lastNotifTimeRef.current < 5000) return;
    lastNotifTimeRef.current = notifNow;

    new Notification(`CalTodo — ${senderLabel}`, {
      body: `${displayName}: ${notifBody}`,
      icon: "/icon-light.png",
      tag: `caltodo-chat-${activeCourseId}`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, initialFetchDone]);

  // Play receive sound ONLY for genuinely new real-time messages.
  // Tracks last message ID (not count) to avoid false triggers from
  // initial load, cache hydration, chat switching, or loadMore.
  /** ID of the newest message when baseline was established. */
  const soundLastIdRef = useRef<string | null>(null);
  /** Whether the sound baseline has been initialized after initial fetch. */
  const soundInitializedRef = useRef(false);

  // Reset sound tracking when switching chats
  useEffect(() => {
    soundLastIdRef.current = null;
    soundInitializedRef.current = false;
  }, [activeCourseId]);

  useEffect(() => {
    // Wait for initial fetch to complete before monitoring
    if (!initialFetchDone || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    // First run after fetch: snapshot baseline ID without playing
    if (!soundInitializedRef.current) {
      soundInitializedRef.current = true;
      soundLastIdRef.current = lastMsg.id;
      return;
    }

    // Last message unchanged — no new message appended (e.g. loadMore prepends)
    if (lastMsg.id === soundLastIdRef.current) return;

    soundLastIdRef.current = lastMsg.id;

    // Guard: muted, no user, own message, or system event
    if (isMuted || !currentUserId) return;
    if (lastMsg.author_id === currentUserId || lastMsg._systemText) return;

    playMessageReceived();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, initialFetchDone]);

  // Block access while onboarding status is loading (prevents bypass via network throttle)
  // and when onboarding is confirmed incomplete
  if (onboardingLoading) {
    return (
      <div className="absolute inset-0 flex">
        {/* Sidebar skeleton — hidden on mobile, visible on md+ */}
        <div className="hidden md:flex w-72 shrink-0 border-r border-black/30 dark:border-white/20 flex-col">
          <div className="px-4 pt-5 pb-3 shrink-0">
            <div className="h-6 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex-1 px-2 py-1.5 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/5 rounded bg-muted" />
                  <div className="h-2.5 w-4/5 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Chat skeleton — matches ChatView's loading state */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-black/30 dark:border-white/20 shrink-0">
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex gap-2 animate-pulse ${i % 3 === 0 ? "flex-row-reverse" : ""}`}
              >
                <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
                <div
                  className={`rounded-2xl bg-muted ${
                    i % 3 === 0 ? "w-40" : i % 2 === 0 ? "w-52" : "w-32"
                  } h-9`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <CalChatLockedModal open onClose={() => router.push("/app/inbox")} />
    );
  }

  return (
    <PageTransition>
      <div id="tour-calchat-page" className="absolute inset-0 flex">
        <CalChatWelcomeModal />
      {/* Chat list sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:flex w-72 shrink-0 border-r border-black/30 dark:border-white/20 flex-col">
        <ChatSidebar
          activeCourseId={activeCourseId}
          onChatSelect={handleChatSelect}
        />
      </div>

      {/* Center: header + chat */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {/* Header bar — text updates in place on chat switch (no keyframe
            animation, which previously flashed invisible for the 40ms delay). */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-black/30 dark:border-white/20 shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer md:hidden"
            title="Back to all chats"
          >
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          {isSystemCourse ? (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Users size={14} className="text-muted-foreground" />
            </div>
          ) : (
            <div className="shrink-0">
              <GroupAvatar
                initials={getInitials(displayName)}
                name={displayName}
                size={28}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {displayName}
            </h1>
            <p className="text-[11px] font-medium h-[16px] text-muted-foreground/40 dark:text-muted-foreground/70">
              {activeMemberCount > 0 && <span>{activeMemberCount} members · </span>}
              {chatOnlineCount > 0
                ? <span className="text-green-500">{chatOnlineCount} online</span>
                : "0 online"
              }
            </p>
          </div>
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="View details"
          >
            <Users size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Chat area — wait for user ID before rendering to avoid flicker.
            No key/animation here: useCourseChat already does stale-while-
            revalidate via chatCache, so cached chats appear instantly and
            ChatView has its own skeleton for first-time loads. */}
        <div className="flex-1 min-h-0 flex flex-col">
          {ready ? (
            <ChatView
              messages={messages}
              loading={loading}
              hasMore={hasMore}
              initialFetchDone={initialFetchDone}
              sending={sending}
              error={error}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              reactionsMap={reactionsMap}
              onSend={sendMessage}
              onDelete={deleteMessage}
              onToggleReaction={toggleReaction}
              onLoadMore={loadMore}
              typingUsers={typingUsers}
              onTyping={startTyping}
              onSendComplete={stopTyping}
            />
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Mobile: details panel as full-screen overlay inside center column */}
        {showDetails && (
          <div className="absolute inset-0 z-30 md:hidden bg-white dark:bg-zinc-900">
            <ChatDetailsSidebar
              courseId={activeCourseId}
              courseName={stripParentheses(activeCourseName)}
              onlineUserIds={onlineUserIds}
              onClose={() => setShowDetails(false)}
              onNameOverride={(name) => setNameOverride(name)}
              onMuteChange={(muted) => setIsMuted(muted)}
              isSystemCourse={isSystemCourse}
            />
          </div>
        )}
      </div>

      {/* Desktop: right details sidebar — animated width */}
      <div
        className={`hidden md:block shrink-0 overflow-hidden transition-all duration-300 border-l border-black/30 dark:border-white/20 ${
          showDetails ? "w-80" : "w-0 border-l-0"
        }`}
      >
        {showDetails && (
          <div className="w-80 h-full">
            <ChatDetailsSidebar
              courseId={activeCourseId}
              courseName={stripParentheses(activeCourseName)}
              onlineUserIds={onlineUserIds}
              onClose={() => setShowDetails(false)}
              onNameOverride={(name) => setNameOverride(name)}
              onMuteChange={(muted) => setIsMuted(muted)}
              isSystemCourse={isSystemCourse}
            />
          </div>
        )}
        </div>
      </div>
    </PageTransition>
  );
}
