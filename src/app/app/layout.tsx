import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { TaskProvider } from "@/contexts/TaskContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { PresenceProvider } from "@/contexts/PresenceContext";
import InboxTour from "@/components/ui/InboxTour";
import NotificationCenter from "@/components/ui/NotificationCenter";
import GettingStartedWidget from "@/components/ui/GettingStartedWidget";
import CanvasTokenExpiredModal from "@/components/ui/CanvasTokenExpiredModal";
import CalChatAnnouncementModal from "@/components/ui/CalChatAnnouncementModal";
import SyncClassesModal from "@/components/ui/SyncClassesModal";
import GlobalChatNotifier from "@/components/ui/GlobalChatNotifier";
import PostHogIdentify from "@/components/PostHogIdentify";

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
      <PostHogIdentify userId={session.user.id} email={email} />
      <ToastProvider>
        <NotificationProvider>
          <PresenceProvider>
          <TaskProvider>
            <InboxTour>
            <Sidebar avatarUrl={avatarUrl} fullName={fullName} email={email} />
            <main suppressHydrationWarning className="flex-1 overflow-hidden p-4 md:p-10 pb-16 md:pb-10 bg-background relative miffy-glow miffy-watermark">
              {children}
            </main>
            <MobileTabBar />
            <NotificationCenter />
            <GettingStartedWidget />
            <CanvasTokenExpiredModal />
            <CalChatAnnouncementModal />
            <SyncClassesModal />
            <GlobalChatNotifier />
            </InboxTour>
          </TaskProvider>
          </PresenceProvider>
        </NotificationProvider>
      </ToastProvider>
    </div>
  );
}
