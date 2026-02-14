import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import { TaskProvider } from "@/contexts/TaskContext";
import { ToastProvider } from "@/contexts/ToastContext";

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
    <div className="flex h-screen">
      <ToastProvider>
        <TaskProvider>
          <Sidebar avatarUrl={avatarUrl} fullName={fullName} email={email} />
          <main className="flex-1 overflow-auto p-10 dark:bg-black">
            {children}
          </main>
        </TaskProvider>
      </ToastProvider>
    </div>
  );
}
