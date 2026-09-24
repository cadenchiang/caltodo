"use client";

import { useEffect, useState } from "react";
import type { PendingInvite, Task } from "@/lib/types";
import UserAvatar from "@/components/ui/UserAvatar";
import Button from "@/components/ui/Button";
import { pendingInviteToPseudoTask } from "@/lib/pending-invite-helpers";
import ListSectionHeader from "./ListSectionHeader";

/** localStorage key remembering whether the section is open. */
const REQUESTS_EXPANDED_KEY = "caltodo_requests_expanded";

interface RequestsSectionProps {
  /** Pending task invitations. */
  invites: PendingInvite[];
  /** Opens the invite as a read-only task preview. */
  onSelect: (task: Task, anchorRect?: DOMRect) => void;
  /** Accept or decline one invite. */
  onRespond?: (shareId: string, action: "accept" | "decline") => void;
  /** Accept every pending invite. */
  onAcceptAll?: () => void;
}

/**
 * Collapsible "Requests" section listing pending task invites with
 * Accept and Decline buttons. Rows stay until the response succeeds; the
 * page removes them and toasts on failure.
 *
 * @param invites - Pending invites (renders nothing when empty)
 * @param onSelect - Row click handler
 * @param onRespond - Accept/decline handler
 * @param onAcceptAll - Bulk accept handler (shown for two or more invites)
 */
export default function RequestsSection({ invites, onSelect, onRespond, onAcceptAll }: RequestsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(REQUESTS_EXPANDED_KEY) === "true") setExpanded(true);
    } catch { /* localStorage unavailable */ }
  }, []);

  if (invites.length === 0) return null;

  /** Toggles the section and remembers the choice. */
  function toggle() {
    const next = !expanded;
    setExpanded(next);
    try { localStorage.setItem(REQUESTS_EXPANDED_KEY, String(next)); } catch { /* ignore */ }
  }

  return (
    <section className="mt-1" aria-label="Requests">
      <ListSectionHeader
        label="Requests"
        count={invites.length}
        countClassName="text-amber-600 dark:text-amber-400 font-medium"
        expanded={expanded}
        onToggle={toggle}
        actions={
          expanded && invites.length > 1 && onAcceptAll ? (
            <Button size="sm" variant="ghost" className="text-blue-600 dark:text-blue-400" onClick={onAcceptAll}>
              Accept all
            </Button>
          ) : undefined
        }
      />
      {expanded && (
        <div className="space-y-1 mt-0.5">
          {invites.map((invite) => (
            <div key={invite.shareId} className="mx-1 md:mx-2 rounded-xl border border-border bg-card">
              <button
                type="button"
                className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 text-left hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none rounded-t-xl transition-colors"
                onClick={(e) => onSelect(pendingInviteToPseudoTask(invite), e.currentTarget.getBoundingClientRect())}
              >
                <UserAvatar url={invite.inviterAvatar} name={invite.inviterName} email={invite.inviterEmail} size={24} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{invite.taskTitle}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    from {invite.inviterName || invite.inviterEmail}
                    {invite.taskDueDate && (
                      <span className="ml-1.5">
                        , due {new Date(invite.taskDueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-1.5 px-3 md:px-4 pb-2.5 pt-0.5">
                <Button size="sm" onClick={() => onRespond?.(invite.shareId, "accept")}>
                  Accept
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onRespond?.(invite.shareId, "decline")}>
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
