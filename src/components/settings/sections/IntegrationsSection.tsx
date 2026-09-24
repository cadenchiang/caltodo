"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import IntegrationHealthBanner from "@/components/settings/IntegrationHealthBanner";
import McpSettings from "@/components/settings/McpSettings";

/**
 * Integrations settings section.
 *
 * The list itself is IntegrationList, which groups every integration into
 * connected and available. This is the frame around it: the heading, the
 * health banner, the MCP block, and the request form.
 *
 * There is no longer an "add integration" dropdown in the header. It listed
 * exactly the same platforms the page already renders as rows, so it was a
 * second, shorter copy of the list you were looking at, and the only thing it
 * could do that the rows could not was start a second Canvas school - which
 * every multi-account integration now offers in its own group.
 *
 * Must be rendered inside an IntegrationProvider.
 */
export default function IntegrationsSection() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Integrations</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Connect your accounts to sync assignments and events.
      </p>
      <IntegrationHealthBanner />
      <IntegrationSettings />
      <div className="mt-8 pt-6 border-t border-border">
        <McpSettings />
      </div>
      <RequestPlatformForm />
    </section>
  );
}

/**
 * Trigger button + popup modal letting users request a platform their
 * school uses that caltodo doesn't yet integrate with.
 * Submits via /api/contact prefixed with [Platform request] so it can be filtered.
 */
function RequestPlatformForm() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-6 pt-5 border-t border-border">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-dashed border-border bg-card hover:bg-accent hover:border-foreground/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0 text-left">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Plus size={16} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Request a platform
              </p>
              <p className="text-xs text-subtle-foreground truncate">
                Don&apos;t see one your school offers? Tell us.
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#0e89d6] shrink-0">Submit</span>
        </button>
      </div>
      <RequestPlatformModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Duration the exit animation runs (matches .animate-announce-card-out in globals.css). */
const CLOSE_ANIM_MS = 220;

/**
 * Centered popup modal with the platform-request form. Matches the Contact Us
 * modal's size + open/close animation for visual consistency.
 * Closes on Escape, on backdrop click, and after a successful submission.
 * Submits to /api/contact with a "[Platform request]" prefix so it emails via
 * Resend with a dedicated subject.
 */
function RequestPlatformModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [closing, setClosing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Play the exit animation, then call the parent's onClose. */
  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, CLOSE_ANIM_MS);
  }, [closing, onClose]);

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    if (!open) {
      setMessage("");
      setStatus("idle");
      setClosing(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, requestClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Platform request",
          email: null,
          message: `[Platform request] ${message.trim()}`,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("sent");
      setTimeout(requestClose, 800);
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${closing ? "animate-announce-backdrop-out" : "animate-announce-backdrop-in"}`}
        onClick={requestClose}
      />
      <div
        className={`relative w-full w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 ${closing ? "animate-announce-card-out" : "animate-announce-card-in"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-foreground mb-1">
          Don&apos;t see a platform your school offers?
        </h3>
        <p className="text-xs text-subtle-foreground mb-4">
          Tell us which one and we&apos;ll add it.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Schoology, Brightspace, Moodle..."
            rows={4}
            maxLength={2000}
            disabled={status === "sending"}
            className="w-full rounded-xl border border-input-border bg-transparent px-3.5 py-3 text-sm text-foreground placeholder:text-subtle-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-subtle-foreground">
              {status === "sent" && "Thanks, we got it."}
              {status === "error" && "Something went wrong. Try again."}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={requestClose}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!message.trim() || status === "sending"}
                className="px-4 py-1.5 rounded-lg bg-[#0e89d6] text-white text-sm font-medium hover:bg-[#3D8FE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
