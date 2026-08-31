import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { TaskProvider } from "@/contexts/TaskContext";
import { fetchInitialTasks } from "@/lib/tasks/fetch-initial-tasks";
import { ToastProvider } from "@/contexts/ToastContext";
import { SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";

import { PresenceProvider } from "@/contexts/PresenceContext";

import CanvasTokenExpiredModal from "@/components/ui/CanvasTokenExpiredModal";
// GlobalChatNotifier import removed — CalChat was deleted from the
// product. The notifier file is left on disk but no longer mounted.
import NewAssignmentsModal from "@/components/ui/NewAssignmentsModal";
import HiddenRouteRedirect from "@/components/layout/HiddenRouteRedirect";
import MobileRouteGuard from "@/components/layout/MobileRouteGuard";
import GlobalHealthBanner from "@/components/layout/GlobalHealthBanner";
import RouteHistoryTracker from "@/components/layout/RouteHistoryTracker";
import PostHogIdentify from "@/components/PostHogIdentify";
import PomodoroTitleSync from "@/components/pomodoro/PomodoroTitleSync";
import DeferredFonts from "@/components/layout/DeferredFonts";

/**
 * Prevent search engines from indexing any authenticated app routes.
 * Defense-in-depth alongside robots.txt Disallow for /app/.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Authenticated app layout with sidebar and main content area.
 * Wraps children in TaskProvider so all views share pre-loaded data
 * and tab switching is instant.
 * Middleware handles auth protection; layout verifies as a fallback.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Run the session lookup and the task query concurrently. Both are scoped
  // by the same request cookies, and the task rows are what /app/inbox is
  // actually waiting to paint — fetching them here puts them in the first
  // HTML instead of behind a full hydrate-then-fetch round trip on the
  // client. fetchInitialTasks never throws, so a task-query failure still
  // leaves the session check (and its redirect) intact.
  const [{ data: { session } }, initialTasks] = await Promise.all([
    supabase.auth.getSession(),
    fetchInitialTasks(supabase),
  ]);

  if (!session) {
    redirect("/login");
  }

  const avatarUrl = session.user.user_metadata?.avatar_url ?? null;
  const fullName = session.user.user_metadata?.full_name ?? null;
  const email = session.user.email ?? null;

  return (
    <div className="flex flex-col h-dvh">
      {/*
        Customization fonts used by FontPicker, BoardTitle, and WidgetSettingsModal.
        Scoped to the authenticated app so unauthenticated landing visitors don't
        block render on a 12-family Google Fonts stylesheet they'll never see.
        App Router hoists <link> tags into <head> automatically.
      */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Customization fonts load after first paint (see DeferredFonts) so a
          12-family stylesheet never blocks initial render of the app. */}
      <DeferredFonts />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
      <PostHogIdentify userId={session.user.id} email={email} fullName={fullName} />
      <PomodoroTitleSync />
      <ToastProvider>
          <PresenceProvider>
          <TaskProvider initialTasks={initialTasks}>
            <SpotifyPlayerProvider>
            <Sidebar avatarUrl={avatarUrl} fullName={fullName} email={email} />
            <main
              suppressHydrationWarning
              className="app-main flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-10 pt-[max(1rem,env(safe-area-inset-top))] md:pt-[max(2.5rem,env(safe-area-inset-top))] pb-0 board-wallpaper relative miffy-glow miffy-watermark"
            >
              <GlobalHealthBanner />
              {children}
            </main>
            <MobileTabBar />

            <HiddenRouteRedirect />
            <MobileRouteGuard />
            <RouteHistoryTracker />
            <CanvasTokenExpiredModal />
            {/* GlobalChatNotifier removed with CalChat */}
            <NewAssignmentsModal />
            </SpotifyPlayerProvider>
          </TaskProvider>
          </PresenceProvider>
      </ToastProvider>
      </div>
    </div>
  );
}
