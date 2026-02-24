/**
 * Admin analytics dashboard page.
 * Server component that verifies admin access before rendering.
 * Non-admin users are redirected to /app/inbox.
 * Accessed via direct URL /app/admin (no sidebar link).
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    redirect("/app/inbox");
  }

  return <AdminDashboard />;
}
