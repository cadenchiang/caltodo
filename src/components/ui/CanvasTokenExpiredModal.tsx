"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import type { IntegrationCredentials } from "@/lib/types";
import { getCredentials } from "@/lib/credentials-client";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ACTIONS } from "@/lib/copy";

/** localStorage key to suppress modal for 24 hours after dismissal. */
const DISMISS_KEY = "caltodo_canvas_token_expired_dismissed";

/** Number of days before a Canvas token expires. */
const TOKEN_EXPIRY_DAYS = 120;

/** Number of hours to suppress modal after dismissal. */
const DISMISS_HOURS = 24;

/**
 * Checks if the user dismissed the modal within the last 24 hours.
 *
 * @returns true if modal should be suppressed
 */
function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    return Date.now() - dismissedAt < DISMISS_HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Modal that warns users when their bCourses API key has expired (120 days).
 * Only shown when has_canvas_token is true AND canvas_token_created_at + 120 days < now.
 * Does NOT show when no token is stored (user not connected).
 * Dismissal is stored in localStorage for 24 hours.
 */
export default function CanvasTokenExpiredModal() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isDismissed()) return;

    async function checkExpiration() {
      try {
        const creds = (await getCredentials()) as IntegrationCredentials | null;
        if (!creds) return;

        // Only show if user has a canvas token AND it has a creation date
        if (!creds.has_canvas_token || !creds.canvas_token_created_at) return;

        const createdAt = new Date(creds.canvas_token_created_at).getTime();
        const expiresAt = createdAt + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        if (Date.now() > expiresAt) {
          setShow(true);
        }
      } catch {
        // Non-critical — silently skip
      }
    }

    checkExpiration();
  }, []);

  /**
   * Dismisses the modal and stores dismissal timestamp in localStorage.
   */
  function handleDismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // non-critical
    }
  }

  return (
    <Modal
      open={show}
      onClose={handleDismiss}
      size="sm"
      hideClose
      aria-label="Your Canvas API key has expired"
      className="text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-warning-tint flex items-center justify-center">
          <AlertTriangle size={24} className="text-warning" aria-hidden="true" />
        </div>
      </div>

      <h2 className="text-base font-semibold text-foreground mb-2">
        Your Canvas API key has expired
      </h2>

      <p className="text-sm text-muted-foreground mb-6">
        Canvas API keys expire after 120 days. Please generate a new one in Settings to continue syncing assignments.
      </p>

      <div className="flex flex-col gap-2">
        <Button
          variant="inverted"
          className="w-full"
          onClick={() => {
            setShow(false);
            router.push("/app/settings");
          }}
        >
          {ACTIONS.goToSettings}
        </Button>
        <Button variant="ghost" className="w-full" onClick={handleDismiss}>
          {ACTIONS.dismiss}
        </Button>
      </div>
    </Modal>
  );
}
