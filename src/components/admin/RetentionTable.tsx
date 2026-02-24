/**
 * Table displaying top users by login frequency.
 * Shows email, total logins, active days, and last login time.
 * Used in the Retention tab of the admin dashboard.
 */

"use client";

interface UserRow {
  email: string;
  totalLogins: number;
  activeDays: number;
  lastLogin: string;
}

interface RetentionTableProps {
  /** Array of user login frequency data, sorted by totalLogins descending */
  users: UserRow[];
}

/**
 * Formats an ISO timestamp into a human-readable relative/absolute string.
 *
 * @param iso - ISO timestamp string
 * @returns Formatted date string (e.g. "2h ago", "Feb 23")
 */
function formatLastLogin(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Renders a table of top users by login frequency.
 *
 * @param props - RetentionTableProps with user login data
 * @returns Styled table element
 */
export default function RetentionTable({ users }: RetentionTableProps) {
  if (users.length === 0) {
    return (
      <div className="glass rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground">
        No login data available
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Top Users by Login Frequency
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium text-right">Logins</th>
              <th className="px-5 py-3 font-medium text-right">
                Active Days
              </th>
              <th className="px-5 py-3 font-medium text-right">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={user.email + idx}
                className="border-t border-border hover:bg-accent/50 transition-colors"
              >
                <td className="px-5 py-3 text-foreground truncate max-w-[200px]">
                  {user.email}
                </td>
                <td className="px-5 py-3 text-right text-foreground tabular-nums">
                  {user.totalLogins}
                </td>
                <td className="px-5 py-3 text-right text-foreground tabular-nums">
                  {user.activeDays}
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground">
                  {formatLastLogin(user.lastLogin)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
