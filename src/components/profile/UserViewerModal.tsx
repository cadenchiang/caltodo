"use client";

import { useEffect, useId, useState } from "react";
import { Check, Flag, UserMinus, UserPlus, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import IconButton from "@/components/ui/IconButton";
import Modal from "@/components/ui/Modal";
import UserAvatar from "@/components/ui/UserAvatar";
import { FIELD_INPUT, FIELD_LABEL } from "@/components/ui/field-recipe";
import { getRelationship, REPORT_REASONS, type FriendLists, type SearchUser } from "./profile-utils";

interface UserViewerModalProps {
  /** The person being viewed, or null when closed. */
  user: SearchUser | null;
  /** Current friend lists, for the relationship and friendship ids. */
  lists: FriendLists;
  /** True while a request is being sent. */
  sending: boolean;
  onClose: () => void;
  onSend: (userId: string) => Promise<unknown>;
  onRespond: (friendshipId: string, action: "accept" | "decline") => Promise<void>;
  onRemove: (friendshipId: string) => Promise<void>;
}

/** Which secondary confirmation is open over the viewer. */
type Pending = "remove" | "report" | null;

/**
 * Another user's profile: avatar, name, email, friend count, and the one
 * action that fits the relationship. Report and remove-friend both confirm
 * through ConfirmDialog; the report dialog takes a reason.
 *
 * @param user - Person to show; null closes the modal
 * @param lists - For getRelationship and to find friendship ids
 */
export default function UserViewerModal({ user, lists, sending, onClose, onSend, onRespond, onRemove }: UserViewerModalProps) {
  const { showToast } = useToast();
  const reasonId = useId();
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFriendCount(null);
    setPending(null);
    setReason(REPORT_REASONS[0]);
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/friends/count?userId=${encodeURIComponent(user.id)}`);
        if (!res.ok) throw new Error(`Count failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setFriendCount(data.count ?? 0);
      } catch (err) {
        console.warn("UserViewerModal: friend count failed", {
          userId: user.id,
          error: err instanceof Error ? err.message : String(err),
          impact: "the count is hidden",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const rel = getRelationship(user.id, lists);
  const friendship = lists.friends.find((f) => f.userId === user.id);
  const received = lists.pendingReceived.find((r) => r.userId === user.id);
  const sent = lists.pendingSent.find((r) => r.userId === user.id);
  const name = user.full_name || "Unnamed";

  /** Submits the report with the chosen reason. */
  async function handleReport() {
    setBusy(true);
    try {
      const res = await fetch("/api/users/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user!.id, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Report failed: ${res.status}`);
      }
      showToast("Report submitted. Thank you.");
      setPending(null);
    } catch (err) {
      console.error("UserViewerModal: report failed", {
        userId: user!.id,
        error: err instanceof Error ? err.message : String(err),
        impact: "no report was sent",
      });
      showToast(err instanceof Error ? err.message : "Failed to submit report.", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  /** Removes the friendship after confirmation, then closes the viewer. */
  async function handleRemove() {
    if (!friendship) return;
    setBusy(true);
    try {
      await onRemove(friendship.friendshipId);
    } finally {
      setBusy(false);
      setPending(null);
      onClose();
    }
  }

  return (
    <>
      <Modal open onClose={onClose} aria-label={`${name}'s profile`} size="sm">
        <div className="absolute top-4 right-14">
          <IconButton aria-label={`Report ${name}`} onClick={() => setPending("report")} className="hover:text-red-500">
            <Flag size={14} />
          </IconButton>
        </div>
        <div className="flex items-center gap-4 pr-16">
          <UserAvatar url={user.avatar_url} name={user.full_name} email={user.email} size={64} />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">{name}</h3>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {friendCount !== null && (
              <p className="text-sm text-foreground mt-1">
                <span className="font-semibold">{friendCount}</span> {friendCount === 1 ? "friend" : "friends"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          {rel === "friend" ? (
            <Button variant="secondary" className="w-full" leadingIcon={<UserMinus size={14} />} onClick={() => setPending("remove")}>
              Remove friend
            </Button>
          ) : rel === "pending_received" && received ? (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                leadingIcon={<Check size={14} />}
                onClick={async () => {
                  await onRespond(received.friendshipId, "accept");
                  onClose();
                }}
              >
                Accept
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={async () => {
                  await onRespond(received.friendshipId, "decline");
                  onClose();
                }}
              >
                Decline
              </Button>
            </div>
          ) : rel === "pending_sent" && sent ? (
            <Button
              variant="secondary"
              className="w-full"
              leadingIcon={<X size={14} />}
              onClick={async () => {
                await onRemove(sent.friendshipId);
                onClose();
              }}
            >
              Cancel request
            </Button>
          ) : (
            <Button
              className="w-full"
              leadingIcon={<UserPlus size={14} />}
              disabled={sending}
              onClick={async () => {
                await onSend(user.id);
                onClose();
              }}
            >
              Add friend
            </Button>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={pending === "remove"}
        title={`Remove ${name} as a friend?`}
        body="They will not be notified. You can send a new request later."
        confirmLabel="Remove friend"
        destructive
        loading={busy}
        onConfirm={handleRemove}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending === "report"}
        title={`Report ${name}?`}
        confirmLabel="Submit report"
        destructive
        loading={busy}
        onConfirm={handleReport}
        onCancel={() => setPending(null)}
        body={
          <div className="text-left">
            <p>Reports go to the caltodo team. The person is not told who reported them.</p>
            <label htmlFor={reasonId} className={`${FIELD_LABEL} mt-4`}>
              Reason
            </label>
            <select id={reasonId} value={reason} onChange={(e) => setReason(e.target.value)} className={FIELD_INPUT}>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </>
  );
}
