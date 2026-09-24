"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import PushToggle from "@/components/settings/notifications/PushToggle";
import EmailDigestSettings from "@/components/settings/notifications/EmailDigestSettings";
import ReminderRules from "@/components/settings/notifications/ReminderRules";

/**
 * Notifications settings section: push on this device, the daily email
 * digest, and the reminder rules that drive push.
 *
 * Must be rendered inside an IntegrationProvider (the digest reads the
 * shared credentials).
 */
export default function NotificationsSection() {
  return (
    <section>
      <SectionHeading
        title="Notifications"
        description="Reminders on this device and a daily summary by email."
      />
      <div className="space-y-6">
        <PushToggle />
        <ReminderRules />
        <EmailDigestSettings />
      </div>
    </section>
  );
}
