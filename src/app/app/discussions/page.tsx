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
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboardingStatus({ skipCache: true });
  const [showLocked, setShowLocked] = useState(false);

  // Redirect to first board's chat only after confirming onboarding
  useEffect(() => {
    if (loading || onboardingLoading || !hasCompletedOnboarding || boards.length === 0) return;

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
  }, [boards, loading, onboardingLoading, hasCompletedOnboarding, router]);

  // Show locked modal after a short delay so user sees loading first
  useEffect(() => {
    if (!onboardingLoading && !hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowLocked(true), 800);
      return () => clearTimeout(timer);
    }
  }, [onboardingLoading, hasCompletedOnboarding]);

  // Show ghost skeleton as base content; overlay locked modal after delay
  return (
    <>
      <div id="tour-calchat-page" className="absolute inset-0 flex">
        {/* Sidebar skeleton — chat row placeholders */}
        <div className="hidden md:flex w-72 shrink-0 border-r border-black/30 dark:border-white/20 flex-col">
          <div className="px-4 pt-5 pb-3 shrink-0">
            <div className="h-6 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex-1 px-2 py-1.5 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 rounded bg-muted" />
                  <div className="h-3 w-36 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Center column skeleton — header + bubble placeholders */}
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
      <CalChatLockedModal open={showLocked} onClose={() => router.push("/app/inbox")} />
    </>
  );
}
