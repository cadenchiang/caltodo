/**
 * Admin access control helpers.
 * Centralizes admin email check for API routes and server components.
 */

import { logger } from "@/lib/logger";

/**
 * The email address of the application administrator.
 * Used by isAdmin() to gate access to /app/admin and /api/admin/* routes.
 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

/**
 * Checks whether a given email belongs to the admin user.
 * Logs admin access for audit traceability.
 *
 * @param email - The email address to check (from supabase auth user)
 * @returns true if the email matches ADMIN_EMAIL, false otherwise
 *
 * @example
 * ```ts
 * const { data: { user } } = await supabase.auth.getUser();
 * if (!isAdmin(user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 * ```
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const result = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  if (result) {
    logger.info("Admin access granted", { email });
  }
  return result;
}
