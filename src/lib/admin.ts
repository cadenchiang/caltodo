/**
 * Admin access control helpers.
 * Centralizes admin email check for API routes and server components.
 */

/**
 * The email address of the application administrator.
 * Used by isAdmin() to gate access to /app/admin and /api/admin/* routes.
 */
export const ADMIN_EMAIL = "cadenchiang@berkeley.edu";

/**
 * Checks whether a given email belongs to the admin user.
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
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
