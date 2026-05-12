import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { TaskProvider } from "@/contexts/TaskContext";
import { ToastProvider } from "@/contexts/ToastContext";

import { PresenceProvider } from "@/contexts/PresenceContext";

import CanvasTokenExpiredModal from "@/components/ui/CanvasTokenExpiredModal";
import GlobalChatNotifier from "@/components/ui/GlobalChatNotifier";
import NewAssignmentsModal from "@/components/ui/NewAssignmentsModal";
import TrialBanner from "@/components/ui/TrialBanner";
import HiddenRouteRedirect from "@/components/layout/HiddenRouteRedirect";
import PostHogIdentify from "@/components/PostHogIdentify";
import PostHogPageView from "@/components/PostHogPageView";
import ResumePendingUpgrade from "@/components/auth/ResumePendingUpgrade";

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
    <div className="flex flex-col h-dvh">
      {/*
        Customization fonts used by FontPicker, BoardTitle, and WidgetSettingsModal.
        Scoped to the authenticated app so unauthenticated landing visitors don't
        block render on a 12-family Google Fonts stylesheet they'll never see.
        App Router hoists <link> tags into <head> automatically.
      */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=Manrope:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=Outfit:wght@200;300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&family=Sora:wght@200;300;400;500;600;700&family=Source+Serif+4:wght@300;400;500;600;700&family=Urbanist:wght@200;300;400;500;600;700&family=Varela+Round&display=swap"
        rel="stylesheet"
      />
      <TrialBanner />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
      <PostHogIdentify userId={session.user.id} email={email} fullName={fullName} />
      <PostHogPageView />
      <ToastProvider>
          <PresenceProvider>
          <TaskProvider>
            <Sidebar avatarUrl={avatarUrl} fullName={fullName} email={email} />
            <main
              suppressHydrationWarning
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-10 pt-[max(1rem,env(safe-area-inset-top))] md:pt-[max(2.5rem,env(safe-area-inset-top))] pb-16 md:pb-10 bg-background relative miffy-glow miffy-watermark"
            >
              {children}
            </main>
            <MobileTabBar />

            <HiddenRouteRedirect />
            <ResumePendingUpgrade />
            <CanvasTokenExpiredModal />
            <GlobalChatNotifier />
            <NewAssignmentsModal />
          </TaskProvider>
          </PresenceProvider>
      </ToastProvider>
      </div>
    </div>
  );
}
