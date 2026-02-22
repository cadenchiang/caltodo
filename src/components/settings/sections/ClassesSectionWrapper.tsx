"use client";

import { IntegrationClasses } from "@/components/settings/IntegrationSettings";

/**
 * Classes settings section wrapper.
 * Renders the course-selection chips and edit modal.
 * Must be rendered inside an IntegrationProvider.
 */
export default function ClassesSectionWrapper() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Classes</h2>
      <p className="text-xs text-subtle-foreground mb-4">
        Choose which classes to sync assignments from.
      </p>
      <IntegrationClasses />
    </section>
  );
}
