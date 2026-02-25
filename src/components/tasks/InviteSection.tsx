"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "@/components/ui/UserAvatar";

/**
 * Enriched share record returned by the shares API.
 */
interface ShareEntry {
  id: string;
  invitee_email: string;
  invitee_name: string | null;
  invitee_avatar_url: string | null;
  status: string;
  copied_task_id: string | null;
  created_at: string;
}

/**
 * User search result from the autocomplete API.
 */
interface SearchUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface InviteSectionProps {
  taskId: string;
}

/**
 * Google Calendar-style guest picker for sharing tasks.
 * Collapsed state shows "Add guests" trigger. Expanded state shows
 * a search input with debounced autocomplete dropdown showing user
 * avatars, names, and emails. Existing guests appear as chips with
 * avatar, name, and remove button.
 *
 * @param taskId - The task to share
 *
 * @edge_cases
 * - "not_on_caltodo": inline error when email not found
 * - "already_shared": inline error for duplicate invite
 * - "self_invite": inline error blocking self-invite
 * - Raw email fallback: "Invite {email}" option when query has "@" and no matches
 * - Escape / click-outside: collapses the search input
 */
export default function InviteSection({ taskId }: InviteSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fetchingShares, setFetchingShares] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

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

  // Search users when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    async function search() {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          // Filter out already-invited users
          const invitedIds = new Set(shares.map((s) => s.invitee_email));
          const filtered = (data.users ?? []).filter(
            (u: SearchUser) => !invitedIds.has(u.email)
          );
          setSuggestions(filtered);
        }
      } catch {
        // Non-critical
      } finally {
        if (!cancelled) setSearching(false);
      }
    }

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery, shares]);

  // Focus input when expanded
  useEffect(() => {
    if (expanded) {
      inputRef.current?.focus();
    }
  }, [expanded]);

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setQuery("");
        setSuggestions([]);
        setError(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  /**
   * Invites a user by email. Called when selecting a suggestion or pressing Enter.
   *
   * @param email - The invitee's email address
   */
  async function handleInvite(email: string) {
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
        if (data.code === "already_shared") {
          setError("Already shared with this person");
        } else if (data.code === "self_invite") {
          setError("You can't invite yourself");
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      if (data.share) {
        setShares((prev) => [...prev, data.share]);
      }
      setQuery("");
      setSuggestions([]);
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
   * Handles keyboard events in the search input.
   * Enter invites the first suggestion or raw email.
   * Escape collapses the picker.
   */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setExpanded(false);
      setQuery("");
      setSuggestions([]);
      setError(null);
      return;
    }
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleInvite(suggestions[0].email);
      } else if (query.includes("@")) {
        handleInvite(query);
      }
    }
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Guest chips (always visible when there are shares) */}
      {!fetchingShares && shares.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {shares.map((share) => (
            <span
              key={share.id}
              className="inline-flex items-center gap-1.5 text-xs font-medium pl-1 pr-2 py-0.5 rounded-full border border-border bg-muted/50"
            >
              <UserAvatar
                url={share.invitee_avatar_url}
                name={share.invitee_name}
                email={share.invitee_email}
                size={18}
              />
              <span className="text-foreground truncate max-w-[120px]">
                {share.invitee_name || share.invitee_email}
              </span>
              {share.status === "pending" && (
                <span className="text-[9px] text-amber-500 font-medium">pending</span>
              )}
              {share.status === "deferred" && (
                <span
                  className="text-[9px] text-blue-500 font-medium cursor-help"
                  title="They'll see this when they join caltodo"
                >
                  invited
                </span>
              )}
              <button
                onClick={() => handleRemove(share.id)}
                disabled={removingId === share.id}
                className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
                aria-label={`Remove ${share.invitee_name || share.invitee_email}`}
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

      {/* Collapsed trigger */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <UserPlus size={14} />
          Add guests
        </button>
      )}

      {/* Expanded search input + dropdown */}
      {expanded && (
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input-border bg-transparent text-sm">
            <UserPlus size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setError(null); }}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or email..."
              className="flex-1 min-w-0 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
            />
            {(loading || searching) && (
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 px-1 mt-1">{error}</p>
          )}

          {/* Autocomplete dropdown */}
          {(suggestions.length > 0 || (query.includes("@") && query.length >= 3 && suggestions.length === 0 && !searching)) && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg border border-border bg-popover shadow-xl overflow-hidden max-h-[200px] overflow-y-auto">
              {suggestions.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleInvite(user.email)}
                  disabled={loading}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <UserAvatar
                    url={user.avatar_url}
                    name={user.full_name}
                    email={user.email}
                    size={28}
                  />
                  <div className="flex-1 min-w-0">
                    {user.full_name && (
                      <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </button>
              ))}
              {/* Raw email fallback when no suggestions match */}
              {suggestions.length === 0 && query.includes("@") && query.length >= 3 && !searching && (
                <button
                  type="button"
                  onClick={() => handleInvite(query)}
                  disabled={loading}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <UserPlus size={16} className="text-muted-foreground ml-1.5" />
                  <span className="text-sm text-foreground">
                    Invite <span className="font-medium">{query}</span>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
