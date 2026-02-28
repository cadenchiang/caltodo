"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import CalChatLockedModal from "@/components/ui/CalChatLockedModal";

const MSG_CACHE = "chat_messages_cache_";
const MEM_CACHE = "chat_members_cache_";
const CACHE_TTL = 5 * 60_000;

/**
 * Checks if a fresh cache entry exists.
 *
 * @param key - SessionStorage key
 * @returns true if valid cache exists
 */
function hasFreshCache(key: string): boolean {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return false;
    const entry = JSON.parse(raw);
    return Date.now() - entry.timestamp < CACHE_TTL;
  } catch {
    return false;
  }
}

/**
 * Prefetches messages for a course into sessionStorage.
 *
 * @param courseId - Course UUID
 */
async function prefetchMessages(courseId: string): Promise<void> {
  try {
    const res = await fetch(
      `/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=50`
    );
    if (!res.ok) return;
    const data = await res.json();
    const sorted = [...data].reverse();
    sessionStorage.setItem(
      MSG_CACHE + courseId,
      JSON.stringify({ messages: sorted.slice(0, 200), timestamp: Date.now() })
    );
  } catch { /* silent */ }
}

/**
 * Prefetches members for a course into sessionStorage.
 *
 * @param courseId - Course UUID
 */
async function prefetchMembers(courseId: string): Promise<void> {
  try {
    const res = await fetch(
      `/api/discussions/members?courseId=${encodeURIComponent(courseId)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    sessionStorage.setItem(
      MEM_CACHE + courseId,
      JSON.stringify({ members: data, timestamp: Date.now() })
    );
  } catch { /* silent */ }
}

/**
 * CalChat redirect page.
 * Loads boards, prefetches all chat data, then redirects to the
 * most recently active course chat (first board).
 * Falls back to a loading state if no boards exist yet.
 */
export default function DiscussionsPage() {
  const router = useRouter();
  const { boards, loading } = useDiscussionBoards();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboardingStatus();
  const [showLocked, setShowLocked] = useState(false);

  // Redirect to first board's chat as soon as boards load
  useEffect(() => {
    if (loading || boards.length === 0) return;

    // Prefetch all chats in background
    for (const board of boards) {
      if (!hasFreshCache(MSG_CACHE + board.course.id)) {
        prefetchMessages(board.course.id);
      }
      if (!hasFreshCache(MEM_CACHE + board.course.id)) {
        prefetchMembers(board.course.id);
      }
    }

    // Navigate to last-viewed chat if valid, otherwise first board
    let target = boards[0];
    try {
      const lastCourseId = localStorage.getItem("calchat_last_course");
      if (lastCourseId) {
        const match = boards.find((b) => b.course.id === lastCourseId);
        if (match) target = match;
      }
    } catch { /* ignore */ }

    router.replace(
      `/app/discussions/${target.course.id}?name=${encodeURIComponent(target.course.name)}`
    );
  }, [boards, loading, router]);

  // Show locked modal after a short delay so user sees loading first
  useEffect(() => {
    if (!onboardingLoading && !hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowLocked(true), 800);
      return () => clearTimeout(timer);
    }
  }, [onboardingLoading, hasCompletedOnboarding]);

  // Show loading spinner as base content; overlay locked modal after delay
  return (
    <>
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      </div>
      <CalChatLockedModal open={showLocked} onClose={() => router.push("/app/inbox")} />
    </>
  );
}
