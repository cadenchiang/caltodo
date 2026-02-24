"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";

/**
 * Shape of a share record returned by the shares API.
 */
interface ShareEntry {
  id: string;
  invitee_email: string;
  copied_task_id: string | null;
  created_at: string;
}

interface InviteSectionProps {
  taskId: string;
}

/**
 * Invite section for sharing a task with classmates by email.
 * Displays an email input, invite button, list of shared emails with
 * remove buttons, and appropriate error states.
 *
 * @param taskId - The task to share
 *
 * @edge_cases
 * - "not_on_caltodo": shows message prompting user to invite classmate to join
 * - "already_shared": shows duplicate share message
 * - "self_invite": shows self-invite blocked message
 * - Network errors: shows generic error message
 */
export default function InviteSection({ taskId }: InviteSectionProps) {
  const [email, setEmail] = useState("");
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingShares, setFetchingShares] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  /**
   * Fetches existing shares for this task on mount.
   */
  const fetchShares = useCallback(async () => {
    try {
      setFetchingShares(true);
      const res = await fetch(`/api/tasks/${taskId}/shares`);
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares ?? []);
      }
    } catch {
      // Non-critical — shares list will just be empty
    } finally {
      setFetchingShares(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  /**
   * Sends an invite to the entered email address.
   * Handles all error codes from the API and updates the shares list.
   */
  async function handleInvite() {
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tasks/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "not_on_caltodo") {
          setError("Not on caltodo yet — send them an invite to join!");
        } else if (data.code === "already_shared") {
          setError("Already shared with this person");
        } else if (data.code === "self_invite") {
          setError("You can't invite yourself");
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      // Success — add to local list and clear input
      if (data.share) {
        setShares((prev) => [...prev, data.share]);
      }
      setEmail("");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Revokes a share by ID and removes it from the local list.
   *
   * @param shareId - The share to revoke
   */
  async function handleRemove(shareId: string) {
    setRemovingId(shareId);
    try {
      const res = await fetch(`/api/tasks/invite/${shareId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShares((prev) => prev.filter((s) => s.id !== shareId));
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setRemovingId(null);
    }
  }

  /**
   * Handles Enter key press in the email input to trigger invite.
   */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      handleInvite();
    }
  }

  return (
    <div className="space-y-2">
      {/* Email input + invite button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input-border bg-transparent text-sm">
          <UserPlus size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            placeholder="Invite by email..."
            className="flex-1 min-w-0 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
          />
        </div>
        <button
          onClick={handleInvite}
          disabled={loading || !email.trim()}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "Invite"
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 px-1">{error}</p>
      )}

      {/* Shared emails list */}
      {!fetchingShares && shares.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {shares.map((share) => (
            <span
              key={share.id}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {share.invitee_email}
              <button
                onClick={() => handleRemove(share.id)}
                disabled={removingId === share.id}
                className="hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                aria-label={`Remove ${share.invitee_email}`}
              >
                {removingId === share.id ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <X size={10} />
                )}
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
