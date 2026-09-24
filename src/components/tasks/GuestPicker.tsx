"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Send, UserPlus, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "@/components/ui/UserAvatar";

/**
 * User search result from the autocomplete API.
 */
interface SearchUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface GuestPickerProps {
  /** Currently selected guest emails. */
  selectedEmails: string[];
  /** Called when the email list changes (add or remove). */
  onEmailsChange: (emails: string[]) => void;
}

/**
 * Guest picker matching the modal icon+text row pattern exactly.
 * Collapsed: Send icon + "Send assignment" placeholder (same style as "Add description").
 * Expanded: Send icon + search input in-place (same position, same font).
 * Guest chips appear above the row, aligned with the text column.
 *
 * @param selectedEmails - Array of currently selected email strings
 * @param onEmailsChange - Callback when emails are added or removed
 */
export default function GuestPicker({ selectedEmails, onEmailsChange }: GuestPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 150);

  // Focus input when expanded
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  // Search users when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    let cancelled = false;

    async function search() {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const alreadySelected = new Set(selectedEmails);
          setSuggestions(
            (data.users ?? []).filter((u: SearchUser) => !alreadySelected.has(u.email))
          );
        }
      } catch {
        // Non-critical
      } finally {
        if (!cancelled) setSearching(false);
      }
    }

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery, selectedEmails]);

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setQuery("");
        setSuggestions([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  /**
   * Adds an email to the selected list and clears the search.
   *
   * @param email - Email to add
   */
  function addEmail(email: string) {
    const trimmed = email.trim();
    if (!trimmed || selectedEmails.includes(trimmed)) return;
    onEmailsChange([...selectedEmails, trimmed]);
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  }

  /**
   * Removes an email from the selected list.
   *
   * @param email - Email to remove
   */
  function removeEmail(email: string) {
    onEmailsChange(selectedEmails.filter((e) => e !== email));
  }

  /**
   * Handles keyboard events in the search input.
   * Enter adds the first suggestion or raw email. Escape collapses.
   */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setExpanded(false);
      setQuery("");
      setSuggestions([]);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (suggestions.length > 0) {
        addEmail(suggestions[0].email);
      } else if (query.includes("@") && query.length >= 3) {
        addEmail(query);
      }
    }
  }

  return (
    <div ref={containerRef}>
      {/* Guest chips — aligned with text column, smooth height transition */}
      <div
        className="flex flex-wrap gap-1.5 px-4 overflow-hidden transition-all duration-200 ease-out"
        style={{
          paddingLeft: "52px",
          maxHeight: selectedEmails.length > 0 ? "200px" : "0px",
          marginBottom: selectedEmails.length > 0 ? "4px" : "0px",
          opacity: selectedEmails.length > 0 ? 1 : 0,
        }}
      >
        {selectedEmails.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1 text-xs font-medium pl-2 pr-1 py-0.5 rounded-full border border-border bg-muted/50 text-foreground animate-in fade-in zoom-in-95 duration-150"
          >
            <span className="truncate max-w-[120px]">{email}</span>
            <button
              type="button"
              onClick={() => removeEmail(email)}
              className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
              aria-label={`Remove ${email}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>

      {/* Main row — identical structure to description/date/tags rows */}
      <div className="relative">
        <div
          className={`flex items-center gap-4 px-4 py-3 ${!expanded ? "cursor-text" : ""}`}
          onClick={() => !expanded && setExpanded(true)}
        >
          <Send size={20} className="shrink-0 text-muted-foreground" />
          {expanded ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name or email..."
                className="flex-1 min-w-0 text-sm text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none"
              />
              {searching && (
                <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground/60">
              {selectedEmails.length > 0 ? `${selectedEmails.length} guest(s)` : "Send assignment"}
            </span>
          )}
        </div>

        {/* Autocomplete dropdown */}
        {expanded && (suggestions.length > 0 || (query.includes("@") && query.length >= 3 && suggestions.length === 0 && !searching)) && (
          <div
            className="absolute right-4 top-full mt-1 z-[60] rounded-lg border border-border bg-popover shadow-xl overflow-hidden max-h-[200px] overflow-y-auto"
            style={{ left: "52px" }}
          >
            {suggestions.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => addEmail(user.email)}
                className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-accent transition-colors"
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
                onClick={() => addEmail(query)}
                className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-accent transition-colors"
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
    </div>
  );
}
