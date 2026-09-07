import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { TaskProvider } from "@/contexts/TaskContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { UndoProvider } from "@/contexts/UndoContext";
import { LabelColorsProvider } from "@/contexts/LabelColorsContext";
import CredentialsSeed from "@/components/CredentialsSeed";
import { loadCredentials } from "@/lib/credentials-loader";
import { fetchLabelColors } from "@/lib/label-colors-store";
import { loadInitialTasks } from "@/lib/tasks-loader";
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
  // getUser() verifies the JWT with the Auth server; getSession() only reads
  // the cookie. This IS the gate for /app/**: the proxy only runs on "/" and
  // "/login" (see src/proxy.ts), so nothing upstream has verified this
  // request. A forged cookie must fail here, not be trusted for a name.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Preload what every /app page needs, in parallel, while the HTML is still
  // being produced. Before this the client fetched each of these after
  // hydration, ~0.5s after the HTML had already arrived, and the list could
  // not draw until the tasks came back. A failed preload degrades to the old
  // path: the providers fetch on the client as they always did.
  const [initialTasks, initialCredentials, initialColors] = await Promise.all([
    loadInitialTasks(supabase, user.id),
    loadCredentials(supabase, user.id),
    fetchLabelColors(supabase, user.id).then((m) => [...m.entries()]),
  ]);

  const avatarUrl = user.user_metadata?.avatar_url ?? null;
  const fullName = user.user_metadata?.full_name ?? null;
  const email = user.email ?? null;

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
      <PostHogIdentify userId={user.id} email={email} fullName={fullName} />
      <PomodoroTitleSync />
      <ToastProvider>
        {/* Inside the toasts, because an undo announces itself through one. */}
        <UndoProvider>
        <LabelColorsProvider initialUserId={user.id} initialColors={initialColors}>
          <PresenceProvider>
          <CredentialsSeed credentials={initialCredentials} />
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
        </LabelColorsProvider>
        </UndoProvider>
      </ToastProvider>
      </div>
    </div>
  );
}
