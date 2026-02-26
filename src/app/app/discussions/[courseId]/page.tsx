"use client";

import { use, useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users, X } from "lucide-react";
import { useCourseChat } from "@/hooks/useCourseChat";
import ChatView from "@/components/discussions/ChatView";
import MemberList from "@/components/discussions/MemberList";
import ChatSidebar from "@/components/discussions/ChatSidebar";
import { createClient } from "@/lib/supabase/client";

/**
 * Strips parenthetical content from a course name.
 * e.g. "CS 61A (Spring 2026)" -> "CS 61A"
 *
 * @param name - The raw course name
 * @returns Cleaned course name
 */
function stripParentheses(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

/**
 * Thin loading bar at the top that reflects actual load progress.
 * Quickly fills to ~80%, then completes when `done` becomes true.
 *
 * @param done - Set to true when loading finishes to fill to 100% and fade out
 */
function LoadingBar({ done }: { done: boolean }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Kick off to 20% immediately
    setProgress(20);
    setVisible(true);

    // Creep toward 80% over time
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 80) return p;
        return p + (80 - p) * 0.1;
      });
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (done) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [done]);

  if (!visible) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-0.5 z-20 overflow-hidden">
      <div
        className="h-full bg-[#007AFF] origin-left transition-transform duration-300 ease-out"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}

/**
 * Course group chat page with three-column layout.
 * Uses absolute positioning to fill the entire main area edge-to-edge.
 * Manages the active chat as client state so switching is instant.
 */
interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseChatPage({ params }: PageProps) {
  const { courseId: initialCourseId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") || "Chat";

  // Active chat managed as client state for instant switching
  const [activeCourseId, setActiveCourseId] = useState(initialCourseId);
  const [activeCourseName, setActiveCourseName] = useState(initialName);
  const displayName = stripParentheses(activeCourseName);

  const {
    messages,
    loading,
    hasMore,
    initialFetchDone,
    sending,
    error,
    onlineUsers,
    sendMessage,
    loadMore,
  } = useCourseChat(activeCourseId);

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [ready, setReady] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const supabaseRef = useRef(createClient());

  // Get current user ID for message ownership — only once
  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
      setReady(true);
    });
  }, []);

  /**
   * Switches to a different chat without full page navigation.
   * Updates state immediately and silently updates the URL bar.
   */
  const handleChatSelect = useCallback(
    (courseId: string, courseName: string) => {
      if (courseId === activeCourseId) return;
      setActiveCourseId(courseId);
      setActiveCourseName(courseName);
      const url = `/app/discussions/${courseId}?name=${encodeURIComponent(courseName)}`;
      window.history.replaceState(null, "", url);
    },
    [activeCourseId]
  );

  // Build online user IDs set for MemberList
  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.user_id)),
    [onlineUsers]
  );

  // Request desktop notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Desktop notifications for new messages from others
  useEffect(() => {
    if (
      messages.length > 0 &&
      currentUserId &&
      "Notification" in window &&
      Notification.permission === "granted" &&
      document.hidden
    ) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.author_id !== currentUserId) {
        new Notification(`${lastMsg.author_name ?? "Someone"} in ${displayName}`, {
          body: lastMsg.body.slice(0, 100),
          icon: lastMsg.author_avatar ?? "/icon-light.png",
          tag: `chat-${activeCourseId}`,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Show loading bar while chat data or user ID is loading
  const isLoading = !ready || (loading && messages.length === 0);
  const loadingDone = ready && !loading;

  return (
    <div className="absolute inset-0 flex">
      {/* Chat list sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:flex w-72 shrink-0 border-r border-black/30 dark:border-white/20 flex-col">
        <ChatSidebar
          activeCourseId={activeCourseId}
          onChatSelect={handleChatSelect}
        />
      </div>

      {/* Center: header + chat */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {/* Loading bar */}
        {isLoading && <LoadingBar done={loadingDone} />}

        {/* Header bar */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-black/30 dark:border-white/20 shrink-0">
          <button
            onClick={() => router.push("/app/discussions")}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer md:hidden"
            title="Back to all chats"
          >
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {displayName}
            </h1>
            <p className="text-[11px] font-medium h-[16px] text-muted-foreground/40">
              {onlineUsers.length > 0
                ? <span className="text-green-500">{onlineUsers.length} online</span>
                : "– online"
              }
            </p>
          </div>
          <button
            onClick={() => setShowMembers(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="View members"
          >
            <Users size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Chat area — wait for user ID before rendering to avoid flicker */}
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
              onSend={sendMessage}
              onLoadMore={loadMore}
            />
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>

      {/* Members modal */}
      {showMembers && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowMembers(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

          {/* Modal */}
          <div
            className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-[340px] max-h-[70vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-base font-semibold text-foreground">Members</h2>
              <button
                onClick={() => setShowMembers(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Member list */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <MemberList courseId={activeCourseId} onlineUserIds={onlineUserIds} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
