"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useIsMobile } from "@/hooks/useMediaQuery";
import CalChatLockedModal from "@/components/ui/CalChatLockedModal";
import CalChatWelcomeModal from "@/components/discussions/CalChatWelcomeModal";
import ChatSidebar from "@/components/discussions/ChatSidebar";
import PageTransition from "@/components/ui/PageTransition";
import { ChatPageSkeleton } from "@/components/discussions/ChatSkeleton";
import { pickInitialRoom } from "@/lib/chat-hide";

/**
 * /app/discussions.
 *
 * Below md this IS the room list, full screen; tapping a room navigates to
 * it and the room's back button returns here. On md and up the list lives
 * beside the room, so this page opens the last (or first) visible room.
 */
export default function DiscussionsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { boards, loading, error, refetch } = useDiscussionBoards();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboardingStatus({ skipCache: true });
  const [showLocked, setShowLocked] = useState(false);
  // useIsMobile reports the server default (desktop) during hydration;
  // wait for a real measurement before deciding whether to redirect.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Desktop: open a room once boards and onboarding are known.
  useEffect(() => {
    if (!mounted || isMobile) return;
    if (loading || onboardingLoading || !hasCompletedOnboarding) return;
    const target = pickInitialRoom(boards);
    if (!target) return;
    router.replace(`/app/discussions/${target.course.id}?name=${encodeURIComponent(target.course.name)}`);
  }, [mounted, isMobile, boards, loading, onboardingLoading, hasCompletedOnboarding, router]);

  // Show the locked modal after a short delay so the user sees loading first
  useEffect(() => {
    if (!onboardingLoading && !hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowLocked(true), 800);
      return () => clearTimeout(timer);
    }
  }, [onboardingLoading, hasCompletedOnboarding]);

  const openRoom = useCallback(
    (courseId: string, courseName: string) => {
      router.push(`/app/discussions/${courseId}?name=${encodeURIComponent(courseName)}`);
    },
    [router],
  );

  const locked = <CalChatLockedModal open={showLocked} onClose={() => router.push("/app/inbox")} />;

  // Mobile: the list is the page.
  if (mounted && isMobile && hasCompletedOnboarding) {
    return (
      <PageTransition>
        <div className="absolute inset-0 flex flex-col">
          <ChatSidebar activeCourseId={null} onChatSelect={openRoom} />
        </div>
        <CalChatWelcomeModal />
        {locked}
      </PageTransition>
    );
  }

  // Desktop (or not yet measured): a boards error needs a way out; otherwise
  // the skeleton until the redirect fires.
  if (error && boards.length === 0 && !loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-sm" role="alert">
          <p className="text-sm font-medium text-foreground">Chat didn&apos;t load</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
        {locked}
      </div>
    );
  }

  if (!loading && hasCompletedOnboarding && boards.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="text-center space-y-1 max-w-sm">
          <p className="text-sm font-medium text-foreground">No chats yet</p>
          <p className="text-sm text-muted-foreground">Your class chats appear here after your first sync.</p>
        </div>
        <CalChatWelcomeModal />
      </div>
    );
  }

  // Desktop with every room hidden: show the list so one can be unhidden.
  if (mounted && !isMobile && !loading && hasCompletedOnboarding && pickInitialRoom(boards) === null) {
    return (
      <PageTransition>
        <div className="absolute inset-0 flex">
          <div className="flex w-72 shrink-0 border-r border-border flex-col">
            <ChatSidebar activeCourseId={null} onChatSelect={openRoom} />
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Every chat is hidden. Open Hidden chats in the list to bring one back.
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <>
      <ChatPageSkeleton />
      {locked}
    </>
  );
}
