import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { TaskProvider } from "@/contexts/TaskContext";
import { ToastProvider } from "@/contexts/ToastContext";

import { PresenceProvider } from "@/contexts/PresenceContext";

import GettingStartedWidget from "@/components/ui/GettingStartedWidget";
import CanvasTokenExpiredModal from "@/components/ui/CanvasTokenExpiredModal";
import CalChatAnnouncementModal from "@/components/ui/CalChatAnnouncementModal";
import SyncClassesModal from "@/components/ui/SyncClassesModal";
import GlobalChatNotifier from "@/components/ui/GlobalChatNotifier";
import NewAssignmentsModal from "@/components/ui/NewAssignmentsModal";
import PostHogIdentify from "@/components/PostHogIdentify";
import PostHogPageView from "@/components/PostHogPageView";

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
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const avatarUrl = session.user.user_metadata?.avatar_url ?? null;
  const fullName = session.user.user_metadata?.full_name ?? null;
  const email = session.user.email ?? null;

  return (
    <div className="flex flex-col md:flex-row h-dvh">
      <PostHogIdentify userId={session.user.id} email={email} fullName={fullName} />
      <PostHogPageView />
      <ToastProvider>
          <PresenceProvider>
          <TaskProvider>
            <Sidebar avatarUrl={avatarUrl} fullName={fullName} email={email} />
            <main
              suppressHydrationWarning
              className="flex-1 overflow-hidden px-4 md:px-10 pb-16 md:pb-10 bg-background relative miffy-glow miffy-watermark"
              style={{
                // Reserve space for the iOS status bar + home indicator when
                // launched as a standalone PWA. In a regular browser
                // env(safe-area-inset-*) is 0, so no visual change there.
                paddingTop: "max(1rem, env(safe-area-inset-top))",
              }}
            >
              {children}
            </main>
            <MobileTabBar />

            <GettingStartedWidget />
            <CanvasTokenExpiredModal />
            <CalChatAnnouncementModal />
            <SyncClassesModal />
            <GlobalChatNotifier />
            <NewAssignmentsModal />
          </TaskProvider>
          </PresenceProvider>
      </ToastProvider>
    </div>
  );
}
