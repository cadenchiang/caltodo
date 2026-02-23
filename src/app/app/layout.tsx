import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { TaskProvider } from "@/contexts/TaskContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import InboxTour from "@/components/ui/InboxTour";
import NotificationCenter from "@/components/ui/NotificationCenter";
import CanvasTokenExpiredModal from "@/components/ui/CanvasTokenExpiredModal";
import PensieveAnnouncementModal from "@/components/ui/PensieveAnnouncementModal";
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
          <TaskProvider>
            <InboxTour>
            <Sidebar avatarUrl={avatarUrl} fullName={fullName} email={email} />
            <main className="flex-1 overflow-hidden p-4 md:p-10 pb-16 md:pb-10 dark:bg-black">
              {children}
            </main>
            <MobileTabBar />
            <NotificationCenter />
            <CanvasTokenExpiredModal />
            <PensieveAnnouncementModal />
            </InboxTour>
          </TaskProvider>
        </NotificationProvider>
      </ToastProvider>
    </div>
  );
}
