"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

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

/** Duration the exit animation runs (matches .animate-announce-card-out in globals.css). */
const CLOSE_ANIM_MS = 220;

/**
 * Centered popup modal with a contact form.
 * Submits to /api/contact which stores the message server-side.
 * The destination email is hidden from the client.
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
  /** When true, the modal is playing its exit animation and will unmount in ~220ms. */
  const [closing, setClosing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Begin the exit animation, then call the parent's onClose after it finishes.
   * Prevents the dismiss from happening synchronously so the exit animation can play.
   */
  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, CLOSE_ANIM_MS);
  }, [closing, onClose]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    if (!open) {
      setMessage("");
      setClosing(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, requestClose]);

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
        requestClose();
      } else {
        showToast("Failed to send message. Please try again.");
      }
    } catch {
      showToast("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${closing ? "animate-announce-backdrop-out" : "animate-announce-backdrop-in"}`}
        onClick={requestClose}
      />

      {/* Modal */}
      <div className={`relative bg-card rounded-2xl border border-border shadow-2xl w-full w-[calc(100%-2rem)] max-w-lg ${closing ? "animate-announce-card-out" : "animate-announce-card-in"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle size={15} className="text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Contact Us</h2>
          </div>
          <button
            onClick={requestClose}
            className="p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Pre-filled user info (read-only) */}
          {(userName || userEmail) && (
            <div className="text-xs text-foreground">
              Sending as <span className="font-bold text-foreground">{userName || userEmail}</span>
            </div>
          )}

          {/* Message */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help? Share feedback, report a bug, or ask a question..."
            rows={5}
            className="w-full text-sm text-foreground bg-transparent border border-input-border rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none placeholder-subtle-foreground transition-all"
          />

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!message.trim() || submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={13} />
              {submitting ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
