"use client";

import Modal from "@/components/ui/Modal";
import { IntegrationProvider } from "@/components/settings/IntegrationSettings";
import IntegrationsSection from "@/components/settings/sections/IntegrationsSection";

/**
 * Dialog that surfaces the full Integrations panel (Google Calendar,
 * Canvas, Gradescope, Pensive, Syllabus) without leaving the calendar or
 * the inbox. Built on Modal, so Escape closes only the topmost dialog (a
 * confirm opened inside no longer closes both), focus is trapped and
 * restored, and scroll is locked.
 *
 * @param open - Whether the dialog is rendered
 * @param onClose - Dismiss callback
 */
export default function SyncClassesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" aria-label="Sync classes">
      <IntegrationProvider>
        <IntegrationsSection />
      </IntegrationProvider>
    </Modal>
  );
}
