"use client";

import { useState, useEffect, useCallback } from "react";
import { Flag, Ban, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatModal from "./ChatModal";
import ChatConfirmDialog from "./ChatConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { setUserBlocked } from "@/hooks/useBlockedUsers";
import { platformLabel } from "@/lib/chat-room-groups";
import { REPORT_REASONS, type ReportReason } from "@/lib/chat-report-reasons";
import { friendlyChatError } from "@/lib/chat-errors";

/** Shared course entry returned by the profile API. */
interface SharedCourse {
  id: string;
  name: string;
  source: string;
}

/**
 * Props for the UserProfileModal component.
 *
 * @param userId - The target user's UUID
 * @param onClose - Callback to close the modal
 * @param blocked - Whether the viewer has blocked this user
 */
interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  blocked?: boolean;
}

/**
 * A classmate's profile: name, avatar, shared classes, report (with a
 * reason) and block (hides their messages for you; they are not told).
 * No scores or friend counts (D6).
 */
export default function UserProfileModal({ userId, onClose, blocked = false }: UserProfileModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [sharedCourses, setSharedCourses] = useState<SharedCourse[]>([]);
  const [isBlocked, setIsBlocked] = useState(blocked);
  const [busy, setBusy] = useState<"report" | "block" | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<ReportReason>("harassment");
  const [confirmBlock, setConfirmBlock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/discussions/profile?userId=${encodeURIComponent(userId)}`)
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setUserName(data.userName);
        setUserAvatar(data.userAvatar);
        setSharedCourses(data.sharedCourses ?? []);
      })
      .catch(() => { /* the modal still offers report and block */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  /** Reports the user with the chosen reason. */
  const handleReport = useCallback(async () => {
    setBusy("report");
    try {
      const res = await fetch("/api/users/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reason: REPORT_REASONS[reason] }),
      });
      if (res.ok) {
        showToast("Thanks, an admin will take a look.");
        setReporting(false);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(friendlyChatError(res.status, data.error, "send your report"), { variant: "error" });
      }
    } catch {
      showToast(friendlyChatError(0, null, "send your report"), { variant: "error" });
    } finally {
      setBusy(null);
    }
  }, [userId, reason, showToast]);

  /** Blocks or unblocks the user. */
  const handleBlockToggle = useCallback(async () => {
    setBusy("block");
    const ok = await setUserBlocked(userId, !isBlocked);
    setBusy(null);
    setConfirmBlock(false);
    if (!ok) {
      showToast(`We couldn't ${isBlocked ? "unblock" : "block"} that person. Try again.`, { variant: "error" });
      return;
    }
    setIsBlocked(!isBlocked);
    showToast(isBlocked ? "Unblocked. Their messages show again." : "Blocked. Their messages are hidden for you.");
  }, [userId, isBlocked, showToast]);

  const name = userName || "Classmate";

  return (
    <>
      <ChatModal
        open
        onClose={onClose}
        title={loading ? "Profile" : name}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setReporting((v) => !v)}
              aria-expanded={reporting}
              className="px-3 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Flag size={14} aria-hidden="true" />
              Report
            </button>
            <button
              type="button"
              onClick={() => (isBlocked ? handleBlockToggle() : setConfirmBlock(true))}
              disabled={busy === "block"}
              className="px-3 py-2 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {busy === "block" ? <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Ban size={14} aria-hidden="true" />}
              {isBlocked ? "Unblock" : "Block"}
            </button>
          </>
        }
      >
        {loading ? (
          <div className="flex items-center gap-4 animate-pulse motion-reduce:animate-none" aria-hidden="true">
            <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-3 bg-muted rounded w-20" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="w-16 h-16 rounded-full shrink-0 object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-medium text-muted-foreground shrink-0" aria-hidden="true">
                {name[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground truncate">{name}</p>
              {isBlocked && <p className="text-xs text-muted-foreground">Blocked. Their messages are hidden for you.</p>}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-foreground mb-2">Shared classes</p>
          {sharedCourses.length === 0 ? (
            <p className="text-xs text-muted-foreground">No shared classes.</p>
          ) : (
            <ul className="space-y-1 list-none">
              {sharedCourses.map((course) => (
                <li key={course.id}>
                  <button
                    type="button"
                    onClick={() => { router.push(`/app/discussions/${course.id}`); onClose(); }}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-foreground truncate flex-1">{course.name}</span>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{platformLabel(course.source)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {reporting && (
          <div className="rounded-xl border border-border p-3 space-y-2">
            <label htmlFor="profile-report-reason" className="text-xs font-medium text-foreground">Why are you reporting {name}?</label>
            <select
              id="profile-report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(Object.keys(REPORT_REASONS) as ReportReason[]).map((key) => (
                <option key={key} value={key}>{REPORT_REASONS[key]}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleReport}
              disabled={busy === "report"}
              className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {busy === "report" && <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              Send report
            </button>
          </div>
        )}
      </ChatModal>

      <ChatConfirmDialog
        open={confirmBlock}
        title={`Block ${name}?`}
        description="Their messages are hidden for you in every chat. They are not told, and you can unblock them any time from their profile."
        confirmLabel="Block"
        destructive
        loading={busy === "block"}
        onConfirm={handleBlockToggle}
        onCancel={() => setConfirmBlock(false)}
      />
    </>
  );
}
