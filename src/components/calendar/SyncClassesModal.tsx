"use client";

import { IntegrationProvider } from "@/components/settings/IntegrationSettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import Modal from "@/components/ui/Modal";

/**
 * Modal that surfaces the user's connected integrations (and their classes)
 * without leaving the calendar. Renders only the connected cards: this is
 * about the classes already syncing, not about signing up for platforms.
 *
 * Built on Modal, whose dialog stack scopes Escape to the topmost dialog, so
 * a nested CourseSelectModal closes first and this one stays open.
 *
 * @param open - Controls visibility
 * @param onClose - Dismiss handler (Escape, backdrop, close button)
 */
export default function SyncClassesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Your classes" size="lg">
      <IntegrationProvider>
        <IntegrationSettings connectedOnly />
      </IntegrationProvider>
    </Modal>
  );
}
