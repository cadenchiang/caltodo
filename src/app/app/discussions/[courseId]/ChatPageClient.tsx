"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { ChatMessage } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCourseChat } from "@/hooks/useCourseChat";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { useRoomPresence } from "@/hooks/useRoomPresence";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useChatMembers } from "@/hooks/useChatMembers";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useRoomNotifications } from "@/hooks/useRoomNotifications";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useToast } from "@/contexts/ToastContext";
import ChatView from "@/components/discussions/ChatView";
import ChatSidebar from "@/components/discussions/ChatSidebar";
import ChatDetailsSidebar from "@/components/discussions/ChatDetailsSidebar";
import ChatRoomHeader from "@/components/discussions/ChatRoomHeader";
import CalChatWelcomeModal from "@/components/discussions/CalChatWelcomeModal";
import { ChatPageSkeleton } from "@/components/discussions/ChatSkeleton";
import CalChatLockedModal from "@/components/ui/CalChatLockedModal";
import PageTransition from "@/components/ui/PageTransition";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { stripParentheses } from "@/lib/chat-utils";
import { NAME_KEY_PREFIX, LAST_CHAT_KEY, isChatMuted } from "@/lib/chat-actions";
import { isAdmin as checkIsAdmin } from "@/lib/admin";

/**
 * Props for the room page client.
 *
 * @param initialCourseId - Room from the URL
 * @param initialMessages - Latest messages pre-fetched server-side
 * @param initialAuthorKey - Viewer's author key for the room, from the server
 */
interface ChatPageClientProps {
  initialCourseId: string;
  initialMessages: ChatMessage[];
  initialAuthorKey: string | null;
}

/**
 * Course group chat page. Desktop: list, room, optional details panel.
 * Mobile: the room full screen with a back button to the list. The active
 * room is client state so switching in the list is instant; the URL is
 * updated with replaceState. The title comes from the loaded boards (or a
 * per-device nickname); the ?name= query is only a first-paint hint.
 */
export default function ChatPageClient({ initialCourseId, initialMessages, initialAuthorKey }: ChatPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboardingStatus();

  const [activeCourseId, setActiveCourseId] = useState(initialCourseId);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { boards } = useDiscussionBoards();
  const activeBoard = boards.find((b) => b.course.id === activeCourseId);
  const isSystemCourse = activeBoard?.course.source === "system";
  const hintName = searchParams.get("name");
  const boardName = activeBoard?.course.name ?? hintName ?? "Chat";
  const displayName = nameOverride || (isSystemCourse ? boardName : stripParentheses(boardName));

  const chat = useCourseChat(activeCourseId, {
    initialMessages: activeCourseId === initialCourseId ? initialMessages : undefined,
    initialAuthorKey: activeCourseId === initialCourseId ? initialAuthorKey : undefined,
    currentUserId,
    currentUserName,
  });
  const { members } = useChatMembers(activeCourseId);
  const { reactionsMap, toggleReaction } = useMessageReactions(activeCourseId, chat.messages);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(activeCourseId, currentUserId, currentUserName);
  const presentIds = useRoomPresence(activeCourseId, currentUserId);
  const { blockedKeys } = useBlockedUsers(activeCourseId);

  const visibleMessages = useMemo(
    () => (blockedKeys.size === 0 ? chat.messages : chat.messages.filter((m) => !blockedKeys.has(m.author_key))),
    [chat.messages, blockedKeys],
  );

  useRoomNotifications(activeCourseId, visibleMessages, chat.initialFetchDone, chat.myAuthorKey, isMuted, displayName);

  // Identity once (cached, no network)
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUserId(user.id);
        setCurrentUserName(user.user_metadata?.full_name ?? null);
        // UI hint only: the server enforces admin in /api/discussions/admin/reveal
        setIsAdmin(checkIsAdmin(user.email));
      }
      setReady(true);
    });
  }, []);

  // Per-room device state: nickname, mute (system rooms muted by default), last room
  useEffect(() => {
    try {
      setNameOverride(localStorage.getItem(NAME_KEY_PREFIX + activeCourseId));
      localStorage.setItem(LAST_CHAT_KEY, activeCourseId);
    } catch { /* localStorage unavailable */ }
    setIsMuted(isChatMuted(activeCourseId, isSystemCourse ?? false));
  }, [activeCourseId, isSystemCourse]);

  /** Switches rooms without a page navigation; the URL follows silently. */
  const handleChatSelect = useCallback((courseId: string, courseName: string) => {
    if (courseId === activeCourseId) return;
    setActiveCourseId(courseId);
    setShowDetails(false);
    window.history.replaceState(null, "", `/app/discussions/${courseId}?name=${encodeURIComponent(courseName)}`);
  }, [activeCourseId]);

  const onReported = useCallback(() => showToast("Thanks, an admin will take a look."), [showToast]);

  if (onboardingLoading) return <ChatPageSkeleton />;
  if (!hasCompletedOnboarding) return <CalChatLockedModal open onClose={() => router.push("/app/inbox")} />;

  const details = (
    <ChatDetailsSidebar
      courseId={activeCourseId}
      courseName={isSystemCourse ? boardName : stripParentheses(boardName)}
      onlineUserIds={presentIds}
      onClose={() => setShowDetails(false)}
      onNameOverride={setNameOverride}
      onMuteChange={setIsMuted}
      isSystemCourse={isSystemCourse}
    />
  );

  return (
    <PageTransition>
      <div className="absolute inset-0 flex">
        <div className="hidden md:flex w-72 shrink-0 border-r border-border flex-col">
          <ChatSidebar activeCourseId={activeCourseId} onChatSelect={handleChatSelect} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col relative">
          <ChatRoomHeader
            displayName={displayName}
            isSystemCourse={isSystemCourse ?? false}
            memberCount={activeBoard?.member_count ?? members.length}
            hereCount={presentIds.size}
            detailsOpen={showDetails}
            onToggleDetails={() => setShowDetails((v) => !v)}
          />

          <div className="flex-1 min-h-0 flex flex-col">
            {ready ? (
              <ChatView
                courseId={activeCourseId}
                messages={visibleMessages}
                loading={chat.loading}
                hasMore={chat.hasMore}
                initialFetchDone={chat.initialFetchDone}
                sending={chat.sending}
                error={chat.error}
                currentUserId={currentUserId}
                myAuthorKey={chat.myAuthorKey}
                members={members}
                isAdmin={isAdmin}
                reactionsMap={reactionsMap}
                notMember={chat.notMember}
                online={chat.online}
                onSend={chat.sendMessage}
                onRetry={chat.retryMessage}
                onDelete={chat.deleteMessage}
                onRefetch={chat.refetch}
                onToggleReaction={toggleReaction}
                onLoadMore={chat.loadMore}
                onReported={onReported}
                typingUsers={typingUsers}
                onTyping={startTyping}
                onSendComplete={stopTyping}
              />
            ) : (
              <div className="flex-1" />
            )}
          </div>

          {showDetails && <div className="absolute inset-0 z-30 md:hidden bg-card">{details}</div>}
        </div>

        <div className={`hidden md:block shrink-0 overflow-hidden transition-[width] duration-300 motion-reduce:transition-none border-l border-border ${showDetails ? "w-80" : "w-0 border-l-0"}`}>
          {showDetails && <div className="w-80 h-full">{details}</div>}
        </div>
      </div>
      <CalChatWelcomeModal />
    </PageTransition>
  );
}
