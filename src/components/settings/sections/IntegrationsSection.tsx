"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import IntegrationHealthBanner from "@/components/settings/IntegrationHealthBanner";
import McpSettings from "@/components/settings/McpSettings";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import SectionHeading from "@/components/ui/SectionHeading";
import TextArea from "@/components/ui/TextArea";

/**
 * Example platforms for the request form. Brightspace is an integration we
 * already offer, so it no longer appears here.
 */
export const REQUEST_PLACEHOLDER = "e.g. Schoology, Moodle, Sakai...";

/**
 * Integrations settings section.
 *
 * The list itself is IntegrationList, which groups every integration into
 * connected and available. This is the frame around it: the heading, the
 * health banner, the MCP block, and the request form.
 *
 * There is no longer an "add integration" dropdown in the header. It listed
 * exactly the same platforms the page already renders as rows.
 *
 * Must be rendered inside an IntegrationProvider.
 */
export default function IntegrationsSection() {
  return (
    <section>
      <SectionHeading
        title="Integrations"
        description="Connect your accounts to sync assignments and events."
      />
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
 * Trigger button + modal letting users request a platform their school uses
 * that caltodo does not yet integrate with. Submits via /api/contact prefixed
 * with [Platform request] so it can be filtered.
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
              <Plus size={16} className="text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Request a platform</p>
              <p className="text-xs text-muted-foreground truncate">
                Don&apos;t see one your school offers? Tell us.
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-blue-500 shrink-0">Submit</span>
        </button>
      </div>
      <RequestPlatformModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** How long the "Thanks" line shows before the modal closes itself. */
const SENT_CLOSE_MS = 800;

/**
 * Modal with the platform-request form, built on Modal (dialog role, focus
 * trap, Escape, backdrop click). Closes after a successful submission.
 *
 * @param open - Controls visibility
 * @param onClose - Dismisses the modal
 */
function RequestPlatformModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      setMessage("");
      setStatus("idle");
    }
  }, [open]);

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
      if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
      setStatus("sent");
      setTimeout(onClose, SENT_CLOSE_MS);
    } catch (err) {
      console.error("RequestPlatformModal: submit failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "the request was not sent",
      });
      setStatus("error");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Don't see a platform your school offers?"
      description="Tell us which one and we'll add it."
      size="lg"
      initialFocusRef={textareaRef}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <TextArea
          ref={textareaRef}
          label="Platform"
          hideLabel
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={REQUEST_PLACEHOLDER}
          rows={4}
          maxLength={2000}
          disabled={status === "sending"}
          error={status === "error" ? "Something went wrong. Try again." : undefined}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" role="status">
            {status === "sent" && "Thanks, we got it."}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!message.trim()} loading={status === "sending"}>
              Submit
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
