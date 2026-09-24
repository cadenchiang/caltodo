"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import ChatModal from "./ChatModal";
import { REPORT_REASONS, type ReportReason } from "@/lib/chat-report-reasons";
import { friendlyChatError } from "@/lib/chat-errors";

/**
 * Props for ReportMessageModal.
 *
 * @param messageId - The message being reported (null closes the modal)
 * @param onClose - Close handler
 * @param onReported - Called after a successful report, for a toast
 */
interface ReportMessageModalProps {
  messageId: string | null;
  onClose: () => void;
  onReported: () => void;
}

/**
 * Report dialog with a reason select. Replaces window.confirm / alert.
 * The API accepts one report per user per message; a repeat is shown as
 * "already reported" rather than an error.
 */
export default function ReportMessageModal({ messageId, onClose, onReported }: ReportMessageModalProps) {
  const [reason, setReason] = useState<ReportReason>("spam");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const selectId = useId();
  const helpId = useId();

  // Fresh state for every message
  useEffect(() => {
    setReason("spam");
    setError(null);
    setSubmitting(false);
  }, [messageId]);

  /** Submits the report. */
  async function handleSubmit() {
    if (!messageId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/discussions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, reason }),
      });
      if (res.ok || res.status === 409) {
        onReported();
        onClose();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(friendlyChatError(res.status, data.error, "send your report"));
    } catch {
      setError(friendlyChatError(0, null, "send your report"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ChatModal
      open={messageId !== null}
      onClose={onClose}
      title="Report message"
      size="sm"
      initialFocusRef={selectRef}
      describedBy={helpId}
      dismissible={!submitting}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            aria-busy={submitting}
            className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            Send report
          </button>
        </>
      }
    >
      <p id={helpId} className="text-sm text-muted-foreground">
        A caltodo admin will review this message. The sender is not told who reported it.
      </p>
      <div>
        <label htmlFor={selectId} className="text-xs font-medium text-foreground">
          Reason
        </label>
        <select
          id={selectId}
          ref={selectRef}
          value={reason}
          onChange={(e) => setReason(e.target.value as ReportReason)}
          className="mt-1.5 w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {(Object.keys(REPORT_REASONS) as ReportReason[]).map((key) => (
            <option key={key} value={key}>
              {REPORT_REASONS[key]}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </ChatModal>
  );
}
