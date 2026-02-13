"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import IntegrationSettings from "@/components/settings/IntegrationSettings";

/**
 * Settings page for configuring Canvas and Gradescope integrations.
 * Includes a button to redo the onboarding wizard.
 */
export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex h-full -m-10">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
        </div>
        <div className="flex-1 overflow-auto px-8 pb-8">
          <IntegrationSettings />

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => router.push("/app/onboarding")}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <RotateCcw size={15} />
              Redo Setup Wizard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
