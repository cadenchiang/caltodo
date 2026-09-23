"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import { ACTIONS } from "@/lib/copy";

interface ContactModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
  /** Pre-filled user name from profile. */
  userName?: string | null;
  /** Pre-filled user email from profile. */
  userEmail?: string | null;
}

/**
 * Contact form in a Modal. Submits to /api/contact which stores the message
 * server-side; the destination email is hidden from the client.
 *
 * @param open - Controls visibility
 * @param onClose - Callback to dismiss
 * @param userName - Pre-filled name from auth
 * @param userEmail - Pre-filled email from auth
 */
export default function ContactModal({ open, onClose, userName, userEmail }: ContactModalProps) {
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Closes the modal and clears the draft so the next open starts empty. */
  function handleClose() {
    setMessage("");
    onClose();
  }

  /**
   * Submits the contact form to the API endpoint.
   * Shows a toast on success or failure.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName || "Anonymous",
          email: userEmail || null,
          message: trimmed,
        }),
      });

      if (res.ok) {
        showToast("Message sent! We'll get back to you soon.");
        handleClose();
      } else {
        showToast("Failed to send message. Please try again.");
      }
    } catch {
      showToast("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Contact us"
      description={
        userName || userEmail ? (
          <>
            Sending as <span className="font-medium text-foreground">{userName || userEmail}</span>
          </>
        ) : undefined
      }
      size="lg"
      initialFocusRef={textareaRef}
    >
      <form id="contact-form" onSubmit={handleSubmit}>
        <TextArea
          ref={textareaRef}
          label="Message"
          hideLabel
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help? Share feedback, report a bug, or ask a question..."
          rows={5}
          className="resize-none"
        />
        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            variant="inverted"
            loading={submitting}
            disabled={!message.trim()}
            leadingIcon={<Send size={13} />}
          >
            {submitting ? "Sending..." : ACTIONS.send}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
