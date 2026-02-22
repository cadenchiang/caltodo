"use client";

import { Suspense } from "react";
import SettingsContent from "./SettingsContent";

/**
 * Settings page entry point.
 * Suspense boundary required because SettingsContent uses useSearchParams.
 */
export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
